"""
Routes for the personalized job recommendation engine.
"""

from fastapi import APIRouter, HTTPException, status, Depends, Query
from datetime import datetime
from bson import ObjectId
from typing import Optional, List

from models.job import JobStatus
from models.interaction import InteractionCreate
from auth.dependencies import require_job_searcher
from database import Database, JOBS_COLLECTION, USERS_COLLECTION, INTERACTIONS_COLLECTION, APPLICATIONS_COLLECTION
from services.recommendation_engine import RecommendationEngine, RecommendationCache
from services.linucb_bandit import get_bandit, INTERACTION_REWARDS
from routes.jobs import job_to_response

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
    if str(current_user["_id"]) != interaction.user_id:
        raise HTTPException(status_code=403, detail="Can only log interactions for yourself")

    jobs_collection = Database.get_collection(JOBS_COLLECTION)
    users_collection = Database.get_collection(USERS_COLLECTION)
    interactions_collection = Database.get_collection(INTERACTIONS_COLLECTION)

    # 1. Fetch job
    job = await jobs_collection.find_one({"_id": ObjectId(interaction.job_id)})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # 2. Build vocabulary
    # Let's get active jobs to build/fetch the vocab
    active_jobs_cursor = jobs_collection.find({"status": JobStatus.ACTIVE.value})
    active_jobs = await active_jobs_cursor.to_list(length=None)
    vocab = engine.build_vocabulary(active_jobs)
    
    # 3. Vectorize the job
    job_vector = engine.job_to_feature_vector(job, vocab)

    # 4. Store the interaction
    now = datetime.utcnow()
    interaction_doc = {
        "user_id": interaction.user_id,
        "job_id": interaction.job_id,
        "action": interaction.action.value,
        "job_vector": job_vector,
        "timestamp": now
    }
    await interactions_collection.insert_one(interaction_doc)

    # 5. Update user's preference vector
    current_preference_vector = current_user.get("preference_vector", [])
    
    updated_vector = engine.update_preference_vector(
        current_vector=current_preference_vector,
        job_vector=job_vector,
        action=interaction.action.value,
        vocab_size=len(vocab)
    )

    await users_collection.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"preference_vector": updated_vector}}
    )

    # 5b. Online LinUCB update ────────────────────────────────────────
    # Context = concat of the UPDATED user preference vector + job vector.
    # This means the bandit immediately sees who the user is becoming.
    import numpy as np
    bandit = get_bandit()
    reward = INTERACTION_REWARDS.get(interaction.action.value, 0.2)
    context = np.concatenate([
        np.array(updated_vector, dtype=np.float64),
        np.array(job_vector, dtype=np.float64),
    ])
    bandit.update(interaction.job_id, context, reward)

    # 6. Invalidate cache for this user
    cache.invalidate(f"recs_{interaction.user_id}")

    return {"message": "Interaction logged", "status": "success"}


@router.get("/feed")
async def get_recommendation_feed(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(require_job_searcher)
):
    """
    Get a personalized feed of recommended jobs for the current user.
    """
    user_id = str(current_user["_id"])
    cache_key = f"recs_{user_id}_p{page}_l{limit}"
    
    # 1. Check cache
    cached_result = cache.get(cache_key)
    if cached_result:
        return cached_result

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
    # Pass a larger limit to engine.get_recommendations to allow for pagination
    # Alternatively, you can rank all and slice for pagination. Let's rank all.
    ranked_jobs = engine.get_recommendations(
        user_vector=preference_vector,
        jobs=active_jobs,
        vocab=vocab,
        applied_job_ids=applied_job_ids,
        limit=len(active_jobs) # Rank all for proper pagination slicing
    )

    # 7. Pagination
    skip = (page - 1) * limit
    paginated_jobs = ranked_jobs[skip : skip + limit]

    # 8. Enrich with provider info and match details
    # For performance, could fetch providers in batch, but reusing job_to_response
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
        # We can hijack match_percentage to be the recommendation score OR add a new field
        # We'll use match_details logic for 'Match %' but could expose recommendation score if needed
        # As a hack, since the FE uses match_percentage, if score is > 0 from ML, consider blending it
        if score > 0:
            if job_res.match_percentage is None:
                 job_res.match_percentage = score
            else:
                 # blend rule-based skills match with ML similarity score for display
                 job_res.match_percentage = int((job_res.match_percentage + score) / 2)
                 
        # Ensure it's not None
        if job_res.match_percentage is None:
            job_res.match_percentage = 0
            
        job_responses.append(job_res)

    result = {
        "jobs": job_responses,
        "total": len(ranked_jobs),
        "page": page,
        "limit": limit
    }

    # 9. Cache result
    cache.set(cache_key, result)

    return result
