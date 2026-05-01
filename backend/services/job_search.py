"""
AI-powered external job search service.
Uses JSearch API (via RapidAPI) when available.
Falls back to a smart template-based generator that produces realistic job listings
using real company names, role-specific descriptions, and INR salaries.
Results rotate daily so the same search shows fresh listings each day.
"""

import os
import random
from datetime import datetime, timedelta

import httpx
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
from urllib.parse import quote_plus

load_dotenv()

JSEARCH_API_KEY = os.getenv("JSEARCH_API_KEY")
SERPAPI_KEY = os.getenv("SERPAPI_KEY")

# ── Trusted domains ───────────────────────────────────────────────────────────
TRUSTED_DOMAINS = [
    "linkedin.com", "indeed.com", "internshala.com", "devfolio.co",
    "unstop.com", "wellfound.com", "glassdoor.com", "naukri.com",
    "remotive.com", "workatastartup.com", "lever.co", "greenhouse.io",
    "workday.com", "jobs.google.com", "microsoft.com", "amazon.jobs",
    # Government / PSU portals
    "ncs.gov.in", "upsc.gov.in", "ssc.nic.in", "ibps.in",
    "rrb.gov.in", "sarkariresult.com", "sarkarijob.in", "rojgarresult.com",
    "mahapariksha.gov.in", "mppsc.nic.in", "tnpsc.gov.in",
]

# ── Platform URL builders ─────────────────────────────────────────────────────
PLATFORMS = [
    {"name": "LinkedIn",        "url": lambda t, c, l: f"https://www.linkedin.com/jobs/search/?keywords={quote_plus(f'{t} {c}')}&location={quote_plus(l or '')}"},
    {"name": "Indeed",          "url": lambda t, c, l: f"https://www.indeed.com/jobs?q={quote_plus(f'{t} {c}')}&l={quote_plus(l or '')}"},
    {"name": "Internshala",     "url": lambda t, c, l: f"https://internshala.com/internships/work-from-home-internships/?search_query={quote_plus(f'{t} {c}')}"},
    {"name": "Naukri",          "url": lambda t, c, l: f"https://www.naukri.com/{quote_plus(f'{t}-{c}').replace('+','-').lower()}-jobs"},
    {"name": "Unstop",          "url": lambda t, c, l: f"https://unstop.com/jobs?search={quote_plus(f'{t} {c}')}"},
    {"name": "Wellfound",       "url": lambda t, c, l: f"https://wellfound.com/jobs?role={quote_plus(t)}&company={quote_plus(c)}"},
    {"name": "Glassdoor",       "url": lambda t, c, l: f"https://www.glassdoor.com/Job/jobs.htm?sc.keyword={quote_plus(f'{t} {c}')}"},
    {"name": "Devfolio",        "url": lambda t, c, l: "https://devfolio.co/hackathons"},
    # Government / Sarkari portals
    {"name": "NCS Gov",         "url": lambda t, c, l: f"https://www.ncs.gov.in/Pages/SearchJob.aspx?searchText={quote_plus(t)}&location={quote_plus(l or 'India')}"},
    {"name": "Sarkari Result",  "url": lambda t, c, l: f"https://www.google.com/search?q=site%3Asarkariresult.com+{quote_plus(t)}"},
    {"name": "UPSC",            "url": lambda t, c, l: f"https://www.google.com/search?q=site%3Aupsc.gov.in+{quote_plus(t)}"},
    {"name": "SSC",             "url": lambda t, c, l: f"https://www.google.com/search?q=site%3Assc.nic.in+{quote_plus(t)}"},
    {"name": "IBPS",            "url": lambda t, c, l: f"https://www.google.com/search?q=site%3Aibps.in+{quote_plus(t)}"},
    {"name": "Naukri Gov",      "url": lambda t, c, l: f"https://www.naukri.com/government-jobs?keyword={quote_plus(t)}"},
    {"name": "FreeJobAlert",    "url": lambda t, c, l: f"https://www.google.com/search?q=site%3Afreejobalert.com+{quote_plus(t)}"},
]

