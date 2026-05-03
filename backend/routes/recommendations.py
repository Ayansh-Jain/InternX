"""
Routes for the personalized job recommendation engine.
"""

from fastapi import APIRouter, HTTPException, status, Depends, Query
from datetime import datetime
from bson import ObjectId
from typing import Optional, List
import logging
import numpy as np
import traceback

from models.job import JobStatus
from models.interaction import InteractionCreate
from auth.dependencies import require_job_searcher
from database import Database, JOBS_COLLECTION, USERS_COLLECTION, INTERACTIONS_COLLECTION, APPLICATIONS_COLLECTION
from services.recommendation_engine import RecommendationEngine, RecommendationCache
from services.linucb_bandit import get_bandit, INTERACTION_REWARDS
from routes.jobs import job_to_response

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

engine = RecommendationEngine()
cache = RecommendationCache()


@router.post("/interact", status_code=status.HTTP_200_OK)
async def log_interaction(
    interaction: InteractionCreate,
    current_user: dict = Depends(require_job_searcher)
):
    """
    Log a job seeker's interaction with a job and update their preference vector.
    """
    # Ensure user_id matches current user
    if str(current_user["_id"]) != interaction.user_id:
        raise HTTPException(status_code=403, detail="Unauthorized")

    jobs_collection = Database.get_collection(JOBS_COLLECTION)
    users_collection = Database.get_collection(USERS_COLLECTION)
    interactions_collection = Database.get_collection(INTERACTIONS_COLLECTION)

    # 1. Get job details for vectorization
    job = await jobs_collection.find_one({"_id": ObjectId(interaction.job_id)})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # 2. Get current user preference vector
    user = await users_collection.find_one({"_id": current_user["_id"]})
    current_preference_vector = user.get("preference_vector", [])

    # 3. Get all active jobs to build/get consistent vocabulary
    active_jobs_cursor = jobs_collection.find({"status": JobStatus.ACTIVE.value})
    active_jobs = await active_jobs_cursor.to_list(length=None)
    vocab = engine.build_vocabulary(active_jobs)

    # 4. Generate job feature vector
    job_vector = engine.job_to_feature_vector(job, vocab)

    # 5. Update user preference vector
    updated_vector = engine.update_preference_vector(
        current_vector=current_preference_vector,
        job_vector=job_vector,
        action=interaction.action.value,
        vocab_size=len(vocab)
    )

    # 6. Persist interaction and updated vector
    now = datetime.utcnow()
    interaction_doc = {
        "user_id": interaction.user_id,
        "job_id": interaction.job_id,
        "action": interaction.action.value,
        "job_vector": job_vector,
        "timestamp": now
    }
    await interactions_collection.insert_one(interaction_doc)

    await users_collection.update_one(
        {"_id": ObjectId(interaction.user_id)},
        {"$set": {"preference_vector": updated_vector, "updated_at": now}}
    )

    # 5b. Online LinUCB update ────────────────────────────────────────
    import numpy as np
    bandit = get_bandit()
    reward = INTERACTION_REWARDS.get(interaction.action.value, 0.0)
    
    # Context is [user_pref, job_features]
    if len(updated_vector) == len(vocab) and len(job_vector) == len(vocab):
        context = np.concatenate([
            np.array(updated_vector, dtype=np.float64),
            np.array(job_vector, dtype=np.float64),
        ])
        bandit.update(interaction.job_id, context, reward)

    # 6. Invalidate cache for this user
    cache.invalidate_prefix(f"recs_{interaction.user_id}")

    return {"message": "Interaction logged", "status": "success"}

@router.get("/likes")
async def get_liked_jobs(current_user: dict = Depends(require_job_searcher)):
    """
    Get all job IDs that the current user has liked.
    """
    interactions_collection = Database.get_collection(INTERACTIONS_COLLECTION)
    user_id = str(current_user["_id"])
    cursor = interactions_collection.find({"user_id": user_id, "action": "like"})
    interactions = await cursor.to_list(length=None)
    liked_job_ids = list(set([i["job_id"] for i in interactions]))
    return {"liked_job_ids": liked_job_ids}

@router.delete("/likes/{job_id}")
async def unlike_job(job_id: str, current_user: dict = Depends(require_job_searcher)):
    """
    Remove a like interaction for a job.
    """
    interactions_collection = Database.get_collection(INTERACTIONS_COLLECTION)
    user_id = str(current_user["_id"])
    await interactions_collection.delete_many({
        "user_id": user_id,
        "job_id": job_id,
        "action": "like"
    })
    return {"status": "success"}

