"""
User models for authentication and user management.
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    ADMIN = "ADMIN"
    JOB_PROVIDER = "JOB_PROVIDER"
    JOB_SEARCHER = "JOB_SEARCHER"


class UserStatus(str, Enum):
    ACTIVE = "active"
    BLOCKED = "blocked"


class UserProfile(BaseModel):
    fullName: str = ""
    phone: str = ""
    location: str = ""
    linkedIn: str = ""
    github: str = ""
    portfolio: str = ""
    company: str = ""  # For JOB_PROVIDER
    bio: str = ""
    resumeData: Optional[Dict[str, Any]] = None  # For JOB_SEARCHER


class UserScore(BaseModel):
    total_score: int = 0
    breakdown: Dict[str, int] = {}
    last_updated: Optional[datetime] = None


class UserBase(BaseModel):
    email: EmailStr
    role: UserRole


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: UserRole
    fullName: str = Field(..., min_length=2)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    fullName: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedIn: Optional[str] = None
    github: Optional[str] = None
    portfolio: Optional[str] = None
    company: Optional[str] = None
    bio: Optional[str] = None
    resumeData: Optional[Dict[str, Any]] = None


class UserInDB(BaseModel):
    id: str
    email: str
    role: UserRole
    status: UserStatus
    profile: UserProfile
    score: UserScore
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserResponse(BaseModel):
    id: str
    email: str
    role: UserRole
    status: UserStatus
    profile: UserProfile
    score: Optional[UserScore] = None
    created_at: datetime

    class Config:
        from_attributes = True


class UserListResponse(BaseModel):
    users: List[UserResponse]
    total: int
    page: int
    limit: int


class TokenData(BaseModel):
    user_id: str
    email: str
    role: UserRole


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse
