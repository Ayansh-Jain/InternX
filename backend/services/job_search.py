"""
AI-powered external job search service.
Uses JSearch API (via RapidAPI) to fetch real jobs from LinkedIn, Indeed, etc.
Falls back to Gemini AI for smart query expansion.
"""

import os
import json
import httpx
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
JSEARCH_API_KEY = os.getenv("JSEARCH_API_KEY")

# Try new SDK first, fall back gracefully
gemini_model = None
try:
    from google import genai as google_genai
    if GEMINI_API_KEY:
        _client = google_genai.Client(api_key=GEMINI_API_KEY)
        gemini_model = _client
except ImportError:
    try:
        import google.generativeai as genai_legacy
        if GEMINI_API_KEY:
            genai_legacy.configure(api_key=GEMINI_API_KEY)
            gemini_model = genai_legacy.GenerativeModel('gemini-1.5-flash')
    except Exception:
        pass
except Exception:
    pass

# Trusted source domains - only show verified sites
TRUSTED_DOMAINS = [
    "linkedin.com", "indeed.com", "internshala.com", "devfolio.co",
    "unstop.com", "wellfound.com", "glassdoor.com", "naukri.com",
    "remotive.com", "workatastartup.com", "lever.co", "greenhouse.io",
    "workday.com", "jobs.google.com", "microsoft.com", "amazon.jobs"
]


def _expand_query_with_ai(query: str) -> List[str]:
    """Use Gemini to expand a search query into multiple related job titles."""
    if not gemini_model:
        return [query]
    try:
        prompt = f"""You are a job search expert. Expand the user's job search query into 3-5 related professional job titles to maximize search coverage. Return ONLY a JSON array of strings. No explanation.

User query: "{query}"

Example output: ["Software Engineer Intern", "Backend Developer Intern", "Full Stack Intern"]"""

        # Handle both new google.genai and old google.generativeai
        if hasattr(gemini_model, 'models'):
            # New google.genai SDK
            response = gemini_model.models.generate_content(
                model='gemini-1.5-flash', contents=prompt
            )
            text = response.text.strip()
        else:
            # Old google.generativeai SDK
            response = gemini_model.generate_content(prompt)
            text = response.text.strip()

        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
        titles = json.loads(text)
        return titles[:5] if isinstance(titles, list) else [query]
    except Exception:
        return [query]


def _check_trusted(url: str) -> bool:
    """Check if a URL belongs to a trusted domain."""
    if not url:
        return False
    url_lower = url.lower()
    return any(domain in url_lower for domain in TRUSTED_DOMAINS)


async def search_external_jobs(
    query: str,
    job_type: Optional[str] = None,
    location: Optional[str] = None,
    page: int = 1
) -> Dict[str, Any]:
    """
    Search for real jobs from LinkedIn, Indeed, Internshala etc. via JSearch API.
    Returns verified opportunities with direct apply links.
    """

    # Step 1: Expand query with AI
    expanded_titles = _expand_query_with_ai(query)
    search_query = expanded_titles[0]  # Use the best expanded title for API

    # Add location and type context to search
    if location:
        search_query = f"{search_query} {location}"
    if job_type:
        search_query = f"{search_query} {job_type}"

    # Step 2: Fetch from JSearch API if key exists
    results = []
    source_used = "ai_generated"

    if JSEARCH_API_KEY:
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.get(
                    "https://jsearch.p.rapidapi.com/search",
                    headers={
                        "X-RapidAPI-Key": JSEARCH_API_KEY,
                        "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
                    },
                    params={
                        "query": search_query,
                        "page": str(page),
                        "num_pages": "1",
                        "date_posted": "month"
                    }
                )
                if response.status_code == 200:
                    data = response.json()
                    raw_jobs = data.get("data", [])
                    source_used = "jsearch_api"

                    for job in raw_jobs:
                        apply_url = (
                            job.get("job_apply_link") or
                            job.get("job_url") or
                            f"https://www.google.com/search?q={job.get('job_title', '')}+{job.get('employer_name', '')}"
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
                        })
        except Exception as e:
            print(f"JSearch API error: {e}")

    # Step 3: If no API key or API failed, generate smart placeholder results
    if not results:
        source_used = "smart_links"
        # Generate verified direct search links for trusted sites
        results = _generate_smart_links(query, location, job_type, expanded_titles)

    return {
        "query": query,
        "expanded_titles": expanded_titles,
        "source": source_used,
        "total": len(results),
        "results": results
    }


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


def _generate_smart_links(
    query: str,
    location: Optional[str],
    job_type: Optional[str],
    expanded_titles: List[str]
) -> List[Dict[str, Any]]:
    """
    Generate direct deep-links to job search pages on trusted sites.
    These are real URLs - clicking them opens actual job listings.
    """
    from urllib.parse import quote_plus

    q = quote_plus(query)
    loc = quote_plus(location or "")
    results = []

    platforms = [
        {
            "name": "LinkedIn",
            "url": f"https://www.linkedin.com/jobs/search/?keywords={q}&location={loc}",
            "logo": "https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png",
        },
        {
            "name": "Indeed",
            "url": f"https://www.indeed.com/jobs?q={q}&l={loc}",
            "logo": "https://upload.wikimedia.org/wikipedia/commons/f/fc/Indeed_logo.png",
        },
        {
            "name": "Internshala",
            "url": f"https://internshala.com/internships/{q.replace('+', '-').lower()}-internship",
            "logo": "https://internshala.com/static/images/logo.png",
        },
        {
            "name": "Unstop",
            "url": f"https://unstop.com/jobs?search={q}",
            "logo": "https://d8it4huxumps7.cloudfront.net/lambda-images/organisation/logos/unstop-logo.png",
        },
        {
            "name": "Devfolio",
            "url": f"https://devfolio.co/hackathons",
            "logo": "https://devfolio.co/favicon.ico",
        },
        {
            "name": "Naukri",
            "url": f"https://www.naukri.com/{q.replace('+', '-')}-jobs",
            "logo": "https://static.naukimg.com/s/4/100/i/naukri_Logo.png",
        },
        {
            "name": "Wellfound",
            "url": f"https://wellfound.com/jobs?role={q}",
            "logo": "https://wellfound.com/favicon.ico",
        },
        {
            "name": "Glassdoor",
            "url": f"https://www.glassdoor.com/Job/jobs.htm?sc.keyword={q}&locT=C&locId=",
            "logo": "https://upload.wikimedia.org/wikipedia/commons/e/e1/Glassdoor_logo.svg",
        },
    ]

    for i, platform in enumerate(platforms):
        results.append({
            "id": f"smart-{i}",
            "title": f"{query} opportunities",
            "company": f"Browse on {platform['name']}",
            "location": location or "Multiple Locations",
            "type": job_type or "All Types",
            "salary": None,
            "apply_url": platform["url"],
            "source": platform["name"],
            "posted_at": None,
            "description_snippet": f"Click to search for '{query}' opportunities directly on {platform['name']}. Opens the real job listings page.",
            "is_verified": True,
            "logo": platform["logo"],
        })

    return results
