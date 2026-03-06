"""
FastAPI main application with MongoDB and authentication.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

from database import Database
from routes.resume import router as resume_router
from routes.auth import router as auth_router
from routes.admin import router as admin_router
from routes.jobs import router as jobs_router
from routes.applications import router as applications_router
from routes.profile import router as profile_router
from routes.search import router as search_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle startup and shutdown events."""
    # Startup
    try:
        await Database.connect()
        print("InternX API started successfully")
    except Exception as e:
        print(f"Error: MongoDB connection failed: {e}")
        print("Note: API will run without database - some features may not work")
    
    yield
    
    # Shutdown
    await Database.disconnect()


app = FastAPI(
    title="InternX API",
    description="Resume Builder, ATS Scoring, and Job Platform API",
    version="2.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api")
app.include_router(profile_router, prefix="/api")
app.include_router(admin_router, prefix="/api")
app.include_router(jobs_router, prefix="/api")
app.include_router(applications_router, prefix="/api")
app.include_router(resume_router, prefix="/api")
app.include_router(search_router, prefix="/api")


@app.get("/")
async def root():
    return {
        "message": "Welcome to InternX API",
        "version": "2.0.0",
        "features": [
            "Authentication & Authorization",
            "Role-based Access Control (ADMIN, JOB_PROVIDER, JOB_SEARCHER)",
            "Job Posting & Management",
            "Job Applications",
            "Resume Builder & ATS Scoring"
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
        "database": db_status
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
