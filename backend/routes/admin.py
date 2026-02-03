"""
Admin routes for user and job management.
"""

from fastapi import APIRouter, HTTPException, status, Depends, Query
from datetime import datetime
from bson import ObjectId
from typing import Optional

from models.user import UserResponse, UserListResponse, UserRole, UserStatus, UserProfile, UserScore
from models.job import JobResponse, JobListResponse, JobStatus, SalaryRange, JobStats, EmploymentType
from models.admin_log import AdminLogResponse, AdminLogListResponse, TargetType
from auth.dependencies import require_admin
from database import Database, USERS_COLLECTION, JOBS_COLLECTION, ADMIN_LOGS_COLLECTION

router = APIRouter(prefix="/admin", tags=["Admin"])


def user_to_response(user: dict) -> UserResponse:
    """Convert MongoDB user document to UserResponse."""
    return UserResponse(
        id=str(user["_id"]),
        email=user["email"],
        role=UserRole(user["role"]),
        status=UserStatus(user["status"]),
        profile=UserProfile(**user.get("profile", {})),
        score=UserScore(**user.get("score", {})) if user.get("score") else None,
        created_at=user["created_at"]
    )


def job_to_response(job: dict, provider: dict = None) -> JobResponse:
    """Convert MongoDB job document to JobResponse."""
    return JobResponse(
        id=str(job["_id"]),
        provider_id=str(job["provider_id"]),
        provider_name=provider.get("profile", {}).get("fullName") if provider else None,
        provider_company=provider.get("profile", {}).get("company") if provider else None,
        title=job["title"],
        description=job["description"],
        required_skills=job.get("required_skills", []),
        required_experience=job.get("required_experience", ""),
        employment_type=EmploymentType(job.get("employment_type", "full-time")),
        salary_range=SalaryRange(**job["salary_range"]) if job.get("salary_range") else None,
        location=job.get("location", ""),
        application_deadline=job.get("application_deadline"),
        status=JobStatus(job["status"]),
        stats=JobStats(**job.get("stats", {"views": 0, "applications": 0})),
        created_at=job["created_at"]
    )


async def log_admin_action(admin_id: str, action: str, target_type: TargetType, target_id: str, details: dict = None):
    """Log admin action for audit trail."""
    logs_collection = Database.get_collection(ADMIN_LOGS_COLLECTION)
    await logs_collection.insert_one({
        "admin_id": admin_id,
        "action": action,
        "target_type": target_type.value,
        "target_id": target_id,
        "details": details or {},
        "created_at": datetime.utcnow()
    })


# ========== USER MANAGEMENT ==========

@router.get("/users", response_model=UserListResponse)
async def list_users(
    role: Optional[UserRole] = None,
    status: Optional[UserStatus] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(require_admin)
):
    """
    List all users with filtering options.
    """
    users_collection = Database.get_collection(USERS_COLLECTION)
    
    # Build filter
    filter_query = {}
    if role:
        filter_query["role"] = role.value
    if status:
        filter_query["status"] = status.value
    if search:
        filter_query["$or"] = [
            {"email": {"$regex": search, "$options": "i"}},
            {"profile.fullName": {"$regex": search, "$options": "i"}}
        ]
    
    # Get total count
    total = await users_collection.count_documents(filter_query)
    
    # Get paginated results
    skip = (page - 1) * limit
    cursor = users_collection.find(filter_query).skip(skip).limit(limit).sort("created_at", -1)
    users = await cursor.to_list(length=limit)
    
    return UserListResponse(
        users=[user_to_response(u) for u in users],
        total=total,
        page=page,
        limit=limit
    )


@router.put("/users/{user_id}/block")
async def block_user(
    user_id: str,
    current_user: dict = Depends(require_admin)
):
    """
    Block a user account.
    """
    users_collection = Database.get_collection(USERS_COLLECTION)
    
    # Can't block yourself
    if str(current_user["_id"]) == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot block your own account"
        )
    
    # Find user
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Can't block other admins
    if user["role"] == UserRole.ADMIN.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot block admin accounts"
        )
    
    # Update status
    await users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"status": UserStatus.BLOCKED.value, "updated_at": datetime.utcnow()}}
    )
    
    # Log action
    await log_admin_action(
        str(current_user["_id"]),
        "block_user",
        TargetType.USER,
        user_id,
        {"email": user["email"]}
    )
    
    return {"message": f"User {user['email']} has been blocked"}


@router.put("/users/{user_id}/unblock")
async def unblock_user(
    user_id: str,
    current_user: dict = Depends(require_admin)
):
    """
    Unblock a user account.
    """
    users_collection = Database.get_collection(USERS_COLLECTION)
    
    # Find user
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update status
    await users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"status": UserStatus.ACTIVE.value, "updated_at": datetime.utcnow()}}
    )
    
    # Log action
    await log_admin_action(
        str(current_user["_id"]),
        "unblock_user",
        TargetType.USER,
        user_id,
        {"email": user["email"]}
    )
    
    return {"message": f"User {user['email']} has been unblocked"}


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    current_user: dict = Depends(require_admin)
):
    """
    Permanently delete a user account.
    """
    users_collection = Database.get_collection(USERS_COLLECTION)
    
    # Can't delete yourself
    if str(current_user["_id"]) == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    # Find user
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Can't delete other admins
    if user["role"] == UserRole.ADMIN.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot delete admin accounts"
        )
    
    # Delete user
    await users_collection.delete_one({"_id": ObjectId(user_id)})
    
    # Log action
    await log_admin_action(
        str(current_user["_id"]),
        "delete_user",
        TargetType.USER,
        user_id,
        {"email": user["email"], "role": user["role"]}
    )
    
    return {"message": f"User {user['email']} has been permanently deleted"}


