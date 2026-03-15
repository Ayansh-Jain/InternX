"""
AI-powered external job search service.
Uses JSearch API (via RapidAPI) when available.
Falls back to a smart template-based generator that produces realistic job listings
using real company names, role-specific descriptions, and INR salaries.
<<<<<<< HEAD
"""

import os
import uuid
import random
=======
Results rotate daily so the same search shows fresh listings each day.
"""

import os
import random
from datetime import datetime, timedelta
>>>>>>> vinya
import httpx
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
from urllib.parse import quote_plus

load_dotenv()

JSEARCH_API_KEY = os.getenv("JSEARCH_API_KEY")

# ── Trusted domains ───────────────────────────────────────────────────────────
TRUSTED_DOMAINS = [
    "linkedin.com", "indeed.com", "internshala.com", "devfolio.co",
    "unstop.com", "wellfound.com", "glassdoor.com", "naukri.com",
    "remotive.com", "workatastartup.com", "lever.co", "greenhouse.io",
    "workday.com", "jobs.google.com", "microsoft.com", "amazon.jobs"
]

# ── Platform URL builders ─────────────────────────────────────────────────────
PLATFORMS = [
<<<<<<< HEAD
    {"name": "LinkedIn",    "url": lambda q, l: f"https://www.linkedin.com/jobs/search/?keywords={quote_plus(q)}&location={quote_plus(l or '')}"},
    {"name": "Indeed",      "url": lambda q, l: f"https://www.indeed.com/jobs?q={quote_plus(q)}&l={quote_plus(l or '')}"},
    {"name": "Internshala", "url": lambda q, l: f"https://internshala.com/internships/{quote_plus(q).replace('+','-').lower()}-internship"},
    {"name": "Naukri",      "url": lambda q, l: f"https://www.naukri.com/{quote_plus(q).replace('+','-').lower()}-jobs"},
    {"name": "Unstop",      "url": lambda q, l: f"https://unstop.com/jobs?search={quote_plus(q)}"},
    {"name": "Wellfound",   "url": lambda q, l: f"https://wellfound.com/jobs?role={quote_plus(q)}"},
    {"name": "Glassdoor",   "url": lambda q, l: f"https://www.glassdoor.com/Job/jobs.htm?sc.keyword={quote_plus(q)}"},
    {"name": "Devfolio",    "url": lambda q, l: "https://devfolio.co/hackathons"},
]

# ── Template data pools ───────────────────────────────────────────────────────
TECH_COMPANIES = [
    "Google", "Microsoft", "Amazon", "Flipkart", "Swiggy", "Zomato",
    "Razorpay", "CRED", "Meesho", "Zepto", "Groww", "PhonePe",
    "Freshworks", "Zoho", "Infosys", "Wipro", "TCS", "HCL",
    "Paytm", "Ola", "Dunzo", "Slice", "Open Financial", "Postman",
    "BrowserStack", "InMobi", "Truecaller", "Nykaa", "Lenskart",
    "Dream11", "MPL", "Vedantu", "Unacademy", "BYJU'S", "upGrad",
    "Springworks", "Chargebee", "Hasura", "Setu", "Sarvam AI",
]

NON_TECH_COMPANIES = [
    "Deloitte", "PwC", "EY", "KPMG", "McKinsey & Company",
    "Boston Consulting Group", "Accenture", "Capgemini",
    "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Mahindra Bank",
    "Reliance Industries", "Tata Consultancy Services", "Mahindra", "Bajaj",
    "Aditya Birla Group", "ITC", "Hindustan Unilever",
]

# Domain-specific company pools — matched to role keywords
COMPANY_POOLS = {
    # Frontend / React / Mobile
    "react":    ["Flipkart", "Swiggy", "Meesho", "Razorpay", "CRED", "Nykaa", "Lenskart", "Postman"],
    "frontend": ["Flipkart", "Zomato", "Meesho", "CRED", "Razorpay", "Dunzo", "BrowserStack", "InMobi"],
    "mobile":   ["Paytm", "PhonePe", "Ola", "Swiggy", "Dream11", "MPL", "Truecaller", "Nykaa"],
    "android":  ["Paytm", "PhonePe", "Truecaller", "Ola", "Dream11", "Swiggy", "Meesho", "Lenskart"],
    "ios":      ["Phonepe", "Ola", "Swiggy", "Dream11", "Nykaa", "CRED", "Razorpay", "Lenskart"],
    # Backend / Infrastructure
    "backend":  ["Google", "Microsoft", "Freshworks", "Chargebee", "Hasura", "Setu", "Postman", "Zoho"],
    "node":     ["Freshworks", "Chargebee", "Hasura", "Razorpay", "Postman", "Springworks", "Zoho", "Setu"],
    "python":   ["Google", "Microsoft", "Freshworks", "Sarvam AI", "Zoho", "Hasura", "Chargebee", "upGrad"],
    "java":     ["TCS", "Infosys", "Wipro", "HCL", "Freshworks", "Zoho", "Capgemini", "Accenture"],
    "golang":   ["Google", "Microsoft", "Razorpay", "Postman", "Hasura", "BrowserStack", "Gojek", "Setu"],
    "devops":   ["Google", "Microsoft", "Amazon", "Freshworks", "BrowserStack", "Chargebee", "Postman", "Hasura"],
    "cloud":    ["Google", "Microsoft", "Amazon", "Infosys", "TCS", "Wipro", "Capgemini", "HCL"],
    # Data / Analytics / ML / AI
    "data":     ["Google", "Microsoft", "Flipkart", "Swiggy", "Zomato", "Razorpay", "Meesho", "Zepto"],
    "analytics":["Flipkart", "Swiggy", "Myntra", "Amazon", "Jio", "BigBasket", "Meesho", "PhonePe"],
    "machine learning": ["Google", "Microsoft", "Sarvam AI", "Amazon", "Flipkart", "upGrad", "Freshworks", "Zepto"],
    "ml":       ["Google", "Microsoft", "Sarvam AI", "Amazon", "Flipkart", "Razorpay", "Groww", "Zepto"],
    "ai":       ["Google", "Microsoft", "Sarvam AI", "Amazon", "Freshworks", "upGrad", "Postman", "Hasura"],
    "nlp":      ["Google", "Microsoft", "Sarvam AI", "Amazon", "Freshworks", "BrowserStack", "Sprinklr", "Zoho"],
    # Design / UX
    "design":   ["Flipkart", "Swiggy", "CRED", "Razorpay", "Nykaa", "Meesho", "Lenskart", "Dunzo"],
    "ux":       ["Flipkart", "CRED", "Swiggy", "Razorpay", "Nykaa", "Lenskart", "Dream11", "Meesho"],
    "ui":       ["Flipkart", "CRED", "Swiggy", "Razorpay", "Nykaa", "Lenskart", "Dream11", "Meesho"],
    # Product / Growth
    "product":  ["Razorpay", "CRED", "Groww", "Slice", "PhonePe", "Meesho", "Zepto", "Open Financial"],
    "growth":   ["Swiggy", "Zomato", "Meesho", "CRED", "Razorpay", "Dream11", "Nykaa", "upGrad"],
    # Finance / Fintech
    "finance":  ["Zerodha", "Groww", "Razorpay", "HDFC Bank", "ICICI Bank", "Slice", "PhonePe", "Paytm"],
    "fintech":  ["Razorpay", "Groww", "Zerodha", "Slice", "Open Financial", "PhonePe", "Paytm", "BharatPe"],
    "banking":  ["HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Mahindra", "SBI", "Yes Bank", "IndusInd Bank", "RBL Bank"],
    # Marketing / Content
    "marketing":["Zomato", "Swiggy", "Nykaa", "CRED", "Meesho", "Lenskart", "upGrad", "Dunzo"],
    "content":  ["upGrad", "BYJU'S", "Unacademy", "Vedantu", "Zomato", "Swiggy", "Nykaa", "CRED"],
    # Education / Edtech
    "edtech":   ["BYJU'S", "Unacademy", "Vedantu", "upGrad", "Classplus", "Doubtnut", "Toppr", "Eruditus"],
    # Consulting
    "consulting":["Deloitte", "PwC", "EY", "KPMG", "McKinsey & Company", "BCG", "Accenture", "Capgemini"],
    # Security
    "security":  ["Microsoft", "Google", "BrowserStack", "Wipro", "TCS", "HCL", "Infosys", "Accenture"],
    # Hackathon
    "hackathon": ["Unstop", "Devfolio", "HackerEarth", "CodeChef", "Smart India Hackathon", "HackIndia", "GitHub", "MLH"],
    # Generic tech (default)
    "default":  ["Google", "Microsoft", "Flipkart", "Swiggy", "Razorpay", "CRED", "Zepto", "Freshworks"],
=======
    {"name": "LinkedIn",    "url": lambda t, c, l: f"https://www.linkedin.com/jobs/search/?keywords={quote_plus(f'{t} {c}')}&location={quote_plus(l or '')}"},
    {"name": "Indeed",      "url": lambda t, c, l: f"https://www.indeed.com/jobs?q={quote_plus(f'{t} {c}')}&l={quote_plus(l or '')}"},
    {"name": "Internshala", "url": lambda t, c, l: f"https://internshala.com/internships/work-from-home-internships/?search_query={quote_plus(f'{t} {c}')}"},
    {"name": "Naukri",      "url": lambda t, c, l: f"https://www.naukri.com/{quote_plus(f'{t}-{c}').replace('+','-').lower()}-jobs"},
    {"name": "Unstop",      "url": lambda t, c, l: f"https://unstop.com/jobs?search={quote_plus(f'{t} {c}')}"},
    {"name": "Wellfound",   "url": lambda t, c, l: f"https://wellfound.com/jobs?role={quote_plus(t)}&company={quote_plus(c)}"},
    {"name": "Glassdoor",   "url": lambda t, c, l: f"https://www.glassdoor.com/Job/jobs.htm?sc.keyword={quote_plus(f'{t} {c}')}"},
    {"name": "Devfolio",    "url": lambda t, c, l: "https://devfolio.co/hackathons"},
]

# ── Template data pools ───────────────────────────────────────────────────────
# ── Template data pools — GENERIC / NON-FAKE ──────────────────────────────────
# Using descriptors instead of specific names to avoid "fake" data
GENERIC_TECH_DESCRIPTORS = [
    "Product Tech Startup", "Early-stage Fintech", "Unicorn SaaS Firm", 
    "Top-tier MNC", "Agile Software House", "Global Tech Giant",
    "E-commerce Leader", "AI Research Lab", "Cloud Infrastructure Firm",
    "Cybersecurity Specialist", "EdTech Innovator", "B2B SaaS Startup"
]

GENERIC_NON_TECH_DESCRIPTORS = [
    "Big 4 Consulting Firm", "Leading Private Bank", "Global Investment Bank",
    "FMCG Major", "Strategic Growth Firm", "Business Operations Lead",
    "Digital Marketing Agency", "EdTech Content House"
]

# Domain-specific generic pools
COMPANY_POOLS = {
    "frontend": ["High-growth Product Startup", "E-commerce Giant", "UX-focused Fintech", "Design-led Tech Firm"],
    "backend":  ["Stealth SaaS Startup", "Scalable Infrastructure Firm", "Cloud native MNC", "Backend Systems Specialist"],
    "mobile":   ["Top Mobile App Studio", "Consumer Tech Unicorn", "Fintech Mobile Lead"],
    "data":     ["Data Analytics MNC", "AI Solutions Lab", "ML Research Center"],
    "fintech":  ["Leading Neo-bank", "WealthTech Startup", "Payments Infrastructure Firm"],
    "marketing":["Growth Marketing Agency", "Consumer Brand MNC", "Digital Strategy House"],
    "consulting":["Global Management Consulting", "Strategy & Operations Firm", "IT Advisory House"],
    "default":  ["Tech-first MNC", "High-growth Startup", "Product Innovation Lab"]
>>>>>>> vinya
}

CITIES = [
    "Bangalore", "Mumbai", "Hyderabad", "Chennai", "Pune",
    "Delhi NCR", "Gurgaon", "Noida", "Kolkata", "Ahmedabad",
]

# Role-specific description templates  {keyword: [description, ...]}
DESCRIPTIONS = {
    "default": [
        "Work closely with senior engineers to design, build, and ship high-quality features. Participate in code reviews, sprint planning, and cross-functional team discussions.",
        "Collaborate with product and design teams to translate requirements into robust implementations. Own end-to-end delivery of features from ideation to production.",
        "Contribute to the architecture and development of scalable systems serving millions of users. Gain hands-on exposure to cutting-edge technologies and best practices.",
        "Join a fast-paced team where you will tackle real engineering challenges, write clean maintainable code, and continuously improve system performance.",
    ],
    "react": [
        "Build responsive, performant React applications with TypeScript. Work on component libraries, state management (Redux/Zustand), and integrations with REST/GraphQL APIs.",
        "Develop reusable UI components and micro-frontends using React 18+ and Next.js. Optimize rendering performance, accessibility (WCAG), and Core Web Vitals scores.",
        "Lead frontend architecture decisions, implement design systems, and mentor junior developers. Own the full React development lifecycle from wireframes to deployment.",
    ],
    "frontend": [
        "Design and implement pixel-perfect UIs from Figma designs. Ensure cross-browser compatibility, write unit tests with Jest, and maintain 90%+ Lighthouse scores.",
        "Build interactive dashboards and data-visualization components using React, D3.js, and Chart.js. Integrate real-time WebSocket data feeds.",
    ],
    "backend": [
        "Design and implement RESTful and GraphQL APIs using Node.js/Python/Go. Optimize database queries, implement caching strategies, and ensure high availability.",
        "Build microservices for high-throughput systems handling 10M+ requests/day. Own service reliability, monitoring (Grafana/Prometheus), and on-call rotations.",
        "Architect event-driven systems using Kafka/RabbitMQ. Write integration tests, manage CI/CD pipelines, and drive engineering excellence initiatives.",
    ],
    "data": [
        "Analyze large datasets using Python, SQL, and PySpark. Build ETL pipelines, develop dashboards in Tableau/Metabase, and present insights to business stakeholders.",
        "Design and maintain data warehouses on BigQuery/Snowflake. Develop ML feature pipelines and collaborate with data scientists to deploy models at scale.",
        "Conduct A/B tests, build predictive models, and own end-to-end analytics for user growth and engagement metrics.",
    ],
    "machine learning": [
        "Train, evaluate, and deploy ML models for recommendation, NLP, and computer vision use cases. Contribute to the MLOps infrastructure and model monitoring.",
        "Research and implement state-of-the-art deep learning architectures. Fine-tune LLMs for domain-specific tasks and build end-to-end AI products.",
    ],
    "ai": [
        "Build and fine-tune large language models and generative AI systems. Develop prompt engineering frameworks, RAG pipelines, and AI evaluation benchmarks.",
        "Research novel AI/ML techniques and translate them into production-grade systems. Work on model alignment, safety, and performance optimization.",
    ],
    "product": [
        "Define product strategy, write PRDs, and work with engineering and design to ship customer-centric features. Run discovery interviews, analyze metrics, and prioritize the roadmap.",
        "Own 0-to-1 product development for a new business vertical. Coordinate across growth, marketing, and engineering teams to deliver measurable outcomes.",
    ],
    "design": [
        "Create wireframes, interactive prototypes, and production-ready designs in Figma. Conduct usability testing, maintain the design system, and collaborate with engineers.",
        "Lead UX research — user interviews, surveys, journey mapping — and translate insights into delightful product experiences that increase conversion and retention.",
    ],
    "devops": [
        "Manage cloud infrastructure (AWS/GCP/Azure) using Terraform and Kubernetes. Implement CI/CD pipelines, security best practices, and cost optimization strategies.",
        "Build and maintain observability stacks (ELK, Prometheus, Grafana). Drive SRE practices, incident response, and infrastructure-as-code adoption.",
    ],
    "security": [
        "Perform penetration testing, vulnerability assessments, and security code reviews. Develop security policies and work with engineering teams to remediate findings.",
    ],
    "marketing": [
        "Plan and execute performance marketing campaigns across Google, Meta, and programmatic channels. Analyze ROAS, CAC, and LTV to optimize spend and creative.",
        "Build and grow organic channels (SEO, content, community) alongside paid acquisition. Own brand storytelling across digital platforms.",
    ],
    "finance": [
        "Perform financial modeling, variance analysis, and management reporting. Support FP&A cycles, investor relations, and strategic planning initiatives.",
    ],
    "sales": [
        "Own the full sales cycle from prospecting to closure for mid-market and enterprise accounts. Collaborate with solutions engineering and customer success teams.",
    ],
    "internship": [
        "Gain real-world experience by contributing to live products used by millions. Receive mentorship, attend weekly tech talks, and present your work at intern demo day.",
        "Work on impactful projects with a dedicated buddy and manager. Eligible for a pre-placement offer based on performance.",
    ],
    "hackathon": [
        "Compete in a 48-hour hackathon with ₹5 lakh prize pool. Theme: AI-powered solutions for Bharat. Open to undergraduate and postgraduate students.",
        "Join India's biggest student innovation challenge. Build MVPs, get mentored by industry leaders, and win internship offers from top startups.",
    ],
}

SALARY_RANGES = {
    "internship":   ["₹8,000/month", "₹10,000/month", "₹12,000/month", "₹15,000/month", "₹20,000/month", "₹25,000/month"],
    "part-time":    ["₹15,000/month", "₹20,000/month", "₹25,000/month", "₹30,000/month"],
    "full-time":    ["₹6–10 LPA", "₹10–15 LPA", "₹12–18 LPA", "₹15–22 LPA", "₹18–28 LPA", "₹25–40 LPA"],
    "contract":     ["₹50,000/month", "₹60,000/month", "₹80,000/month", "₹1,00,000/month"],
    "hackathon":    ["Prize: ₹1 Lakh", "Prize: ₹2 Lakh", "Prize: ₹5 Lakh", "No stipend — equity potential"],
    "remote":       ["₹8–12 LPA", "₹12–18 LPA", "₹15–25 LPA", "$2,000–3,000/month"],
    "default":      ["₹8–12 LPA", "₹12–18 LPA", "₹15–22 LPA", "Competitive"],
}


def _get_description(query: str, job_type: Optional[str]) -> str:
    q_lower = query.lower()
    # Try to match specific role keywords
    for key, descs in DESCRIPTIONS.items():
        if key in q_lower:
            return random.choice(descs)
    # Fall back to job_type match
    if job_type and job_type.lower() in DESCRIPTIONS:
        return random.choice(DESCRIPTIONS[job_type.lower()])
    return random.choice(DESCRIPTIONS["default"])


def _get_salary(job_type: Optional[str]) -> str:
    key = (job_type or "").lower()
    pool = SALARY_RANGES.get(key, SALARY_RANGES["default"])
    return random.choice(pool)


def _get_work_mode_label(work_mode: Optional[str], location: Optional[str]) -> str:
    if work_mode and work_mode.lower() in ("remote", "hybrid", "onsite"):
        return work_mode.title()
    return random.choice(["Onsite", "Remote", "Hybrid"])


def _pick_companies(query: str, job_type: Optional[str], count: int, seed: int) -> List[str]:
    """
    Pick companies relevant to the role/domain from the query.
    The seed ensures the same search always returns the same companies.
    """
    q_lower = query.lower()
    pool = None

    # Match specific role keywords to company pools (longest match wins)
    for key in sorted(COMPANY_POOLS.keys(), key=len, reverse=True):
        if key in q_lower:
            pool = COMPANY_POOLS[key]
            break

    # Fall back to job_type match
    if not pool and job_type:
        jt = job_type.lower()
        pool = COMPANY_POOLS.get(jt)

    # Final fallback
    if not pool:
        pool = COMPANY_POOLS["default"]

    # Deterministic shuffle using query seed
    rng = random.Random(seed)
    shuffled = pool[:]
    rng.shuffle(shuffled)
<<<<<<< HEAD
    # If we need more companies than the pool has, extend with the default pool
    if len(shuffled) < count:
        extra = COMPANY_POOLS["default"][:]
=======
    # If we need more companies than the pool has, extend with the tech descriptors
    if len(shuffled) < count:
        extra = GENERIC_TECH_DESCRIPTORS[:]
>>>>>>> vinya
        rng.shuffle(extra)
        for c in extra:
            if c not in shuffled:
                shuffled.append(c)
    return shuffled[:count]


def _build_title(query: str, job_type: Optional[str]) -> str:
    """Create a realistic job title from the query."""
    q = query.strip().title()
    jt = (job_type or "").lower()
    if jt == "internship":
        suffixes = ["Intern", "Trainee", "Summer Intern", "Industrial Trainee"]
        return f"{q} {random.choice(suffixes)}"
    if jt == "hackathon":
        prefixes = ["HackIndia", "Smart India Hackathon", "Unstop Challenge", "DevSprint"]
        return f"{random.choice(prefixes)} — {q} Track"
    if jt == "contract":
        return f"{q} (Contract)"
    if jt == "part-time":
        return f"{q} (Part-Time)"
    return q


def _generate_smart_listings(
    query: str,
    location: Optional[str],
    job_type: Optional[str],
    work_mode: Optional[str],
    count: int = 8,
) -> List[Dict[str, Any]]:
    """
    Generate diverse, realistic-looking job listings:
    - Company names are relevant to the search domain
    - Descriptions are role-specific
    - Salary/stipend is appropriate to the opportunity type
    - Results are deterministic (same search = same results)
    """
<<<<<<< HEAD
    # Deterministic seed from query so same search = same results
    seed = hash(query.lower().strip() + (job_type or '') + (location or ''))
=======
    # Daily-rotating seed: same search returns same results within a day,
    # but refreshes each new day so users see fresh listings.
    today = datetime.utcnow().strftime("%Y-%m-%d")
    seed = hash(query.lower().strip() + (job_type or '') + (location or '') + today)
>>>>>>> vinya

    rng = random.Random(seed)
    companies = _pick_companies(query, job_type, count, seed)
    loc = location or rng.choice(CITIES)

    platforms_shuffled = PLATFORMS[:]
    rng.shuffle(platforms_shuffled)

<<<<<<< HEAD
=======
    # Offsets for posted_at so each listing appears to have been posted 1-10 days ago
    day_offsets = list(range(1, 11))
    rng.shuffle(day_offsets)

>>>>>>> vinya
    results = []
    for i in range(min(count, len(companies))):
        platform = platforms_shuffled[i % len(platforms_shuffled)]
        wm = _get_work_mode_label(work_mode, location)
        job_location = "Remote" if wm == "Remote" else loc
<<<<<<< HEAD

        results.append({
            "id": f"smart-{abs(seed) % 99999:05d}-{i}",
            "title": _build_title(query, job_type),
            "company": companies[i],
            "location": job_location,
            "type": (job_type.title() if job_type else "Full-Time"),
            "salary": _get_salary(job_type),
            "apply_url": platform["url"](query, location),
            "source": platform["name"],
            "posted_at": None,
=======
        posted_date = (datetime.utcnow() - timedelta(days=day_offsets[i % len(day_offsets)])).isoformat() + "Z"
        
        job_title = _build_title(query, job_type)
        company_name = companies[i]

        results.append({
            "id": f"smart-{abs(seed) % 99999:05d}-{i}",
            "title": job_title,
            "company": company_name,
            "location": job_location,
            "type": (job_type.title() if job_type else "Full-Time"),
            "salary": _get_salary(job_type),
            "apply_url": platform["url"](job_title, company_name, job_location),
            "source": platform["name"],
            "posted_at": posted_date,
>>>>>>> vinya
            "description_snippet": _get_description(query, job_type),
            "is_verified": True,
            "logo": None,
            "ai_generated": True,
        })

    return results


# ── Helpers ───────────────────────────────────────────────────────────────────
def _check_trusted(url: str) -> bool:
    if not url:
        return False
    return any(d in url.lower() for d in TRUSTED_DOMAINS)


def _format_salary(min_sal, max_sal, currency):
    if not min_sal and not max_sal:
        return None
    currency = currency or "USD"
    if min_sal and max_sal:
        return f"{currency} {int(min_sal):,} – {int(max_sal):,}"
    if min_sal:
        return f"{currency} {int(min_sal):,}+"
    return None


def _get_source_name(url: str) -> str:
    if not url:
        return "External"
    for domain in TRUSTED_DOMAINS:
        if domain in url.lower():
            return domain.replace(".com", "").replace(".co", "").title()
    return "External"


# ── Main search function ──────────────────────────────────────────────────────
async def search_external_jobs(
    query: str,
    job_type: Optional[str] = None,
    location: Optional[str] = None,
    work_mode: Optional[str] = None,
    page: int = 1,
) -> Dict[str, Any]:
    """
    Search for jobs from LinkedIn, Indeed, Internshala etc. via JSearch API.
    Falls back to smart template-based realistic listings when JSearch is unavailable.
    """
    results = []
    source_used = "smart_listings"

    # Step 1: Build enriched search query
    search_query = query
    if location:
        search_query = f"{search_query} {location}"
    if job_type:
        search_query = f"{search_query} {job_type}"
    if work_mode:
        search_query = f"{search_query} {work_mode}"

    # Step 2: Try JSearch API if key exists
    if JSEARCH_API_KEY:
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.get(
                    "https://jsearch.p.rapidapi.com/search",
                    headers={
                        "X-RapidAPI-Key": JSEARCH_API_KEY,
                        "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
                    },
                    params={
                        "query": search_query,
                        "page": str(page),
                        "num_pages": "1",
                        "date_posted": "month",
                    },
                )
                if response.status_code == 200:
                    data = response.json()
                    raw_jobs = data.get("data", [])
                    source_used = "jsearch_api"
                    for job in raw_jobs:
                        apply_url = (
                            job.get("job_apply_link")
                            or job.get("job_url")
                            or f"https://www.google.com/search?q={job.get('job_title','')}+{job.get('employer_name','')}"
                        )
                        results.append({
                            "id": job.get("job_id", ""),
                            "title": job.get("job_title", "Unknown Role"),
                            "company": job.get("employer_name", "Unknown Company"),
                            "location": job.get("job_city") or job.get("job_country") or "Remote",
                            "type": job.get("job_employment_type", "FULLTIME").replace("_", " ").title(),
                            "salary": _format_salary(job.get("job_min_salary"), job.get("job_max_salary"), job.get("job_salary_currency")),
                            "apply_url": apply_url,
                            "source": _get_source_name(apply_url),
                            "posted_at": job.get("job_posted_at_datetime_utc", ""),
                            "description_snippet": (job.get("job_description") or "")[:300] + "...",
                            "is_verified": _check_trusted(apply_url),
                            "logo": job.get("employer_logo"),
                            "ai_generated": False,
                        })
        except Exception as e:
            print(f"[job_search] JSearch API error: {e}")

<<<<<<< HEAD
    # Step 3: Fall back to smart template listings
    if not results:
        source_used = "smart_listings"
=======
    # Step 3: Fall back to smart template listings ONLY if no results were found
    if not results:
        source_used = "smart_listings"
        # Using generic descriptors instead of specific company names to avoid "fake" data
>>>>>>> vinya
        results = _generate_smart_listings(query, location, job_type, work_mode)

    return {
        "query": query,
        "source": source_used,
        "total": len(results),
        "results": results,
    }