def _generate_portal_links(
    query: str,
    location: Optional[str],
    platform_override: Optional[List[Dict[str, Any]]] = None,
) -> List[Dict[str, Any]]:
    """
    Generate direct search links to job platforms instead of generating fake data.
    """
    platforms_to_use = platform_override if platform_override else PLATFORMS
    results = []
    
    for i, platform in enumerate(platforms_to_use):
        q = query.strip().title()
        
        results.append({
            "id": f"portal-{platform['name'].lower().replace(' ', '-')}-{i}",
            "title": f"Search {q} on {platform['name']}",
            "company": f"{platform['name']} Portal",
            "location": "Online",
            "type": "Direct Link",
            "salary": None,
            "apply_url": platform["url"](q, "", location or ""),
            "source": platform["name"],
            "posted_at": datetime.utcnow().isoformat() + "Z",
            "description_snippet": f"We couldn't find exact API matches right now. Click 'Apply' to search directly on the {platform['name']} official portal for '{q}'. We've prepared the direct link for you.",
            "is_verified": True,
            "logo": None,
            "ai_generated": False,
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


# ── SerpApi Google Jobs search (for government jobs) ─────────────────────────
async def _search_serpapi(query: str, location: str = "India", page: int = 0) -> List[Dict[str, Any]]:
    """Search Google Jobs via SerpApi — best for Indian government jobs."""
    if not SERPAPI_KEY:
        return []
    results = []
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(
                "https://serpapi.com/search.json",
                params={
                    "engine": "google_jobs",
                    "q": query,
                    "location": location,
                    "hl": "en",
                    "api_key": SERPAPI_KEY,
                    "start": page * 10,
                },
            )
            if response.status_code == 200:
                data = response.json()
                for job in data.get("jobs_results", []):
                    # Pick the best apply link
                    apply_options = job.get("apply_options", [])
                    apply_url = apply_options[0]["link"] if apply_options else None
                    if not apply_url:
                        apply_url = f"https://www.google.com/search?q={quote_plus(job.get('title',''))}+{quote_plus(job.get('company_name',''))}"

                    source_name = apply_options[0].get("title", "Google Jobs") if apply_options else "Google Jobs"

                    results.append({
                        "id": f"serp-{hash(job.get('title','') + job.get('company_name','')) % 99999}",
                        "title": job.get("title", "Unknown Role"),
                        "company": job.get("company_name", "Unknown"),
                        "location": job.get("location", location),
                        "type": job.get("detected_extensions", {}).get("schedule_type", "Full-Time"),
                        "salary": job.get("detected_extensions", {}).get("salary", None),
                        "apply_url": apply_url,
                        "source": source_name,
                        "posted_at": job.get("detected_extensions", {}).get("posted_at", ""),
                        "description_snippet": (job.get("description") or "")[:300] + "...",
                        "is_verified": _check_trusted(apply_url),
                        "logo": job.get("thumbnail", None),
                        "ai_generated": False,
                    })
    except Exception as e:
        print(f"[job_search] SerpApi error: {e}")
    return results


# ── Main search function ──────────────────────────────────────────────────────
async def search_external_jobs(
    query: str,
    job_type: Optional[str] = None,
    location: Optional[str] = None,
    work_mode: Optional[str] = None,
    page: int = 1,
) -> Dict[str, Any]:
    """
    Hybrid job search:
    - Government jobs → SerpApi (Google Jobs) for accurate Indian govt results
    - Corporate jobs  → JSearch API (LinkedIn, Indeed, etc.)
    - Final fallback  → Direct portal links (no fake data)
    """
    results = []
    source_used = "portal_links"

    # ── Detect government search ──────────────────────────────────────────────
    is_govt = (
        (job_type or "").lower() == "government"
        or "government" in query.lower()
        or "govt" in query.lower()
        or "sarkari" in query.lower()
    )

    # ── Build search query ────────────────────────────────────────────────────
    search_query = query
    if location:
        search_query = f"{search_query} {location}"
    if job_type and not is_govt:
        search_query = f"{search_query} {job_type}"
    if work_mode:
        search_query = f"{search_query} {work_mode}"

    # ── ROUTE 1: Government jobs → SerpApi ────────────────────────────────────
    if is_govt:
        govt_query = f"{query} government India sarkari"
        serp_results = await _search_serpapi(govt_query, location or "India", page - 1)
        if serp_results:
            results = serp_results
            source_used = "serpapi_google_jobs"

    # ── ROUTE 2: Corporate jobs → JSearch ─────────────────────────────────────
    if not is_govt and not results and JSEARCH_API_KEY:
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

    # ── ROUTE 3: Final fallback → Direct portal links (honest, no fake data) ─
    if not results:
        source_used = "portal_links"
        if is_govt:
            govt_platforms = [p for p in PLATFORMS if p["name"] in (
                "NCS Gov", "Sarkari Result", "UPSC", "SSC", "IBPS", "Naukri Gov", "FreeJobAlert"
            )]
            results = _generate_portal_links(query, location, platform_override=govt_platforms)
        else:
            corporate_platforms = [p for p in PLATFORMS if p["name"] not in (
                "NCS Gov", "Sarkari Result", "UPSC", "SSC", "IBPS", "Naukri Gov", "FreeJobAlert"
            )]
            results = _generate_portal_links(query, location, platform_override=corporate_platforms)

    return {
        "query": query,
        "source": source_used,
        "total": len(results),
        "results": results,
    }