# ========== JOB MANAGEMENT ==========

@router.get("/jobs", response_model=JobListResponse)
async def list_all_jobs(
    status: Optional[JobStatus] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(require_admin)
):
    """
    List all jobs for moderation.
    """
    jobs_collection = Database.get_collection(JOBS_COLLECTION)
    users_collection = Database.get_collection(USERS_COLLECTION)
    
    # Build filter
    filter_query = {}
    if status:
        filter_query["status"] = status.value
    if search:
        filter_query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    
    # Get total count
    total = await jobs_collection.count_documents(filter_query)
    
    # Get paginated results
    skip = (page - 1) * limit
    cursor = jobs_collection.find(filter_query).skip(skip).limit(limit).sort("created_at", -1)
    jobs = await cursor.to_list(length=limit)
    
    # Fetch providers for jobs
    job_responses = []
    for job in jobs:
        provider = await users_collection.find_one({"_id": ObjectId(job["provider_id"])})
        job_responses.append(job_to_response(job, provider))
    
    return JobListResponse(
        jobs=job_responses,
        total=total,
        page=page,
        limit=limit
    )


@router.put("/jobs/{job_id}/block")
async def block_job(
    job_id: str,
    current_user: dict = Depends(require_admin)
):
    """
    Block a job posting.
    """
    jobs_collection = Database.get_collection(JOBS_COLLECTION)
    
    # Find job
    job = await jobs_collection.find_one({"_id": ObjectId(job_id)})
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Update status
    await jobs_collection.update_one(
        {"_id": ObjectId(job_id)},
        {"$set": {"status": JobStatus.BLOCKED.value, "updated_at": datetime.utcnow()}}
    )
    
    # Log action
    await log_admin_action(
        str(current_user["_id"]),
        "block_job",
        TargetType.JOB,
        job_id,
        {"title": job["title"]}
    )
    
    return {"message": f"Job '{job['title']}' has been blocked"}


@router.delete("/jobs/{job_id}")
async def delete_job_admin(
    job_id: str,
    current_user: dict = Depends(require_admin)
):
    """
    Permanently delete a job posting.
    """
    jobs_collection = Database.get_collection(JOBS_COLLECTION)
    
    # Find job
    job = await jobs_collection.find_one({"_id": ObjectId(job_id)})
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Delete job
    await jobs_collection.delete_one({"_id": ObjectId(job_id)})
    
    # Log action
    await log_admin_action(
        str(current_user["_id"]),
        "delete_job",
        TargetType.JOB,
        job_id,
        {"title": job["title"], "provider_id": str(job["provider_id"])}
    )
    
    return {"message": f"Job '{job['title']}' has been permanently deleted"}


# ========== ANALYTICS ==========

@router.get("/analytics")
async def get_analytics(current_user: dict = Depends(require_admin)):
    """
    Get platform analytics.
    """
    users_collection = Database.get_collection(USERS_COLLECTION)
    jobs_collection = Database.get_collection(JOBS_COLLECTION)
    
    # User counts
    total_users = await users_collection.count_documents({})
    job_providers = await users_collection.count_documents({"role": UserRole.JOB_PROVIDER.value})
    job_searchers = await users_collection.count_documents({"role": UserRole.JOB_SEARCHER.value})
    blocked_users = await users_collection.count_documents({"status": UserStatus.BLOCKED.value})
    
    # Job counts
    total_jobs = await jobs_collection.count_documents({})
    active_jobs = await jobs_collection.count_documents({"status": JobStatus.ACTIVE.value})
    blocked_jobs = await jobs_collection.count_documents({"status": JobStatus.BLOCKED.value})
    
    return {
        "users": {
            "total": total_users,
            "job_providers": job_providers,
            "job_searchers": job_searchers,
            "blocked": blocked_users
        },
        "jobs": {
            "total": total_jobs,
            "active": active_jobs,
            "blocked": blocked_jobs
        }
    }


# ========== AUDIT LOGS ==========

@router.get("/logs", response_model=AdminLogListResponse)
async def get_admin_logs(
    action: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    current_user: dict = Depends(require_admin)
):
    """
    Get audit logs for admin actions.
    """
    logs_collection = Database.get_collection(ADMIN_LOGS_COLLECTION)
    users_collection = Database.get_collection(USERS_COLLECTION)
    
    # Build filter
    filter_query = {}
    if action:
        filter_query["action"] = action
    
    # Get total count
    total = await logs_collection.count_documents(filter_query)
    
    # Get paginated results
    skip = (page - 1) * limit
    cursor = logs_collection.find(filter_query).skip(skip).limit(limit).sort("created_at", -1)
    logs = await cursor.to_list(length=limit)
    
    # Enrich with admin emails
    log_responses = []
    for log in logs:
        admin = await users_collection.find_one({"_id": ObjectId(log["admin_id"])})
        log_responses.append(AdminLogResponse(
            id=str(log["_id"]),
            admin_id=log["admin_id"],
            admin_email=admin["email"] if admin else None,
            action=log["action"],
            target_type=TargetType(log["target_type"]),
            target_id=log["target_id"],
            details=log.get("details"),
            created_at=log["created_at"]
        ))
    
    return AdminLogListResponse(
        logs=log_responses,
        total=total,
        page=page,
        limit=limit
    )
