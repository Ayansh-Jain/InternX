"""
Job routes for CRUD operations and job management.
"""

from fastapi import APIRouter, HTTPException, status, Depends, Query
from datetime import datetime
import re
from bson import ObjectId
from typing import Optional, List

from models.user import UserRole
from models.job import (
    JobCreate, JobUpdate, JobResponse, JobListResponse, 
    JobStatus, SalaryRange, JobStats, EmploymentType, MatchDetails
)
from auth.dependencies import get_current_user, require_job_provider, get_current_user_optional
from database import Database, JOBS_COLLECTION, USERS_COLLECTION, APPLICATIONS_COLLECTION

router = APIRouter(prefix="/jobs", tags=["Jobs"])


def job_to_response(job: dict, provider: dict = None, match_details: MatchDetails = None) -> JobResponse:
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
        match_percentage=match_details.score if match_details else None,
        match_details=match_details,
        created_at=job["created_at"]
    )


def calculate_match_details(user: dict, job: dict) -> Optional[MatchDetails]:
    """Calculate match details between user skills and job requirements."""
    if not user:
        return None
    
    user_skills_raw = []
    resume_data = user.get("profile", {}).get("resumeData")
    if resume_data:
        skills = resume_data.get("skills", {})
        user_skills_raw.extend(skills.get("technical", []))
        user_skills_raw.extend(skills.get("tools", []))
        user_skills_raw.extend(skills.get("soft", []))
    
    # Normalize function for skills (preserves tech-specific symbols)
    def normalize(s):
        if not s: return ""
        # Keep letters, numbers, +, #, and .
        clean = re.sub(r'[^a-zA-Z0-9+#.]', '', s.lower())
        # Remove trailing dots if they aren't part of common tech (like .NET)
        if clean.endswith('.') and not clean.endswith('.net'):
            clean = clean[:-1]
        return clean
    
    user_skills_norm = set([normalize(s) for s in user_skills_raw if s])
    job_skills_raw = job.get("required_skills", [])
    
    if not job_skills_raw:
        return MatchDetails(score=100, matched_skills=[], missing_skills=[])
    
    matched_skills = []
    missing_skills = []
    
    for skill in job_skills_raw:
        skill_norm = normalize(skill)
        # Check for exact normalized match OR if the requirement is a substring of user skills (e.g. "React" matches "React.js")
        if any(skill_norm in normalize(us) or normalize(us) in skill_norm for us in user_skills_raw if us):
            matched_skills.append(skill)
        else:
            missing_skills.append(skill)
            
    score = int((len(matched_skills) / len(job_skills_raw)) * 100) if job_skills_raw else 100
    
    return MatchDetails(
        score=min(100, score),
        matched_skills=matched_skills,
        missing_skills=missing_skills
    )


