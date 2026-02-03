"""
Job models for job postings and management.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class EmploymentType(str, Enum):
    FULL_TIME = "full-time"
    PART_TIME = "part-time"
    REMOTE = "remote"
    CONTRACT = "contract"
    INTERNSHIP = "internship"


class JobStatus(str, Enum):
    ACTIVE = "active"
    BLOCKED = "blocked"
    CLOSED = "closed"
    DELETED = "deleted"


class SalaryRange(BaseModel):
    min: int = 0
    max: int = 0
    currency: str = "INR"


class JobStats(BaseModel):
    views: int = 0
    applications: int = 0


class JobCreate(BaseModel):
    title: str = Field(..., min_length=3)
    description: str = Field(..., min_length=10)
    required_skills: List[str] = []
    required_experience: str = "0-1 years"
    employment_type: EmploymentType = EmploymentType.FULL_TIME
    salary_range: Optional[SalaryRange] = None
    location: str = ""
    application_deadline: Optional[datetime] = None


class JobUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    required_skills: Optional[List[str]] = None
    required_experience: Optional[str] = None
    employment_type: Optional[EmploymentType] = None
    salary_range: Optional[SalaryRange] = None
    location: Optional[str] = None
    application_deadline: Optional[datetime] = None
    status: Optional[JobStatus] = None


class JobInDB(BaseModel):
    id: str
    provider_id: str
    title: str
    description: str
    required_skills: List[str]
    required_experience: str
    employment_type: EmploymentType
    salary_range: Optional[SalaryRange] = None
    location: str
    application_deadline: Optional[datetime] = None
    status: JobStatus
    stats: JobStats
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class JobResponse(BaseModel):
    id: str
    provider_id: str
    provider_name: Optional[str] = None
    provider_company: Optional[str] = None
    title: str
    description: str
    required_skills: List[str]
    required_experience: str
    employment_type: EmploymentType
    salary_range: Optional[SalaryRange] = None
    location: str
    application_deadline: Optional[datetime] = None
    status: JobStatus
    stats: JobStats
    match_percentage: Optional[int] = None  # Calculated for job searchers
    created_at: datetime

    class Config:
        from_attributes = True


class JobListResponse(BaseModel):
    jobs: List[JobResponse]
    total: int
    page: int
    limit: int