@router.get("/feed")
async def get_recommendation_feed(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(require_job_searcher)
):
    """
    Get a personalized feed of recommended jobs for the current user.
    """
    try:
        user_id = str(current_user["_id"])
        cache_key = f"recs_{user_id}_p{page}_l{limit}"
        
        # 1. Check cache (Bypassed for debugging)
        # cached_result = cache.get(cache_key)
        # if cached_result:
        #     return cached_result

        jobs_collection = Database.get_collection(JOBS_COLLECTION)
        users_collection = Database.get_collection(USERS_COLLECTION)
        apps_collection = Database.get_collection(APPLICATIONS_COLLECTION)

        # 2. Re-fetch user to get latest preference vector
        user = await users_collection.find_one({"_id": current_user["_id"]})
        preference_vector = user.get("preference_vector", [])

        # 3. Get all active jobs
        active_jobs_cursor = jobs_collection.find({"status": JobStatus.ACTIVE.value})
        active_jobs = await active_jobs_cursor.to_list(length=None)
        
        # 4. Get applied job IDs to exclude them
        apps_cursor = apps_collection.find({"applicant_id": user_id})
        apps = await apps_cursor.to_list(length=None)
        applied_job_ids = {str(app["job_id"]) for app in apps}

        # 5. Build/Get Vocabulary
        vocab = engine.build_vocabulary(active_jobs)

        # 6. Get recommendations
        ranked_jobs = engine.get_recommendations(
            user_vector=preference_vector,
            jobs=active_jobs,
            vocab=vocab,
            applied_job_ids=applied_job_ids,
            limit=len(active_jobs)
        )

        # Log top 5 preference terms for debugging
        if preference_vector and len(preference_vector) == len(vocab):
            inv_vocab = {v: k for k, v in vocab.items()}
            pref_np = np.array(preference_vector)
            top_indices = np.argsort(pref_np)[-5:][::-1]
            top_terms = [f"{inv_vocab[i]} ({pref_np[i]:.2f})" for i in top_indices if pref_np[i] > 0]
            logger.info(f"User {user_id} top preferences: {', '.join(top_terms)}")

        # 7. Pagination with safety fallback
        if not ranked_jobs:
            logger.warning(f"Recommendation engine returned 0 jobs for user {user_id}. Using fallback.")
            # Fallback to all active jobs, sorted by recency
            fallback_jobs = sorted(active_jobs, key=lambda x: x.get("created_at", datetime.min), reverse=True)
            ranked_jobs = [(job, 0) for job in fallback_jobs if str(job["_id"]) not in applied_job_ids]

        skip = (page - 1) * limit
        paginated_jobs = ranked_jobs[skip : skip + limit]

        # 8. Enrich with provider info and match details
        job_responses = []
        
        # Batch fetch providers
        provider_ids = {str(job.get("provider_id")) for job, _ in paginated_jobs if job.get("provider_id")}
        provider_docs = await users_collection.find({"_id": {"$in": [ObjectId(pid) for pid in provider_ids]}}).to_list(length=None)
        providers_map = {str(p["_id"]): p for p in provider_docs}

        from routes.jobs import calculate_match_details

        for job, score in paginated_jobs:
            provider = providers_map.get(str(job["provider_id"]))
            match_details = calculate_match_details(user, job)
            job_res = job_to_response(job, provider, match_details)
            
            if score > 0:
                if job_res.match_percentage is None or job_res.match_percentage < 10:
                     job_res.match_percentage = score
                else:
                     job_res.match_percentage = int(0.7 * score + 0.3 * job_res.match_percentage)
                     
            if job_res.match_percentage is None:
                job_res.match_percentage = 0
                
            job_responses.append(job_res)

        logger.info(f"Returning {len(job_responses)} recommended jobs for user {user_id}")

        result = {
            "jobs": job_responses,
            "total": len(ranked_jobs),
            "page": page,
            "limit": limit
        }

        # 9. Cache result
        try:
            cache.set(cache_key, result)
        except Exception as e:
            logger.error(f"Cache set failed: {e}")

        return result

    except Exception as e:
        logger.error(f"Error in recommendation feed: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
