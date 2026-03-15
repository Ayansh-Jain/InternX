"""
Application routes for job applications.
Improvements:
  - N+1 fix: list_my_applications uses batch $in queries instead of per-loop find_one
  - Normalized skill matching (same logic as jobs.py)
  - Withdrawal guard: prevents double-decrement of application count
  - Cover letter optional-length validation
"""

from fastapi import APIRouter, HTTPException, status, Depends, Query
from datetime import datetime
from bson import ObjectId
from typing import Optional
import re

from models.user import UserRole
from models.application import (
    ApplicationCreate, ApplicationStatusUpdate, ApplicationResponse,
    ApplicationListResponse, ApplicationStatus
)
from auth.dependencies import get_current_user, require_job_searcher, require_job_provider
from database import Database, JOBS_COLLECTION, USERS_COLLECTION, APPLICATIONS_COLLECTION, SAVED_JOBS_COLLECTION

router = APIRouter(prefix="/applications", tags=["Applications"])


# ── Skill matching (normalized — mirrors logic in jobs.py) ────────────────────

def _normalize_skill(s: str) -> str:
    """Normalize a skill string for comparison."""
    if not s:
        return ""
    clean = re.sub(r'[^a-zA-Z0-9+#.]', '', s.lower())
    if clean.endswith('.') and not clean.endswith('.net'):
        clean = clean[:-1]
    return clean


def calculate_match_percentage(user: dict, job: dict) -> int:
    """
    Calculate match % between user skills and job requirements using normalized matching.
    Mirrors the implementation in jobs.py > calculate_match_details.
    """
    user_skills_raw = []
    resume_data = user.get("profile", {}).get("resumeData")
    if resume_data:
        skills = resume_data.get("skills", {})
        user_skills_raw.extend(skills.get("technical", []))
        user_skills_raw.extend(skills.get("tools", []))

    job_skills_raw = job.get("required_skills", [])

    if not job_skills_raw:
        return 75  # No requirements specified — default to 75%

    matched = 0
    for skill in job_skills_raw:
        skill_norm = _normalize_skill(skill)
        if any(
            skill_norm in _normalize_skill(us) or _normalize_skill(us) in skill_norm
            for us in user_skills_raw if us
        ):
            matched += 1

    return min(100, int((matched / len(job_skills_raw)) * 100))


# ── Helper: batch fetch by IDs ────────────────────────────────────────────────

async def _batch_fetch(collection, id_field: str, ids: list) -> dict:
    """Fetch multiple documents by a string ID field and return a id→doc dict."""
    if not ids:
        return {}
    # We store IDs as strings in most places; try ObjectId conversion for _id lookups
    if id_field == "_id":
        obj_ids = []
        for id_str in ids:
            try:
                obj_ids.append(ObjectId(id_str))
            except Exception:
                pass
        cursor = collection.find({"_id": {"$in": obj_ids}})
        docs = await cursor.to_list(length=len(ids))
        return {str(doc["_id"]): doc for doc in docs}
    else:
        cursor = collection.find({id_field: {"$in": list(set(ids))}})
        docs = await cursor.to_list(length=len(ids))
        return {doc[id_field]: doc for doc in docs}


# ── Application endpoints ─────────────────────────────────────────────────────

@router.post("/", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
async def apply_to_job(
    application_data: ApplicationCreate,
    current_user: dict = Depends(require_job_searcher)
):
    """Apply to a job. (JOB_SEARCHER only)"""
    jobs_collection = Database.get_collection(JOBS_COLLECTION)
    applications_collection = Database.get_collection(APPLICATIONS_COLLECTION)

    # Validate cover letter length if provided
    cover_letter = application_data.cover_letter
    if cover_letter and len(cover_letter.strip()) < 50:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cover letter must be at least 50 characters if provided"
        )

    job = await jobs_collection.find_one({"_id": ObjectId(application_data.job_id)})
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    if job["status"] != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This job is no longer accepting applications"
        )

    # Check if already applied
    existing = await applications_collection.find_one({
        "job_id": application_data.job_id,
        "applicant_id": str(current_user["_id"])
    })
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already applied to this job"
        )

    match_pct = calculate_match_percentage(current_user, job)

    now = datetime.utcnow()
    application_doc = {
        "job_id": application_data.job_id,
        "applicant_id": str(current_user["_id"]),
        "provider_id": job["provider_id"],
        "status": ApplicationStatus.PENDING.value,
        "match_percentage": match_pct,
        "resume_snapshot": current_user.get("profile", {}).get("resumeData"),
        "cover_letter": cover_letter,
        "created_at": now,
        "updated_at": now
    }

    result = await applications_collection.insert_one(application_doc)

    await jobs_collection.update_one(
        {"_id": ObjectId(application_data.job_id)},
        {"$inc": {"stats.applications": 1}}
    )

    users_collection = Database.get_collection(USERS_COLLECTION)
    provider = await users_collection.find_one({"_id": ObjectId(job["provider_id"])})

    return ApplicationResponse(
        id=str(result.inserted_id),
        job_id=application_data.job_id,
        job_title=job["title"],
        job_company=provider.get("profile", {}).get("company") if provider else None,
        applicant_id=str(current_user["_id"]),
        applicant_name=current_user.get("profile", {}).get("fullName"),
        applicant_email=current_user.get("email"),
        provider_id=job["provider_id"],
        status=ApplicationStatus.PENDING,
        match_percentage=match_pct,
        cover_letter=cover_letter,
        created_at=now
    )


