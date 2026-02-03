"""
Profile routes for user profile management.
"""

from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime
from bson import ObjectId

from models.user import UserUpdate, UserResponse, UserRole, UserStatus, UserProfile, UserScore
from auth.dependencies import get_current_user
from database import Database, USERS_COLLECTION
from services.scoring import calculate_resume_score

router = APIRouter(prefix="/profile", tags=["Profile"])


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


@router.get("/", response_model=UserResponse)
async def get_profile(current_user: dict = Depends(get_current_user)):
    """
    Get current user's profile.
    """
    return user_to_response(current_user)


@router.put("/", response_model=UserResponse)
async def update_profile(
    profile_data: UserUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    Update current user's profile.
    """
    users_collection = Database.get_collection(USERS_COLLECTION)
    
    # Build update for profile fields
    update_data = {"updated_at": datetime.utcnow()}
    
    profile_updates = {}
    for field, value in profile_data.model_dump(exclude_unset=True).items():
        if value is not None:
            profile_updates[f"profile.{field}"] = value
    
    update_data.update(profile_updates)
    
    # If resume data is updated, recalculate score
    if profile_data.resumeData:
        score_result = calculate_resume_score(profile_data.resumeData)
        update_data["score"] = {
            "total_score": score_result["total_score"],
            "breakdown": score_result["breakdown"],
            "last_updated": datetime.utcnow()
        }
    
    await users_collection.update_one(
        {"_id": current_user["_id"]},
        {"$set": update_data}
    )
    
    # Fetch updated user
    updated_user = await users_collection.find_one({"_id": current_user["_id"]})
    return user_to_response(updated_user)


@router.get("/score")
async def get_score(current_user: dict = Depends(get_current_user)):
    """
    Get current user's resume score with detailed breakdown.
    """
    if current_user["role"] != UserRole.JOB_SEARCHER.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Score is only available for job searchers"
        )
    
    score = current_user.get("score", {})
    resume_data = current_user.get("profile", {}).get("resumeData")
    
    # Calculate fresh score if resume data exists
    if resume_data:
        score_result = calculate_resume_score(resume_data)
        
        # Update score in database
        users_collection = Database.get_collection(USERS_COLLECTION)
        await users_collection.update_one(
            {"_id": current_user["_id"]},
            {"$set": {
                "score": {
                    "total_score": score_result["total_score"],
                    "breakdown": score_result["breakdown"],
                    "last_updated": datetime.utcnow()
                }
            }}
        )
        
        return {
            "total_score": score_result["total_score"],
            "breakdown": score_result["breakdown"],
            "feedback": score_result["feedback"],
            "last_updated": datetime.utcnow()
        }
    
    return {
        "total_score": score.get("total_score", 0),
        "breakdown": score.get("breakdown", {}),
        "feedback": [],
        "last_updated": score.get("last_updated"),
        "message": "Complete your resume to get a score"
    }


@router.post("/score/refresh")
async def refresh_score(current_user: dict = Depends(get_current_user)):
    """
    Refresh resume score with latest data.
    """
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
    
    score_result = calculate_resume_score(resume_data)
    
    # Update in database
    users_collection = Database.get_collection(USERS_COLLECTION)
    await users_collection.update_one(
        {"_id": current_user["_id"]},
        {"$set": {
            "score": {
                "total_score": score_result["total_score"],
                "breakdown": score_result["breakdown"],
                "last_updated": datetime.utcnow()
            }
        }}
    )
    
    return {
        "total_score": score_result["total_score"],
        "breakdown": score_result["breakdown"],
        "feedback": score_result["feedback"],
        "last_updated": datetime.utcnow()
    }
