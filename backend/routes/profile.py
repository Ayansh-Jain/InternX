"""
Profile routes for user profile management.
Improvements:
  - Score history: pushes old score snapshot before overwriting (capped at 10)
  - Profile completeness: GET /profile/completeness endpoint
  - JD match: POST /profile/score/match-jd endpoint
"""

from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime
from bson import ObjectId
from typing import Optional
from pydantic import BaseModel

from models.user import UserUpdate, UserResponse, UserRole, UserStatus, UserProfile, UserScore
from auth.dependencies import get_current_user
from database import Database, USERS_COLLECTION
from services.scoring import calculate_resume_score, calculate_resume_score_vs_jd
from services.ml import MLService

router = APIRouter(prefix="/profile", tags=["Profile"])


class JDMatchRequest(BaseModel):
    jd_text: str


def user_to_response(user: dict) -> UserResponse:
    """Convert MongoDB user document to UserResponse."""
    score_data = user.get("score", {})
    # Build score_history list from DB array
    raw_history = score_data.pop("score_history", []) if isinstance(score_data, dict) else []
    score_obj = UserScore(
        **score_data,
        score_history=raw_history
    ) if score_data else None
    return UserResponse(
        id=str(user["_id"]),
        email=user["email"],
        role=UserRole(user["role"]),
        status=UserStatus(user["status"]),
        profile=UserProfile(**user.get("profile", {})),
        score=score_obj,
        created_at=user["created_at"]
    )


@router.get("/", response_model=UserResponse)
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Get current user's profile."""
    return user_to_response(current_user)


@router.put("/", response_model=UserResponse)
async def update_profile(
    profile_data: UserUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update current user's profile."""
    users_collection = Database.get_collection(USERS_COLLECTION)

    update_data = {"updated_at": datetime.utcnow()}

    profile_updates = {}
    for field, value in profile_data.model_dump(exclude_unset=True).items():
        if value is not None:
            profile_updates[f"profile.{field}"] = value

    update_data.update(profile_updates)

    if profile_data.resumeData:
        score_result = calculate_resume_score(profile_data.resumeData)
        now = datetime.utcnow()

        # Snapshot the CURRENT score before overwriting it (score history)
        old_score = current_user.get("score", {})
        if old_score and old_score.get("total_score", 0) > 0:
            snapshot = {
                "total_score": old_score.get("total_score", 0),
                "breakdown": old_score.get("breakdown", {}),
                "recorded_at": old_score.get("last_updated") or now
            }
            # Push to history, keep last 10 entries with $slice
            await users_collection.update_one(
                {"_id": current_user["_id"]},
                {"$push": {"score.score_history": {"$each": [snapshot], "$slice": -10}}}
            )

        update_data["score.total_score"] = score_result["total_score"]
        update_data["score.breakdown"] = score_result["breakdown"]
        update_data["score.last_updated"] = now

    # Generate embedding if bio or resume data changes
    if profile_data.bio is not None or profile_data.resumeData is not None:
        # Construct text for embedding
        # Use existing data combined with updates
        current_profile = current_user.get("profile", {})
        
        bio = profile_data.bio if profile_data.bio is not None else current_profile.get("bio", "")
        
        resume_data = profile_data.resumeData if profile_data.resumeData is not None else current_profile.get("resumeData", {})
        skills = []
        if resume_data:
             skills_dict = resume_data.get("skills", {})
             skills.extend(skills_dict.get("technical", []))
             skills.extend(skills_dict.get("tools", []))
             skills.extend(skills_dict.get("soft", []))
        
        # Simple concatenation for now
        text_to_embed = f"{bio} {' '.join(skills)}"
        
        # Generate embedding
        embedding = MLService().generate_embedding(text_to_embed)
        if embedding:
            update_data["embedding"] = embedding

    await users_collection.update_one(
        {"_id": current_user["_id"]},
        {"$set": update_data}
    )

    updated_user = await users_collection.find_one({"_id": current_user["_id"]})
    return user_to_response(updated_user)


@router.get("/completeness")
async def get_profile_completeness(current_user: dict = Depends(get_current_user)):
    """
    Return a profile completeness percentage (0–100) based on filled fields.
    Helps users understand what to complete before applying.
    """
    profile = current_user.get("profile", {})
    resume_data = profile.get("resumeData") or {}

    checks = {
        "Full name set": bool(profile.get("fullName")),
        "Email (account)": True,  # Always present — required for signup
        "Phone number": bool(profile.get("phone")),
        "LinkedIn or GitHub": bool(profile.get("linkedIn") or profile.get("github")),
        "Location": bool(profile.get("location")),
        "Bio / summary": bool(profile.get("bio")),
        "Resume uploaded or built": bool(resume_data),
        "Technical skills": bool(resume_data.get("skills", {}).get("technical")),
        "Work experience": bool(resume_data.get("experience")),
        "Education": bool(resume_data.get("education")),
        "Projects": bool(resume_data.get("projects")),
        "Target job role": bool(resume_data.get("target", {}).get("jobRole")),
    }

    completed = sum(1 for v in checks.values() if v)
    total = len(checks)
    pct = round((completed / total) * 100)

    missing = [label for label, done in checks.items() if not done]

    return {
        "completeness_pct": pct,
        "completed": completed,
        "total": total,
        "missing_fields": missing
    }


@router.get("/score")
async def get_score(current_user: dict = Depends(get_current_user)):
    """Get current user's resume score with detailed breakdown and history."""
    if current_user["role"] != UserRole.JOB_SEARCHER.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Score is only available for job searchers"
        )

    score = current_user.get("score", {})
    resume_data = current_user.get("profile", {}).get("resumeData")

    if resume_data:
        score_result = calculate_resume_score(resume_data)
        now = datetime.utcnow()

        users_collection = Database.get_collection(USERS_COLLECTION)
        await users_collection.update_one(
            {"_id": current_user["_id"]},
            {"$set": {
                "score.total_score": score_result["total_score"],
                "score.breakdown": score_result["breakdown"],
                "score.last_updated": now
            }}
        )

        return {
            "total_score": score_result["total_score"],
            "breakdown": score_result["breakdown"],
            "feedback": score_result["feedback"],
            "score_history": score.get("score_history", []),
            "last_updated": now
        }

    return {
        "total_score": score.get("total_score", 0),
        "breakdown": score.get("breakdown", {}),
        "feedback": [],
        "score_history": score.get("score_history", []),
        "last_updated": score.get("last_updated"),
        "message": "Complete your resume to get a score"
    }


