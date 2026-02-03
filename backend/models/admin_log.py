"""
Admin log models for audit tracking.
"""

from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum


class TargetType(str, Enum):
    USER = "user"
    JOB = "job"


class AdminLogCreate(BaseModel):
    admin_id: str
    action: str
    target_type: TargetType
    target_id: str
    details: Optional[Dict[str, Any]] = None


class AdminLogInDB(BaseModel):
    id: str
    admin_id: str
    admin_email: Optional[str] = None
    action: str
    target_type: TargetType
    target_id: str
    details: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True


class AdminLogResponse(BaseModel):
    id: str
    admin_id: str
    admin_email: Optional[str] = None
    action: str
    target_type: TargetType
    target_id: str
    details: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True


class AdminLogListResponse(BaseModel):
    logs: List[AdminLogResponse]
    total: int
    page: int
    limit: int
