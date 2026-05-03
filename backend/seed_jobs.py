
import asyncio
import os
import sys
from datetime import datetime, timedelta
import bcrypt
from bson import ObjectId

# Add parent directory to path to import from database
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import Database, USERS_COLLECTION, JOBS_COLLECTION
from models.job import EmploymentType, JobStatus

def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

async def seed_data():
    print("Starting seed process...")
    try:
        await Database.connect()
        db = Database.get_database()
        users_col = db[USERS_COLLECTION]
        jobs_col = db[JOBS_COLLECTION]

        # 1. Find or create a provider
        provider = await users_col.find_one({"role": "JOB_PROVIDER"})
        if not provider:
            print("No provider found, creating a seed provider...")
            now = datetime.utcnow()
            provider_doc = {
                "email": "provider@seed.com",
                "password_hash": get_password_hash("Seed@123"),
                "role": "JOB_PROVIDER",
                "status": "active",
                "profile": {
                    "fullName": "Seed Tech Corp",
                    "phone": "1234567890",
                    "location": "Bangalore",
                    "company": "Seed Tech Corp",
                    "bio": "Hiring for the future.",
                    "resumeData": None
                },
                "created_at": now,
                "updated_at": now
            }
            res = await users_col.insert_one(provider_doc)
            provider_id = str(res.inserted_id)
            provider_company = "Seed Tech Corp"
        else:
            provider_id = str(provider["_id"])
            provider_company = provider.get("profile", {}).get("company", "Seed Tech Corp")
            print(f"Using existing provider: {provider_company} ({provider_id})")

        # 2. Define jobs to seed
        jobs_to_add = [
            {
                "title": "Senior Frontend Developer",
                "description": "We are looking for a Senior Frontend Developer with expertise in React, TypeScript, and modern CSS frameworks like Tailwind. You will be responsible for building high-performance web applications.",
                "required_skills": ["React", "TypeScript", "Tailwind CSS", "Framer Motion", "Vite"],
                "required_experience": "3-5 years",
                "employment_type": EmploymentType.FULL_TIME.value,
                "location": "Remote",
                "salary_range": {"min": 1500000, "max": 2500000, "currency": "INR"}
            },
            {
                "title": "Backend Engineer (FastAPI)",
                "description": "Join our backend team to build scalable APIs using FastAPI and MongoDB. Experience with asynchronous programming in Python is a must.",
                "required_skills": ["Python", "FastAPI", "MongoDB", "Redis", "Docker"],
                "required_experience": "2-4 years",
                "employment_type": EmploymentType.FULL_TIME.value,
                "location": "Bangalore",
                "salary_range": {"min": 1200000, "max": 2200000, "currency": "INR"}
            },
            {
                "title": "Fullstack Intern",
                "description": "Exciting internship opportunity for a Fullstack enthusiast. Work with React and Node.js to build internal tools.",
                "required_skills": ["JavaScript", "React", "Node.js", "Express", "HTML", "CSS"],
                "required_experience": "0-1 years",
                "employment_type": EmploymentType.INTERNSHIP.value,
                "location": "Pune",
                "salary_range": {"min": 25000, "max": 40000, "currency": "INR"}
            },
            {
                "title": "DevOps Engineer",
                "description": "Manage our cloud infrastructure on AWS. Experience with CI/CD pipelines, Docker, and Kubernetes is highly preferred.",
                "required_skills": ["AWS", "Docker", "Kubernetes", "Jenkins", "Terraform"],
                "required_experience": "3-6 years",
                "employment_type": EmploymentType.FULL_TIME.value,
                "location": "Hyderabad",
                "salary_range": {"min": 1800000, "max": 3000000, "currency": "INR"}
            },
            {
                "title": "Data Scientist",
                "description": "Analyze large datasets and build machine learning models to improve our product features. Proficiency in Python and SQL is required.",
                "required_skills": ["Python", "Pandas", "Scikit-learn", "PyTorch", "SQL"],
                "required_experience": "2-5 years",
                "employment_type": EmploymentType.FULL_TIME.value,
                "location": "Mumbai",
                "salary_range": {"min": 1600000, "max": 2800000, "currency": "INR"}
            },
            {
                "title": "UI/UX Designer",
                "description": "Create beautiful and intuitive user interfaces. Experience with Figma and user research is a plus.",
                "required_skills": ["Figma", "Adobe XD", "UI Design", "UX Research"],
                "required_experience": "1-3 years",
                "employment_type": EmploymentType.CONTRACT.value,
                "location": "Remote",
                "salary_range": {"min": 800000, "max": 1500000, "currency": "INR"}
            },
            {
                "title": "React Native Developer",
                "description": "Build cross-platform mobile applications using React Native. Experience with mobile deployment is preferred.",
                "required_skills": ["React Native", "JavaScript", "Redux", "Mobile App Development"],
                "required_experience": "2-4 years",
                "employment_type": EmploymentType.FULL_TIME.value,
                "location": "Gurgaon",
                "salary_range": {"min": 1400000, "max": 2400000, "currency": "INR"}
            },
            {
                "title": "QA Engineer",
                "description": "Ensure the quality of our software through manual and automated testing. Experience with Selenium or Cypress is a plus.",
                "required_skills": ["Testing", "Selenium", "Cypress", "JavaScript", "Automation"],
                "required_experience": "1-3 years",
                "employment_type": EmploymentType.FULL_TIME.value,
                "location": "Chennai",
                "salary_range": {"min": 700000, "max": 1300000, "currency": "INR"}
            },
            {
                "title": "Machine Learning Engineer",
                "description": "Design and implement machine learning algorithms and systems. Strong background in mathematics and deep learning.",
                "required_skills": ["Python", "TensorFlow", "Keras", "Deep Learning", "NLP"],
                "required_experience": "3-5 years",
                "employment_type": EmploymentType.FULL_TIME.value,
                "location": "Remote",
                "salary_range": {"min": 2000000, "max": 3500000, "currency": "INR"}
            },
            {
                "title": "Cloud Architect",
                "description": "Design and oversee our cloud architecture. Deep knowledge of Azure or GCP is required.",
                "required_skills": ["Azure", "GCP", "Cloud Architecture", "Security", "Networking"],
                "required_experience": "7-10 years",
                "employment_type": EmploymentType.FULL_TIME.value,
                "location": "Bangalore",
                "salary_range": {"min": 3500000, "max": 6000000, "currency": "INR"}
            }
        ]

        # 3. Insert jobs
        now = datetime.utcnow()
        deadline = now + timedelta(days=30)
        
        inserted_count = 0
        for job_data in jobs_to_add:
            # Check if job already exists by title and location to avoid duplicates
            existing = await jobs_col.find_one({"title": job_data["title"], "location": job_data["location"]})
            if existing:
                print(f"Job '{job_data['title']}' already exists, skipping.")
                continue

            job_doc = {
                "provider_id": ObjectId(provider_id),
                "title": job_data["title"],
                "description": job_data["description"],
                "required_skills": job_data["required_skills"],
                "required_experience": job_data["required_experience"],
                "employment_type": job_data["employment_type"],
                "salary_range": job_data["salary_range"],
                "location": job_data["location"],
                "application_deadline": deadline,
                "status": JobStatus.ACTIVE.value,
                "stats": {"views": 0, "applications": 0},
                "created_at": now,
                "updated_at": now
            }
            await jobs_col.insert_one(job_doc)
            inserted_count += 1
            print(f"Added job: {job_data['title']}")

        print(f"Seed complete! Added {inserted_count} jobs.")

    except Exception as e:
        print(f"Error seeding data: {e}")
        import traceback
        traceback.print_exc()
    finally:
        await Database.disconnect()

if __name__ == "__main__":
    asyncio.run(seed_data())