@router.get("/", response_model=ApplicationListResponse)
async def list_my_applications(
    status: Optional[ApplicationStatus] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user)
):
    """
    List applications.
    Job Searchers see their own; Job Providers see received.
    Uses batch queries to avoid N+1 database calls.
    """
    applications_collection = Database.get_collection(APPLICATIONS_COLLECTION)
    jobs_collection = Database.get_collection(JOBS_COLLECTION)
    users_collection = Database.get_collection(USERS_COLLECTION)

    if current_user["role"] == UserRole.JOB_SEARCHER.value:
        filter_query = {"applicant_id": str(current_user["_id"])}
    elif current_user["role"] == UserRole.JOB_PROVIDER.value:
        filter_query = {"provider_id": str(current_user["_id"])}
    else:
        filter_query = {}  # Admin sees all

    if status:
        filter_query["status"] = status.value

    total = await applications_collection.count_documents(filter_query)

    skip = (page - 1) * limit
    cursor = applications_collection.find(filter_query).skip(skip).limit(limit).sort("created_at", -1)
    applications = await cursor.to_list(length=limit)

    # ── Batch fetch: collect all unique IDs first, then fetch in ONE query each ──
    job_ids = list({app["job_id"] for app in applications})
    applicant_ids = list({app["applicant_id"] for app in applications})
    provider_ids = list({app["provider_id"] for app in applications})

    jobs_map = await _batch_fetch(jobs_collection, "_id", job_ids)
    applicants_map = await _batch_fetch(users_collection, "_id", applicant_ids)
    providers_map = await _batch_fetch(users_collection, "_id", provider_ids)

    result = []
    for app in applications:
        job = jobs_map.get(app["job_id"])
        applicant = applicants_map.get(app["applicant_id"])
        provider = providers_map.get(app["provider_id"])

        result.append(ApplicationResponse(
            id=str(app["_id"]),
            job_id=app["job_id"],
            job_title=job["title"] if job else None,
            job_company=provider.get("profile", {}).get("company") if provider else None,
            applicant_id=app["applicant_id"],
            applicant_name=applicant.get("profile", {}).get("fullName") if applicant else None,
            applicant_email=applicant.get("email") if applicant else None,
            provider_id=app["provider_id"],
            status=ApplicationStatus(app["status"]),
            match_percentage=app.get("match_percentage", 0),
            cover_letter=app.get("cover_letter"),
            created_at=app["created_at"]
        ))

    return ApplicationListResponse(
        applications=result,
        total=total,
        page=page,
        limit=limit
    )


