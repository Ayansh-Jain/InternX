"""
InternX Database Seeder
========================
Populates MongoDB with realistic dummy data:
  - 8 Job Seekers
  - 5 Job Providers (with companies)
  - 20 Job Postings (spread across providers)
  - ~30 Applications (seekers applying to jobs)

All seeded users share the password: Password123!
Run from backend/ directory:
    python seed_db.py
"""

import asyncio
import random
from datetime import datetime, timedelta
from bson import ObjectId

import bcrypt
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

# ── Config ─────────────────────────────────────────────────────────────────
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb+srv://Ayansh:9WHEsz@internx.hernfm1.mongodb.net/?appName=INTERNX")
DATABASE_NAME = os.getenv("DATABASE_NAME", "internx")
SEED_PASSWORD = "Password123!"

# ── Helpers ─────────────────────────────────────────────────────────────────
def hash_password(plain: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(plain.encode(), salt).decode()

def now() -> datetime:
    return datetime.utcnow()

def rand_past(days=90) -> datetime:
    return now() - timedelta(days=random.randint(1, days))

def rand_future(days=60) -> datetime:
    return now() + timedelta(days=random.randint(7, days))

def oid() -> str:
    return str(ObjectId())

# ── Seed Data ────────────────────────────────────────────────────────────────

COMPANIES = [
    ("TechNova Solutions", "Bangalore"),
    ("DataBridge Analytics", "Mumbai"),
    ("CloudVault Systems", "Hyderabad"),
    ("GreenLogic Tech", "Pune"),
    ("PixelForge Studios", "Delhi"),
]

JOB_PROVIDERS_RAW = [
    {"name": "Rohan Mehta",     "email": "rohan.mehta@technova.io"},
    {"name": "Priya Sharma",    "email": "priya.sharma@databridge.io"},
    {"name": "Amit Verma",      "email": "amit.verma@cloudvault.io"},
    {"name": "Sneha Kapoor",    "email": "sneha.kapoor@greenlogic.io"},
    {"name": "Kiran Reddy",     "email": "kiran.reddy@pixelforge.io"},
]

JOB_SEEKERS_RAW = [
    {"name": "Arjun Singh",     "email": "arjun.singh@gmail.com",   "skills": ["Python", "Django", "REST APIs", "PostgreSQL", "Docker"]},
    {"name": "Meera Nair",      "email": "meera.nair@gmail.com",    "skills": ["React", "JavaScript", "TypeScript", "CSS", "Node.js"]},
    {"name": "Rahul Gupta",     "email": "rahul.gupta@gmail.com",   "skills": ["Machine Learning", "Python", "TensorFlow", "Pandas", "NumPy"]},
    {"name": "Anjali Patel",    "email": "anjali.patel@gmail.com",  "skills": ["Java", "Spring Boot", "Microservices", "Kafka", "AWS"]},
    {"name": "Vikram Joshi",    "email": "vikram.joshi@gmail.com",  "skills": ["React Native", "Flutter", "iOS", "Android", "Firebase"]},
    {"name": "Divya Rao",       "email": "divya.rao@gmail.com",     "skills": ["Data Analysis", "SQL", "Tableau", "Excel", "Python"]},
    {"name": "Siddharth Kumar", "email": "sid.kumar@gmail.com",     "skills": ["DevOps", "Kubernetes", "Docker", "CI/CD", "Terraform"]},
    {"name": "Pooja Iyer",      "email": "pooja.iyer@gmail.com",    "skills": ["UI/UX Design", "Figma", "Sketch", "HTML", "CSS"]},
]

BIOS = [
    "Passionate software engineer with a knack for building scalable, user-friendly applications.",
    "Results-driven developer focused on delivering clean code and great user experiences.",
    "Tech enthusiast who loves solving real-world problems through elegant engineering.",
    "Motivated engineer constantly learning and exploring the latest in tech and design.",
    "Detail-oriented developer with a passion for open source and collaborative development.",
    "Creative problem-solver who thrives at the intersection of technology and design.",
    "Dedicated professional with a strong foundation in computer science fundamentals.",
    "Full-stack thinker who cares deeply about performance, accessibility, and user delight.",
]

COLLEGES = [
    "IIT Bombay", "IIT Delhi", "NIT Trichy", "BITS Pilani",
    "VIT Vellore", "Manipal University", "SRM University", "DTU Delhi",
]

COVER_LETTERS = [
    "I am very excited about this opportunity and believe my skills align perfectly with your requirements. I am a quick learner and team player who thrives in collaborative environments.",
    "After reviewing the job description, I am confident that my background in software development makes me an excellent fit. I look forward to contributing to your team.",
    "This role excites me because it combines my passion for technology with real-world impact. I have hands-on experience in the required skills and am eager to grow further.",
    "I have been following your company for a while and greatly admire the work you do. I believe I can add significant value and would love the chance to prove that.",
    "With my diverse technical background and strong communication skills, I am ready to hit the ground running. I am enthusiastic about joining a team that values innovation.",
]

JOB_TEMPLATES = [
    {
        "title": "Backend Engineer – Python/FastAPI",
        "description": "We are looking for a talented Backend Engineer to build and maintain scalable REST APIs. You will work closely with frontend and DevOps teams to ship high-quality features.\n\nResponsibilities:\n- Design and implement RESTful APIs using FastAPI or Django\n- Work with MongoDB/PostgreSQL for data modeling\n- Write unit and integration tests\n- Participate in code reviews and architecture discussions",
        "required_skills": ["Python", "FastAPI", "REST APIs", "PostgreSQL", "Docker"],
        "required_experience": "1-3 years",
        "employment_type": "full-time",
        "salary_range": {"min": 600000, "max": 1200000, "currency": "INR"},
    },
    {
        "title": "Frontend Developer – React & TypeScript",
        "description": "Join our product team to build delightful web experiences. You will design and implement component libraries, optimize performance, and collaborate with designers.\n\nResponsibilities:\n- Build reusable React components\n- Implement responsive designs from Figma specs\n- Optimize app performance and bundle size\n- Write thorough tests using Jest/RTL",
        "required_skills": ["React", "TypeScript", "JavaScript", "CSS", "Figma"],
        "required_experience": "1-2 years",
        "employment_type": "full-time",
        "salary_range": {"min": 500000, "max": 1000000, "currency": "INR"},
    },
    {
        "title": "Machine Learning Engineer",
        "description": "We are expanding our AI team and looking for an ML Engineer to develop and productionize ML models. You will work on recommendation systems, NLP pipelines, and data infrastructure.\n\nResponsibilities:\n- Design and train ML models using PyTorch/TensorFlow\n- Build data pipelines and feature stores\n- Deploy models via REST APIs\n- Monitor model performance and drift",
        "required_skills": ["Machine Learning", "Python", "TensorFlow", "Pandas", "SQL"],
        "required_experience": "2-4 years",
        "employment_type": "full-time",
        "salary_range": {"min": 900000, "max": 1800000, "currency": "INR"},
    },
    {
        "title": "Full-Stack Developer – Node.js & React",
        "description": "We need a versatile Full-Stack Developer to own features end-to-end, from database schema to polished UI.\n\nResponsibilities:\n- Build Node.js microservices\n- Develop React frontends\n- Manage MongoDB collections and indexes\n- Integrate third-party APIs",
        "required_skills": ["Node.js", "React", "MongoDB", "JavaScript", "REST APIs"],
        "required_experience": "2-3 years",
        "employment_type": "full-time",
        "salary_range": {"min": 700000, "max": 1400000, "currency": "INR"},
    },
    {
        "title": "DevOps / Cloud Engineer",
        "description": "Help us scale our infrastructure. You will automate deployments, manage Kubernetes clusters, and ensure 99.9% uptime for our platform.\n\nResponsibilities:\n- Maintain CI/CD pipelines (GitHub Actions / Jenkins)\n- Manage AWS EKS clusters\n- Implement IaC with Terraform\n- Set up monitoring with Prometheus/Grafana",
        "required_skills": ["DevOps", "Kubernetes", "Docker", "AWS", "Terraform"],
        "required_experience": "2-4 years",
        "employment_type": "full-time",
        "salary_range": {"min": 1000000, "max": 2000000, "currency": "INR"},
    },
    {
        "title": "Data Analyst – SQL & Tableau",
        "description": "Turn raw data into actionable insights. You will build dashboards, write complex SQL queries, and present findings to stakeholders.\n\nResponsibilities:\n- Query large datasets using SQL\n- Build interactive Tableau dashboards\n- Perform ad-hoc analysis for product and marketing teams\n- Automate reporting pipelines",
        "required_skills": ["SQL", "Tableau", "Excel", "Python", "Data Analysis"],
        "required_experience": "0-2 years",
        "employment_type": "full-time",
        "salary_range": {"min": 400000, "max": 800000, "currency": "INR"},
    },
    {
        "title": "Mobile App Developer – React Native",
        "description": "Build cross-platform mobile apps that delight millions of users. You will collaborate with product managers and designers to ship polished features.\n\nResponsibilities:\n- Develop features in React Native\n- Integrate Firebase and REST APIs\n- Optimize performance on both iOS and Android\n- Publish builds to App Store and Play Store",
        "required_skills": ["React Native", "JavaScript", "Firebase", "iOS", "Android"],
        "required_experience": "1-3 years",
        "employment_type": "full-time",
        "salary_range": {"min": 600000, "max": 1200000, "currency": "INR"},
    },
    {
        "title": "Java Backend Developer – Spring Boot",
        "description": "Join our enterprise team and build robust microservices powering our core platform.\n\nResponsibilities:\n- Design Spring Boot microservices\n- Integrate with Kafka for event streaming\n- Write JUnit tests\n- Deploy to AWS ECS",
        "required_skills": ["Java", "Spring Boot", "Microservices", "Kafka", "AWS"],
        "required_experience": "3-5 years",
        "employment_type": "full-time",
        "salary_range": {"min": 1200000, "max": 2400000, "currency": "INR"},
    },
    {
        "title": "UI/UX Designer – Figma",
        "description": "Shape the visual language of our product. You will conduct user research, create wireframes, and work directly with engineers to bring designs to life.\n\nResponsibilities:\n- Create wireframes, prototypes, and high-fidelity mockups in Figma\n- Conduct user interviews and usability testing\n- Maintain the design system\n- Collaborate with frontend developers",
        "required_skills": ["UI/UX Design", "Figma", "User Research", "Sketch", "CSS"],
        "required_experience": "1-3 years",
        "employment_type": "full-time",
        "salary_range": {"min": 500000, "max": 1000000, "currency": "INR"},
    },
    {
        "title": "Python Data Engineering Intern",
        "description": "An exciting internship opportunity to work on real data pipelines and learn from experienced engineers.\n\nResponsibilities:\n- Assist in building ETL pipelines\n- Write Python scripts for data transformation\n- Document data flows\n- Work with the ML team on feature engineering",
        "required_skills": ["Python", "SQL", "Pandas", "ETL"],
        "required_experience": "0-1 years",
        "employment_type": "internship",
        "salary_range": {"min": 15000, "max": 25000, "currency": "INR"},
    },
    {
        "title": "Cloud Infrastructure Engineer (Remote)",
        "description": "Fully remote role to manage and scale our cloud infrastructure across multiple regions.\n\nResponsibilities:\n- Manage multi-region AWS deployments\n- Build Terraform modules\n- Implement cost optimization strategies\n- Respond to on-call incidents",
        "required_skills": ["AWS", "Terraform", "Docker", "Linux", "Python"],
        "required_experience": "2-5 years",
        "employment_type": "remote",
        "salary_range": {"min": 1200000, "max": 2500000, "currency": "INR"},
    },
    {
        "title": "React Native Developer – EdTech Startup",
        "description": "Help us bring quality education to millions of students via our mobile app.\n\nResponsibilities:\n- Build new features in React Native\n- Optimize app startup time and smooth animations\n- Integrate video streaming APIs\n- A/B test UI variants",
        "required_skills": ["React Native", "JavaScript", "iOS", "Android", "Firebase"],
        "required_experience": "1-2 years",
        "employment_type": "full-time",
        "salary_range": {"min": 700000, "max": 1300000, "currency": "INR"},
    },
    {
        "title": "Business Intelligence Analyst (Contract)",
        "description": "Short-term contract to build a BI reporting suite for our operations team.\n\nResponsibilities:\n- Design and build Power BI / Tableau dashboards\n- Write complex SQL queries\n- Identify KPIs and metrics\n- Present insights to C-suite",
        "required_skills": ["SQL", "Tableau", "Excel", "Data Analysis", "Python"],
        "required_experience": "2-4 years",
        "employment_type": "contract",
        "salary_range": {"min": 80000, "max": 150000, "currency": "INR"},
    },
    {
        "title": "Senior Python Engineer – FinTech",
        "description": "Lead the development of our core payment processing APIs.\n\nResponsibilities:\n- Architect and build payment integrations\n- Ensure PCI-DSS compliance\n- Lead code reviews and technical discussions\n- Mentor junior engineers",
        "required_skills": ["Python", "Django", "PostgreSQL", "REST APIs", "AWS"],
        "required_experience": "5+ years",
        "employment_type": "full-time",
        "salary_range": {"min": 2000000, "max": 3500000, "currency": "INR"},
    },
    {
        "title": "Part-Time Frontend Developer",
        "description": "Looking for a part-time React developer to maintain our marketing site and ship landing pages.\n\nResponsibilities:\n- Build and maintain landing pages\n- Implement designs from Figma\n- Optimize Core Web Vitals\n- Integrate CMS (Contentful/Sanity)",
        "required_skills": ["React", "JavaScript", "CSS", "HTML", "TypeScript"],
        "required_experience": "1-2 years",
        "employment_type": "part-time",
        "salary_range": {"min": 20000, "max": 40000, "currency": "INR"},
    },
]

APPLICATION_STATUSES = [
    "pending", "pending", "pending",   # weight towards pending (realistic)
    "reviewed", "reviewed",
    "shortlisted",
    "rejected",
]


# ── Main Seeder ───────────────────────────────────────────────────────────────

async def seed():
    print("\n🌱  InternX Database Seeder")
    print("=" * 50)

    # Connect
    client = AsyncIOMotorClient(
        MONGODB_URL,
        tls=True,
        tlsAllowInvalidCertificates=True
    )
    db = client[DATABASE_NAME]
    await client.admin.command("ping")
    print(f"✅  Connected to MongoDB: {DATABASE_NAME}\n")

    hashed_pw = hash_password(SEED_PASSWORD)

    # ── 1. Create Job Providers ──────────────────────────────────────────────
    print("👔  Creating Job Providers...")
    provider_ids = []
    for i, p in enumerate(JOB_PROVIDERS_RAW):
        company_name, company_city = COMPANIES[i]
        existing = await db.users.find_one({"email": p["email"]})
        if existing:
            print(f"   ⚠️  {p['email']} already exists, skipping.")
            provider_ids.append(str(existing["_id"]))
            continue

        doc = {
            "_id": ObjectId(),
            "email": p["email"],
            "hashed_password": hashed_pw,
            "role": "JOB_PROVIDER",
            "status": "active",
            "profile": {
                "fullName": p["name"],
                "phone": f"+91-98{random.randint(10000000, 99999999)}",
                "location": company_city,
                "linkedIn": f"https://linkedin.com/in/{p['name'].lower().replace(' ', '-')}",
                "github": "",
                "portfolio": f"https://{company_name.lower().replace(' ', '')}.com",
                "company": company_name,
                "bio": f"HR & Talent Acquisition at {company_name}. We are always looking for passionate engineers to join our growing team.",
                "resumeData": None,
            },
            "score": {"total_score": 0, "breakdown": {}, "last_updated": None, "score_history": []},
            "embedding": None,
            "created_at": rand_past(120),
            "updated_at": rand_past(30),
        }
        await db.users.insert_one(doc)
        provider_ids.append(str(doc["_id"]))
        print(f"   ✅  {p['name']} @ {company_name}")

    # ── 2. Create Job Seekers ────────────────────────────────────────────────
    print("\n👤  Creating Job Seekers...")
    seeker_ids = []
    seeker_skills_map = {}
    for i, s in enumerate(JOB_SEEKERS_RAW):
        existing = await db.users.find_one({"email": s["email"]})
        if existing:
            print(f"   ⚠️  {s['email']} already exists, skipping.")
            seeker_ids.append(str(existing["_id"]))
            seeker_skills_map[str(existing["_id"])] = s["skills"]
            continue

        college = random.choice(COLLEGES)
        grad_year = random.randint(2019, 2025)
        bio = BIOS[i % len(BIOS)]

        resume_data = {
            "personalInfo": {
                "name": s["name"],
                "email": s["email"],
                "phone": f"+91-99{random.randint(10000000, 99999999)}",
                "location": random.choice(["Bangalore", "Mumbai", "Delhi", "Pune", "Hyderabad"]),
                "linkedIn": f"https://linkedin.com/in/{s['name'].lower().replace(' ', '-')}",
                "github": f"https://github.com/{s['name'].split()[0].lower()}{random.randint(10, 99)}",
                "portfolio": "",
                "summary": bio,
            },
            "education": [
                {
                    "institution": college,
                    "degree": "B.Tech",
                    "field": "Computer Science & Engineering",
                    "startDate": f"{grad_year - 4}-07",
                    "endDate": f"{grad_year}-05",
                    "gpa": f"{round(random.uniform(7.0, 9.5), 1)}/10",
                }
            ],
            "experience": [
                {
                    "company": f"{random.choice(['StartupX', 'TechCorp', 'Infosys', 'Wipro', 'Accenture'])}",
                    "title": f"Junior {s['skills'][0]} Developer",
                    "location": "Bangalore",
                    "startDate": f"{grad_year}-07",
                    "endDate": "Present",
                    "description": f"Built and maintained production services using {', '.join(s['skills'][:3])}.",
                    "current": True,
                }
            ],
            "skills": s["skills"],
            "projects": [
                {
                    "name": f"Project Alpha - {s['skills'][0]} App",
                    "description": f"Built a full-featured application using {s['skills'][0]} and {s['skills'][1]}. Deployed on AWS with CI/CD.",
                    "technologies": s["skills"][:3],
                    "link": f"https://github.com/{s['name'].split()[0].lower()}/project-alpha",
                },
                {
                    "name": f"Project Beta",
                    "description": f"Open source tool built with {s['skills'][-1]}. Gained 50+ GitHub stars.",
                    "technologies": s["skills"][-2:],
                    "link": "",
                },
            ],
            "certifications": [
                {
                    "name": f"AWS Certified Developer – Associate" if "AWS" in s["skills"] else f"{s['skills'][0]} Professional Certificate",
                    "issuer": "Amazon Web Services" if "AWS" in s["skills"] else "Coursera",
                    "date": f"{grad_year + 1}-03",
                }
            ],
        }

        doc = {
            "_id": ObjectId(),
            "email": s["email"],
            "hashed_password": hashed_pw,
            "role": "JOB_SEARCHER",
            "status": "active",
            "profile": {
                "fullName": s["name"],
                "phone": f"+91-99{random.randint(10000000, 99999999)}",
                "location": resume_data["personalInfo"]["location"],
                "linkedIn": resume_data["personalInfo"]["linkedIn"],
                "github": resume_data["personalInfo"]["github"],
                "portfolio": "",
                "company": "",
                "bio": bio,
                "resumeData": resume_data,
            },
            "score": {
                "total_score": random.randint(40, 85),
                "breakdown": {
                    "skills": random.randint(10, 30),
                    "experience": random.randint(10, 25),
                    "education": random.randint(5, 15),
                    "projects": random.randint(5, 15),
                },
                "last_updated": rand_past(10),
                "score_history": [],
            },
            "embedding": None,
            "created_at": rand_past(90),
            "updated_at": rand_past(20),
        }
        await db.users.insert_one(doc)
        seeker_ids.append(str(doc["_id"]))
        seeker_skills_map[str(doc["_id"])] = s["skills"]
        print(f"   ✅  {s['name']} ({', '.join(s['skills'][:3])}...)")

    # ── 3. Create Jobs ───────────────────────────────────────────────────────
    print("\n💼  Creating Job Postings...")
    job_records = []  # list of (job_id, provider_id, required_skills)

    templates = random.sample(JOB_TEMPLATES, min(len(JOB_TEMPLATES), 15))

    for idx, tmpl in enumerate(templates):
        provider_id = provider_ids[idx % len(provider_ids)]
        provider_doc = await db.users.find_one({"_id": ObjectId(provider_id)})
        company = provider_doc["profile"]["company"] if provider_doc else "Unknown Company"

        job_oid = ObjectId()
        created = rand_past(60)
        doc = {
            "_id": job_oid,
            "provider_id": provider_id,
            "title": tmpl["title"],
            "description": tmpl["description"],
            "required_skills": tmpl["required_skills"],
            "required_experience": tmpl["required_experience"],
            "employment_type": tmpl["employment_type"],
            "salary_range": tmpl["salary_range"],
            "location": provider_doc["profile"]["location"] if provider_doc else "Bangalore",
            "application_deadline": rand_future(45),
            "status": "active",
            "stats": {
                "views": random.randint(20, 300),
                "applications": 0,  # will update after inserting applications
            },
            "company_name": company,
            "created_at": created,
            "updated_at": created,
        }
        # Check if similar job already exists
        existing_job = await db.jobs.find_one({"title": tmpl["title"], "provider_id": provider_id})
        if existing_job:
            print(f"   ⚠️  Job '{tmpl['title']}' already exists, skipping.")
            job_records.append((str(existing_job["_id"]), provider_id, tmpl["required_skills"]))
            continue

        await db.jobs.insert_one(doc)
        job_records.append((str(job_oid), provider_id, tmpl["required_skills"]))
        print(f"   ✅  [{tmpl['employment_type'].upper()}] {tmpl['title']} @ {company}")

    # ── 4. Create Applications ───────────────────────────────────────────────
    print("\n📨  Creating Job Applications...")
    applied_pairs = set()  # (seeker_id, job_id) – enforce no duplicates
    app_count = 0

    # Each seeker applies to 3–6 random jobs
    for seeker_id in seeker_ids:
        seeker_skills = set(seeker_skills_map.get(seeker_id, []))
        num_apps = random.randint(3, 6)
        shuffled_jobs = random.sample(job_records, min(num_apps, len(job_records)))

        for (job_id, provider_id, req_skills) in shuffled_jobs:
            if (seeker_id, job_id) in applied_pairs:
                continue
            if seeker_id == provider_id:
                continue

            # Check if application already exists
            existing_app = await db.applications.find_one({
                "applicant_id": seeker_id,
                "job_id": job_id,
            })
            if existing_app:
                applied_pairs.add((seeker_id, job_id))
                continue

            matched = seeker_skills & set(req_skills)
            match_pct = int((len(matched) / max(len(req_skills), 1)) * 100)

            # Fetch resume snapshot
            seeker_doc = await db.users.find_one({"_id": ObjectId(seeker_id)})
            resume_snap = seeker_doc["profile"].get("resumeData") if seeker_doc else None

            app_oid = ObjectId()
            created = rand_past(40)
            status = random.choice(APPLICATION_STATUSES)
            app_doc = {
                "_id": app_oid,
                "job_id": job_id,
                "applicant_id": seeker_id,
                "provider_id": provider_id,
                "status": status,
                "match_percentage": match_pct,
                "resume_snapshot": resume_snap,
                "cover_letter": random.choice(COVER_LETTERS),
                "created_at": created,
                "updated_at": created,
            }
            await db.applications.insert_one(app_doc)
            applied_pairs.add((seeker_id, job_id))
            app_count += 1

            # Update job application count
            await db.jobs.update_one(
                {"_id": ObjectId(job_id)},
                {"$inc": {"stats.applications": 1}}
            )

    print(f"   ✅  Created {app_count} applications")

    # ── Summary ──────────────────────────────────────────────────────────────
    total_users   = await db.users.count_documents({})
    total_jobs    = await db.jobs.count_documents({})
    total_apps    = await db.applications.count_documents({})

    print("\n" + "=" * 50)
    print("🎉  Seeding Complete!")
    print(f"   👥  Total Users        : {total_users}")
    print(f"   💼  Total Jobs         : {total_jobs}")
    print(f"   📨  Total Applications : {total_apps}")
    print(f"\n   🔑  All seed accounts use password: {SEED_PASSWORD}")
    print("\n   Sample credentials:")
    print(f"   Seeker   → {JOB_SEEKERS_RAW[0]['email']}  / {SEED_PASSWORD}")
    print(f"   Provider → {JOB_PROVIDERS_RAW[0]['email']} / {SEED_PASSWORD}")
    print("=" * 50 + "\n")

    client.close()


if __name__ == "__main__":
    asyncio.run(seed())