@router.post("/score/refresh")
async def refresh_score(current_user: dict = Depends(get_current_user)):
    """Refresh resume score with latest data."""
    if current_user["role"] != UserRole.JOB_SEARCHER.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Score is only available for job searchers"
        )

    resume_data = current_user.get("profile", {}).get("resumeData")

    if not resume_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No resume data found. Please complete your profile first."
        )

    old_score = current_user.get("score", {})
    score_result = calculate_resume_score(resume_data)
    now = datetime.utcnow()

    users_collection = Database.get_collection(USERS_COLLECTION)

    # Snapshot old score into history before overwriting
    if old_score and old_score.get("total_score", 0) > 0:
        snapshot = {
            "total_score": old_score.get("total_score", 0),
            "breakdown": old_score.get("breakdown", {}),
            "recorded_at": old_score.get("last_updated") or now
        }
        await users_collection.update_one(
            {"_id": current_user["_id"]},
            {"$push": {"score.score_history": {"$each": [snapshot], "$slice": -10}}}
        )

    await users_collection.update_one(
        {"_id": current_user["_id"]},
        {"$set": {
            "score.total_score": score_result["total_score"],
            "score.breakdown": score_result["breakdown"],
            "score.last_updated": now
        }}
    )

    return {
        "total_score": score_result["total_score"],
        "breakdown": score_result["breakdown"],
        "feedback": score_result["feedback"],
        "last_updated": now
    }


@router.post("/score/match-jd")
async def match_resume_to_jd(
    request: JDMatchRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Score the current user's resume against a pasted job description.
    Returns: match_score (0-100), matched_keywords, missing_keywords, suggestions.
    """
    if current_user["role"] != UserRole.JOB_SEARCHER.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="JD matching is only available for job searchers"
        )

    jd_text = request.jd_text.strip()
    if len(jd_text) < 50:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide a more complete job description (at least 50 characters)"
        )

    resume_data = current_user.get("profile", {}).get("resumeData")
    if not resume_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No resume data found. Please build your resume first."
        )

    result = calculate_resume_score_vs_jd(resume_data, jd_text)

    return result
