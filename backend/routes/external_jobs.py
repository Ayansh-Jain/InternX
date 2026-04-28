"""
External Job Tracker routes.
Allows job seekers to:
  - Save external (web-search) jobs for later
  - Mark external jobs as "applied" (self-reported)
  - List saved / applied external jobs
"""

from fastapi import APIRouter, HTTPException, status, Depends, Query
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

from auth.dependencies import require_job_searcher
from database import Database, EXTERNAL_JOBS_COLLECTION

router = APIRouter(prefix="/external-jobs", tags=["External Job Tracker"])


# ── Request / Response models ─────────────────────────────────────────────────

class ExternalJobPayload(BaseModel):
    """Payload describing a web-search job card."""
    ext_id: str                      # Unique ID from the search results
    title: str
    company: str
    location: Optional[str] = None
    job_type: Optional[str] = None
    salary: Optional[str] = None
    source: str                      # Platform name (LinkedIn, Naukri, etc.)
    apply_url: str
    description_snippet: Optional[str] = None
    is_verified: bool = False


class ExternalJobAction(BaseModel):
    action: str  # "save" or "applied"
    job: ExternalJobPayload


# ── Helpers ───────────────────────────────────────────────────────────────────

def _col():
    return Database.get_collection(EXTERNAL_JOBS_COLLECTION)


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/save")
async def save_external_job(
    payload: ExternalJobPayload,
    current_user: dict = Depends(require_job_searcher)
):
    """Save an external web-search job for later review."""
    col = _col()
    user_id = str(current_user["_id"])

    existing = await col.find_one({"user_id": user_id, "ext_id": payload.ext_id})
    if existing:
        # Already exists — just ensure it's flagged as saved
        await col.update_one(
            {"_id": existing["_id"]},
            {"$set": {"saved": True, "updated_at": datetime.utcnow()}}
        )
        return {"message": "Job already saved", "id": str(existing["_id"])}

    doc = {
        "user_id": user_id,
        "ext_id": payload.ext_id,
        "title": payload.title,
        "company": payload.company,
        "location": payload.location,
        "job_type": payload.job_type,
        "salary": payload.salary,
        "source": payload.source,
        "apply_url": payload.apply_url,
        "description_snippet": payload.description_snippet,
        "is_verified": payload.is_verified,
        "saved": True,
        "applied": False,
        "saved_at": datetime.utcnow(),
        "applied_at": None,
        "updated_at": datetime.utcnow(),
    }
    result = await col.insert_one(doc)
    return {"message": "Job saved successfully", "id": str(result.inserted_id)}


@router.delete("/save/{ext_id}")
async def unsave_external_job(
    ext_id: str,
    current_user: dict = Depends(require_job_searcher)
):
    """Remove an external job from saved list."""
    col = _col()
    user_id = str(current_user["_id"])

    doc = await col.find_one({"user_id": user_id, "ext_id": ext_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Saved job not found")

    # If also marked applied, just unflag saved (keep the record for applied tab)
    if doc.get("applied"):
        await col.update_one(
            {"_id": doc["_id"]},
            {"$set": {"saved": False, "updated_at": datetime.utcnow()}}
        )
    else:
        await col.delete_one({"_id": doc["_id"]})

    return {"message": "Job removed from saved"}


@router.post("/applied")
async def mark_external_applied(
    payload: ExternalJobPayload,
    current_user: dict = Depends(require_job_searcher)
):
    """Self-report that the user applied to an external job."""
    col = _col()
    user_id = str(current_user["_id"])

    existing = await col.find_one({"user_id": user_id, "ext_id": payload.ext_id})
    if existing:
        await col.update_one(
            {"_id": existing["_id"]},
            {"$set": {
                "applied": True,
                "applied_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }}
        )
        return {"message": "Marked as applied", "id": str(existing["_id"])}

    # Not previously saved — create a fresh record
    doc = {
        "user_id": user_id,
        "ext_id": payload.ext_id,
        "title": payload.title,
        "company": payload.company,
        "location": payload.location,
        "job_type": payload.job_type,
        "salary": payload.salary,
        "source": payload.source,
        "apply_url": payload.apply_url,
        "description_snippet": payload.description_snippet,
        "is_verified": payload.is_verified,
        "saved": False,
        "applied": True,
        "saved_at": datetime.utcnow(),
        "applied_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    result = await col.insert_one(doc)
    return {"message": "Marked as applied", "id": str(result.inserted_id)}


@router.delete("/applied/{ext_id}")
async def unmark_external_applied(
    ext_id: str,
    current_user: dict = Depends(require_job_searcher)
):
    """Un-mark an external job as applied."""
    col = _col()
    user_id = str(current_user["_id"])

    doc = await col.find_one({"user_id": user_id, "ext_id": ext_id})
    if not doc:
        raise HTTPException(status_code=404, detail="External job record not found")

    if doc.get("saved"):
        await col.update_one(
            {"_id": doc["_id"]},
            {"$set": {"applied": False, "applied_at": None, "updated_at": datetime.utcnow()}}
        )
    else:
        await col.delete_one({"_id": doc["_id"]})

    return {"message": "Un-marked as applied"}


@router.get("/")
async def list_external_jobs(
    filter_by: Optional[str] = Query(None, description="'saved' | 'applied' | 'all'"),
    current_user: dict = Depends(require_job_searcher)
):
    """List user's saved and/or applied external jobs."""
    col = _col()
    user_id = str(current_user["_id"])

    query: dict = {"user_id": user_id}
    if filter_by == "saved":
        query["saved"] = True
    elif filter_by == "applied":
        query["applied"] = True
    else:
        # Return all (saved OR applied)
        query["$or"] = [{"saved": True}, {"applied": True}]

    cursor = col.find(query).sort("updated_at", -1)
    docs = await cursor.to_list(length=200)

    result = []
    for d in docs:
        result.append({
            "id": str(d["_id"]),
            "ext_id": d["ext_id"],
            "title": d["title"],
            "company": d["company"],
            "location": d.get("location"),
            "job_type": d.get("job_type"),
            "salary": d.get("salary"),
            "source": d["source"],
            "apply_url": d["apply_url"],
            "description_snippet": d.get("description_snippet"),
            "is_verified": d.get("is_verified", False),
            "saved": d.get("saved", False),
            "applied": d.get("applied", False),
            "saved_at": d.get("saved_at"),
            "applied_at": d.get("applied_at"),
        })

    return {"jobs": result, "total": len(result)}
