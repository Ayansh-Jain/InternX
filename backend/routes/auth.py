"""
Authentication routes for signup, signin, and token management.
"""

from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime
from bson import ObjectId

from models.user import (
    UserCreate, UserLogin, UserResponse, Token, UserRole, UserStatus, 
    UserProfile, UserScore
)
from auth.security import get_password_hash, verify_password, create_tokens, decode_token
from auth.dependencies import get_current_user
from database import Database, USERS_COLLECTION
from services.ml import MLService

router = APIRouter(prefix="/auth", tags=["Authentication"])


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


@router.post("/signup", response_model=Token, status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserCreate):
    """
    Register a new user.
    - Only JOB_PROVIDER and JOB_SEARCHER can sign up through this endpoint.
    - Admin accounts must be created manually.
    """
    # Validate role (prevent admin signup through API)
    if user_data.role == UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin accounts cannot be created through signup"
        )
    
    users_collection = Database.get_collection(USERS_COLLECTION)
    
    # Check if email already exists
    existing_user = await users_collection.find_one({"email": user_data.email.lower()})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user document
    now = datetime.utcnow()
    user_doc = {
        "email": user_data.email.lower(),
        "password_hash": get_password_hash(user_data.password),
        "role": user_data.role.value,
        "status": UserStatus.ACTIVE.value,
        "profile": {
            "fullName": user_data.fullName,
            "phone": "",
            "location": "",
            "linkedIn": "",
            "github": "",
            "portfolio": "",
            "company": "",
            "bio": "",
            "resumeData": None
        },
        "score": {
            "total_score": 0,
            "breakdown": {},
            "last_updated": None
        },
        "created_at": now,
        "updated_at": now
    }
    
    # Generate embedding if applicable (usually empty on signup but good practice)
    text_to_embed = f"{user_data.fullName} {user_doc['profile']['bio']}"
    embedding = MLService().generate_embedding(text_to_embed)
    if embedding:
        user_doc["embedding"] = embedding
    
    # Insert user
    result = await users_collection.insert_one(user_doc)
    user_id = str(result.inserted_id)
    
    # Fetch the created user
    user = await users_collection.find_one({"_id": result.inserted_id})
    
    # Create tokens
    tokens = create_tokens(user_id, user["email"], user["role"])
    
    return Token(
        access_token=tokens["access_token"],
        refresh_token=tokens["refresh_token"],
        token_type="bearer",
        user=user_to_response(user)
    )


@router.post("/signin", response_model=Token)
async def signin(credentials: UserLogin):
    """
    Authenticate user and return tokens.
    """
    users_collection = Database.get_collection(USERS_COLLECTION)
    
    # Find user by email
    user = await users_collection.find_one({"email": credentials.email.lower()})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Verify password
    if not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Check if user is blocked
    if user["status"] == UserStatus.BLOCKED.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been blocked. Contact support for assistance."
        )
    
    # Create tokens
    user_id = str(user["_id"])
    tokens = create_tokens(user_id, user["email"], user["role"])
    
    return Token(
        access_token=tokens["access_token"],
        refresh_token=tokens["refresh_token"],
        token_type="bearer",
        user=user_to_response(user)
    )


@router.post("/refresh", response_model=Token)
async def refresh_token(refresh_token: str):
    """
    Refresh access token using refresh token.
    """
    payload = decode_token(refresh_token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type"
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    
    # Fetch user
    users_collection = Database.get_collection(USERS_COLLECTION)
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    if user["status"] == UserStatus.BLOCKED.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been blocked"
        )
    
    # Create new tokens
    tokens = create_tokens(user_id, user["email"], user["role"])
    
    return Token(
        access_token=tokens["access_token"],
        refresh_token=tokens["refresh_token"],
        token_type="bearer",
        user=user_to_response(user)
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """
    Get current authenticated user's information.
    """
    return user_to_response(current_user)


@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    """
    Logout user. 
    Note: Since we use stateless JWT, this is mainly for client-side token cleanup.
    For enhanced security, implement token blacklisting.
    """
    return {"message": "Logged out successfully"}
