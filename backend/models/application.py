"""
Application models for job applications.
"""

from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum


class ApplicationStatus(str, Enum):
    PENDING = "pending"
    REVIEWED = "reviewed"
    SHORTLISTED = "shortlisted"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"


class ApplicationCreate(BaseModel):
    job_id: str
    cover_letter: Optional[str] = None
    customized_resume: Optional[Dict[str, Any]] = None
    application_bio: Optional[str] = None


class ApplicationStatusUpdate(BaseModel):
    status: ApplicationStatus


class ApplicationInDB(BaseModel):
    id: str
    job_id: str
    applicant_id: str
    provider_id: str
    status: ApplicationStatus
    match_percentage: int
    resume_snapshot: Optional[Dict[str, Any]] = None
    cover_letter: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ApplicationResponse(BaseModel):
    id: str
    job_id: str
    job_title: Optional[str] = None
    job_company: Optional[str] = None
    applicant_id: str
    applicant_name: Optional[str] = None
    applicant_email: Optional[str] = None
    provider_id: str
    status: ApplicationStatus
    match_percentage: int
    cover_letter: Optional[str] = None
    resume_snapshot: Optional[Dict[str, Any]] = None
    application_bio: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ApplicationListResponse(BaseModel):
    applications: List[ApplicationResponse]
    total: int
    page: int
    limit: int