@router.get("/{application_id}", response_model=ApplicationResponse)
async def get_application(
    application_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get application details."""
    applications_collection = Database.get_collection(APPLICATIONS_COLLECTION)
    jobs_collection = Database.get_collection(JOBS_COLLECTION)
    users_collection = Database.get_collection(USERS_COLLECTION)

    app = await applications_collection.find_one({"_id": ObjectId(application_id)})

    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    user_id = str(current_user["_id"])
    is_applicant = app["applicant_id"] == user_id
    is_provider = app["provider_id"] == user_id
    is_admin = current_user["role"] == UserRole.ADMIN.value

    if not (is_applicant or is_provider or is_admin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    job = await jobs_collection.find_one({"_id": ObjectId(app["job_id"])})
    applicant = await users_collection.find_one({"_id": ObjectId(app["applicant_id"])})
    provider = await users_collection.find_one({"_id": ObjectId(app["provider_id"])})

    return ApplicationResponse(
        id=str(app["_id"]),
        job_id=app["job_id"],
        job_title=job["title"] if job else None,
        job_company=provider.get("profile", {}).get("company") if provider else None,
        applicant_id=app["applicant_id"],
        applicant_name=applicant.get("profile", {}).get("fullName") if applicant else None,
        applicant_email=applicant.get("email") if applicant else None,
        provider_id=app["provider_id"],
        status=ApplicationStatus(app["status"]),
        match_percentage=app.get("match_percentage", 0),
        cover_letter=app.get("cover_letter"),
        created_at=app["created_at"]
    )


@router.put("/{application_id}/status")
async def update_application_status(
    application_id: str,
    status_update: ApplicationStatusUpdate,
    current_user: dict = Depends(require_job_provider)
):
    """Update application status. (Job Provider only)"""
    applications_collection = Database.get_collection(APPLICATIONS_COLLECTION)

    app = await applications_collection.find_one({"_id": ObjectId(application_id)})

    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    if app["provider_id"] != str(current_user["_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update applications for your own jobs"
        )

    await applications_collection.update_one(
        {"_id": ObjectId(application_id)},
        {"$set": {
            "status": status_update.status.value,
            "updated_at": datetime.utcnow()
        }}
    )

    return {"message": f"Application status updated to {status_update.status.value}"}


@router.delete("/{application_id}")
async def withdraw_application(
    application_id: str,
    current_user: dict = Depends(require_job_searcher)
):
    """Withdraw an application. (Job Searcher only)"""
    applications_collection = Database.get_collection(APPLICATIONS_COLLECTION)
    jobs_collection = Database.get_collection(JOBS_COLLECTION)

    app = await applications_collection.find_one({"_id": ObjectId(application_id)})

    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    if app["applicant_id"] != str(current_user["_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only withdraw your own applications"
        )

    # Guard: don't double-withdraw — prevents negative application count
    if app["status"] == ApplicationStatus.WITHDRAWN.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Application has already been withdrawn"
        )

    await applications_collection.update_one(
        {"_id": ObjectId(application_id)},
        {"$set": {
            "status": ApplicationStatus.WITHDRAWN.value,
            "updated_at": datetime.utcnow()
        }}
    )

    # Safely decrement — only if count > 0
    await jobs_collection.update_one(
        {"_id": ObjectId(app["job_id"]), "stats.applications": {"$gt": 0}},
        {"$inc": {"stats.applications": -1}}
    )

    return {"message": "Application withdrawn successfully"}


# ── Saved Jobs ────────────────────────────────────────────────────────────────

@router.post("/saved/{job_id}")
async def save_job(
    job_id: str,
    current_user: dict = Depends(require_job_searcher)
):
    """Save a job for later. (Job Searcher only)"""
    jobs_collection = Database.get_collection(JOBS_COLLECTION)
    saved_collection = Database.get_collection(SAVED_JOBS_COLLECTION)

    job = await jobs_collection.find_one({"_id": ObjectId(job_id)})
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    existing = await saved_collection.find_one({
        "user_id": str(current_user["_id"]),
        "job_id": job_id
    })
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Job already saved")

    await saved_collection.insert_one({
        "user_id": str(current_user["_id"]),
        "job_id": job_id,
        "created_at": datetime.utcnow()
    })

    return {"message": "Job saved successfully"}


@router.delete("/saved/{job_id}")
async def unsave_job(
    job_id: str,
    current_user: dict = Depends(require_job_searcher)
):
    """Remove a saved job. (Job Searcher only)"""
    saved_collection = Database.get_collection(SAVED_JOBS_COLLECTION)

    result = await saved_collection.delete_one({
        "user_id": str(current_user["_id"]),
        "job_id": job_id
    })

    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Saved job not found")

    return {"message": "Job removed from saved"}


@router.get("/saved")
async def list_saved_jobs(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(require_job_searcher)
):
    """
    List saved jobs. (Job Searcher only)
    Uses batch $in query to fetch all saved jobs in one call.
    """
    saved_collection = Database.get_collection(SAVED_JOBS_COLLECTION)
    jobs_collection = Database.get_collection(JOBS_COLLECTION)
    users_collection = Database.get_collection(USERS_COLLECTION)

    filter_query = {"user_id": str(current_user["_id"])}
    total = await saved_collection.count_documents(filter_query)

    skip = (page - 1) * limit
    cursor = saved_collection.find(filter_query).skip(skip).limit(limit).sort("created_at", -1)
    saved_entries = await cursor.to_list(length=limit)

    # Batch fetch all jobs
    job_ids = [s["job_id"] for s in saved_entries]
    jobs_map = await _batch_fetch(jobs_collection, "_id", job_ids)

    # Batch fetch all providers
    provider_ids = [j["provider_id"] for j in jobs_map.values() if j.get("provider_id")]
    providers_map = await _batch_fetch(users_collection, "_id", provider_ids)

    result = []
    for saved in saved_entries:
        job = jobs_map.get(saved["job_id"])
        if job and job["status"] == "active":
            provider = providers_map.get(job.get("provider_id", ""))
            result.append({
                "id": str(job["_id"]),
                "title": job["title"],
                "company": provider.get("profile", {}).get("company") if provider else None,
                "location": job.get("location", ""),
                "employment_type": job.get("employment_type"),
                "saved_at": saved["created_at"]
            })

    return {
        "saved_jobs": result,
        "total": len(result),
        "page": page,
        "limit": limit
    }