@router.post("/", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
async def create_job(
    job_data: JobCreate,
    current_user: dict = Depends(require_job_provider)
):
    """
    Create a new job posting. (JOB_PROVIDER only)
    """
    jobs_collection = Database.get_collection(JOBS_COLLECTION)
    
    now = datetime.utcnow()
    job_doc = {
        "provider_id": str(current_user["_id"]),
        "title": job_data.title,
        "description": job_data.description,
        "required_skills": job_data.required_skills,
        "required_experience": job_data.required_experience,
        "employment_type": job_data.employment_type.value,
        "salary_range": job_data.salary_range.model_dump() if job_data.salary_range else None,
        "location": job_data.location,
        "application_deadline": job_data.application_deadline,
        "status": JobStatus.ACTIVE.value,
        "stats": {"views": 0, "applications": 0},
        "created_at": now,
        "updated_at": now
    }
    
    result = await jobs_collection.insert_one(job_doc)
    job_doc["_id"] = result.inserted_id
    
    return job_to_response(job_doc, current_user)


@router.get("/", response_model=JobListResponse)
async def list_jobs(
    search: Optional[str] = None,
    skills: Optional[str] = None,  # Comma-separated
    location: Optional[str] = None,
    employment_type: Optional[EmploymentType] = None,
    experience: Optional[str] = None,
    min_salary: Optional[str] = None,
    max_salary: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """
    List all active jobs with filtering.
    """
    jobs_collection = Database.get_collection(JOBS_COLLECTION)
    users_collection = Database.get_collection(USERS_COLLECTION)
    
    # Build filter - only show active jobs to non-admins
    filter_query = {"status": JobStatus.ACTIVE.value}
    
    if search:
        filter_query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    
    if skills:
        skill_list = [s.strip() for s in skills.split(",")]
        filter_query["required_skills"] = {"$in": skill_list}
    
    if location:
        filter_query["location"] = {"$regex": location, "$options": "i"}
    
    if employment_type:
        filter_query["employment_type"] = employment_type.value
    
    if experience:
        filter_query["required_experience"] = {"$regex": experience, "$options": "i"}
    
    # Salary filtering
    if min_salary:
        try:
            min_val = int(min_salary)
            # Find jobs where max salary is at least the requested min
            filter_query["salary_range.max"] = {"$gte": min_val}
        except ValueError:
            pass
            
    if max_salary:
        try:
            max_val = int(max_salary)
            # Find jobs where min salary is at most the requested max
            filter_query["salary_range.min"] = {"$lte": max_val}
        except ValueError:
            pass
    
    # Get total count
    total = await jobs_collection.count_documents(filter_query)
    
    # Get paginated results
    skip = (page - 1) * limit
    cursor = jobs_collection.find(filter_query).skip(skip).limit(limit).sort("created_at", -1)
    jobs = await cursor.to_list(length=limit)
    
    # Fetch providers and calculate match percentage
    job_responses = []
    for job in jobs:
        provider = await users_collection.find_one({"_id": ObjectId(job["provider_id"])})
        match_details = calculate_match_details(current_user, job) if current_user else None
        job_responses.append(job_to_response(job, provider, match_details))
    
    return JobListResponse(
        jobs=job_responses,
        total=total,
        page=page,
        limit=limit
    )


@router.get("/my-jobs", response_model=JobListResponse)
async def list_my_jobs(
    status: Optional[JobStatus] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(require_job_provider)
):
    """
    List jobs posted by the current provider.
    """
    jobs_collection = Database.get_collection(JOBS_COLLECTION)
    
    filter_query = {
        "provider_id": str(current_user["_id"]),
        "status": {"$ne": JobStatus.DELETED.value}
    }
    
    if status:
        filter_query["status"] = status.value
    
    total = await jobs_collection.count_documents(filter_query)
    
    skip = (page - 1) * limit
    cursor = jobs_collection.find(filter_query).skip(skip).limit(limit).sort("created_at", -1)
    jobs = await cursor.to_list(length=limit)
    
    return JobListResponse(
        jobs=[job_to_response(job, current_user, None) for job in jobs],
        total=total,
        page=page,
        limit=limit
    )


@router.get("/{job_id}", response_model=JobResponse)
async def get_job(
    job_id: str,
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """
    Get job details by ID.
    """
    jobs_collection = Database.get_collection(JOBS_COLLECTION)
    users_collection = Database.get_collection(USERS_COLLECTION)
    
    job = await jobs_collection.find_one({"_id": ObjectId(job_id)})
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Don't show blocked/deleted jobs to non-owners/non-admins
    if job["status"] in [JobStatus.BLOCKED.value, JobStatus.DELETED.value]:
        is_owner = current_user and str(current_user["_id"]) == job["provider_id"]
        is_admin = current_user and current_user.get("role") == UserRole.ADMIN.value
        if not (is_owner or is_admin):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found"
            )
    
    # Increment view count
    await jobs_collection.update_one(
        {"_id": ObjectId(job_id)},
        {"$inc": {"stats.views": 1}}
    )
    
    provider = await users_collection.find_one({"_id": ObjectId(job["provider_id"])})
    match_details = calculate_match_details(current_user, job) if current_user else None
    
    return job_to_response(job, provider, match_details)


@router.put("/{job_id}", response_model=JobResponse)
async def update_job(
    job_id: str,
    job_data: JobUpdate,
    current_user: dict = Depends(require_job_provider)
):
    """
    Update a job posting. (Owner only)
    """
    jobs_collection = Database.get_collection(JOBS_COLLECTION)
    
    job = await jobs_collection.find_one({"_id": ObjectId(job_id)})
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    if job["provider_id"] != str(current_user["_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only edit your own jobs"
        )
    
    # Build update
    update_data = {"updated_at": datetime.utcnow()}
    for field, value in job_data.model_dump(exclude_unset=True).items():
        if value is not None:
            if field == "salary_range" and value:
                update_data[field] = value
            elif field == "employment_type":
                update_data[field] = value.value if hasattr(value, 'value') else value
            elif field == "status":
                update_data[field] = value.value if hasattr(value, 'value') else value
            else:
                update_data[field] = value
    
    await jobs_collection.update_one(
        {"_id": ObjectId(job_id)},
        {"$set": update_data}
    )
    
    updated_job = await jobs_collection.find_one({"_id": ObjectId(job_id)})
    return job_to_response(updated_job, current_user)


@router.delete("/{job_id}")
async def delete_job(
    job_id: str,
    current_user: dict = Depends(require_job_provider)
):
    """
    Soft delete a job posting. (Owner only)
    """
    jobs_collection = Database.get_collection(JOBS_COLLECTION)
    
    job = await jobs_collection.find_one({"_id": ObjectId(job_id)})
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    if job["provider_id"] != str(current_user["_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own jobs"
        )
    
    await jobs_collection.update_one(
        {"_id": ObjectId(job_id)},
        {"$set": {"status": JobStatus.DELETED.value, "updated_at": datetime.utcnow()}}
    )
    
    return {"message": "Job deleted successfully"}


@router.get("/{job_id}/applicants")
async def get_job_applicants(
    job_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(require_job_provider)
):
    """
    View applicants for a job. (Owner only)
    """
    jobs_collection = Database.get_collection(JOBS_COLLECTION)
    applications_collection = Database.get_collection(APPLICATIONS_COLLECTION)
    users_collection = Database.get_collection(USERS_COLLECTION)
    
    job = await jobs_collection.find_one({"_id": ObjectId(job_id)})
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    if job["provider_id"] != str(current_user["_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view applicants for your own jobs"
        )
    
    # Get applications
    filter_query = {"job_id": job_id}
    total = await applications_collection.count_documents(filter_query)
    
    skip = (page - 1) * limit
    cursor = applications_collection.find(filter_query).skip(skip).limit(limit).sort("created_at", -1)
    applications = await cursor.to_list(length=limit)
    
    # Enrich with applicant info
    result = []
    for app in applications:
        applicant = await users_collection.find_one({"_id": ObjectId(app["applicant_id"])})
        result.append({
            "id": str(app["_id"]),
            "applicant_id": app["applicant_id"],
            "applicant_name": applicant.get("profile", {}).get("fullName") if applicant else None,
            "applicant_email": applicant.get("email") if applicant else None,
            "status": app["status"],
            "match_percentage": app.get("match_percentage", 0),
            "created_at": app["created_at"]
        })
    
    return {
        "applicants": result,
        "total": total,
        "page": page,
        "limit": limit
    }
