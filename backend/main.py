"""
FastAPI main application with MongoDB, authentication, and background job expiry scheduler.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from datetime import datetime
import uvicorn
from pathlib import Path

from apscheduler.schedulers.asyncio import AsyncIOScheduler

from database import Database
from routes.resume import router as resume_router
from routes.auth import router as auth_router
from routes.admin import router as admin_router
from routes.jobs import router as jobs_router
from routes.applications import router as applications_router
from routes.profile import router as profile_router
from routes.search import router as search_router
from routes.recommendations import router as recommendations_router
from routes.external_jobs import router as external_jobs_router
from services.linucb_bandit import get_bandit
from services.applicant_ranker import get_ranker

# ── Background scheduler ──────────────────────────────────────────────────────
scheduler = AsyncIOScheduler()


async def expire_old_jobs():
    """
    Auto-close jobs whose application_deadline has passed.
    Runs every 60 minutes via APScheduler.
    """
    try:
        from database import JOBS_COLLECTION
        from models.job import JobStatus

        jobs_collection = Database.get_collection(JOBS_COLLECTION)
        now = datetime.utcnow()

        result = await jobs_collection.update_many(
            {
                "status": JobStatus.ACTIVE.value,
                "application_deadline": {"$lt": now, "$exists": True, "$ne": None}
            },
            {"$set": {"status": JobStatus.CLOSED.value, "updated_at": now}}
        )
        if result.modified_count > 0:
            print(f"[scheduler] Closed {result.modified_count} expired job(s)")
    except Exception as e:
        print(f"[scheduler] Error in expire_old_jobs: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle startup and shutdown events."""
    # ── Startup ────────────────────────────────────────────────────────────────
    try:
        await Database.connect()
        print("InternX API started successfully")
    except Exception as e:
        print(f"Warning: MongoDB connection failed: {e}")
        print("Note: API will run without database — some features may not work")

    # RL model persistence — load saved states if they exist
    _here = Path(__file__).parent
    bandit_path = str(_here / "bandit_state.pkl")
    ranker_path = str(_here / "ranker_weights.pt")

    get_bandit().load(bandit_path)
    get_ranker().load(ranker_path)
    print(f"[RL] LinUCB bandit loaded ({get_bandit().num_arms()} arms)")
    print("[RL] ApplicantRanker weights loaded")

    # Run job expiry check every 60 minutes
    scheduler.add_job(expire_old_jobs, "interval", minutes=60, id="expire_jobs")
    scheduler.start()
    print("[scheduler] Job expiry task started (runs every 60 min)")

    yield

    # ── Shutdown ───────────────────────────────────────────────────────────────
    # Persist RL model states before server stops
    get_bandit().save(bandit_path)
    get_ranker().save(ranker_path)
    print(f"[RL] Models persisted → {_here}")

    scheduler.shutdown(wait=False)
    await Database.disconnect()


app = FastAPI(
    title="InternX API",
    description="Resume Builder, ATS Scoring, and Job Platform API",
    version="2.1.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:3000",
        "http://localhost:8080",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
        "http://127.0.0.1:5176",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8080",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=[
        "Authorization",
        "Content-Type",
        "Accept",
        "Origin",
        "X-Requested-With",
        "Access-Control-Request-Method",
        "Access-Control-Request-Headers",
    ],
)

# Include routers
app.include_router(auth_router, prefix="/api")
app.include_router(profile_router, prefix="/api")
app.include_router(admin_router, prefix="/api")
app.include_router(jobs_router, prefix="/api")
app.include_router(applications_router, prefix="/api")
app.include_router(resume_router, prefix="/api")
app.include_router(search_router, prefix="/api")
app.include_router(recommendations_router, prefix="/api")
app.include_router(external_jobs_router, prefix="/api")


@app.get("/")
async def root():
    return {
        "message": "Welcome to InternX API",
        "version": "2.1.0",
        "features": [
            "Authentication & Authorization",
            "Role-based Access Control (ADMIN, JOB_PROVIDER, JOB_SEARCHER)",
            "Job Posting & Management with auto-expiry",
            "Job Applications (with N+1 optimized queries)",
            "Resume Builder & ATS Scoring",
            "JD-vs-Resume Matching",
            "Score History Tracking",
            "Profile Completeness"
        ],
        "endpoints": {
            "auth": "/api/auth",
            "profile": "/api/profile",
            "jobs": "/api/jobs",
            "applications": "/api/applications",
            "admin": "/api/admin",
            "resume": "/api (generate-resume, analyze-resume, templates)"
        }
    }


@app.get("/health")
async def health_check():
    db_status = "connected" if Database.client else "disconnected"
    return {
        "status": "healthy",
        "database": db_status,
        "scheduler": "running" if scheduler.running else "stopped"
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
