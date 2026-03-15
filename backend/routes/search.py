"""
External job search routes.
Searches real job listings from LinkedIn, Indeed, Internshala, Devfolio etc.
"""

from fastapi import APIRouter, Query
from typing import Optional
from services.job_search import search_external_jobs

router = APIRouter(prefix="/search", tags=["External Job Search"])


@router.get("/external")
async def external_job_search(
    q: str = Query(..., description="Job search query, e.g. 'AI Intern Remote'"),
    location: Optional[str] = Query(None, description="Location filter, e.g. 'Bangalore'"),
    job_type: Optional[str] = Query(None, description="Type: internship, job, hackathon"),
    work_mode: Optional[str] = Query(None, description="Work mode: onsite, remote, hybrid"),
    page: int = Query(1, ge=1, le=5)
):
    """
    Search for real job opportunities across LinkedIn, Indeed, Internshala, Devfolio etc.
    Returns verified opportunities with direct application links.
    """
    results = await search_external_jobs(
        query=q,
        location=location,
        job_type=job_type,
        work_mode=work_mode,
        page=page
    )
    return results
