"""
Interaction model for job recommendation engine.
"""

from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime
from enum import Enum


class InteractionAction(str, Enum):
    VIEW = "view"
    CLICK = "click"
    LIKE = "like"
    APPLY = "apply"


class InteractionCreate(BaseModel):
    user_id: str
    job_id: str
    action: InteractionAction


class InteractionInDB(BaseModel):
    id: str
    user_id: str
    job_id: str
    action: InteractionAction
    job_vector: Optional[List[float]] = None
    timestamp: datetime

    class Config:
        from_attributes = True
