
import requests
import json

BASE_URL = "http://localhost:8000/api"

# Login as a job seeker to get a token (optional really for public jobs usually, but strict in this app)
# Wait, list_jobs endpoint uses get_current_user_optional, so it should be public enough or I can use an existing token if needed?
# Let's assume public or I need to sign in. The code says `get_current_user_optional`, so it works without auth.

def test_salary_filter():
    print("Testing Salary Filter...")
    # First, list all jobs to see what we have
    response = requests.get(f"{BASE_URL}/jobs?limit=5")
    if response.status_code != 200:
        print(f"Failed to list jobs: {response.text}")
        return

    jobs = response.json().get('jobs', [])
    print(f"Found {len(jobs)} total jobs initially.")
    
    # Filter for high salary
    min_salary = 50000
    response = requests.get(f"{BASE_URL}/jobs?min_salary={min_salary}")
    filtered_jobs = response.json().get('jobs', [])
    print(f"Found {len(filtered_jobs)} jobs with max_salary >= {min_salary}")
    
    for job in filtered_jobs:
        if job.get('salary_range'):
            print(f" - {job['title']}: {job['salary_range']}")
            if job['salary_range']['max'] < min_salary:
                print("   [FAIL] Salary range max is less than min_salary filter!")
        else:
            print(f" - {job['title']}: No salary range")

if __name__ == "__main__":
    try:
        test_salary_filter()
    except Exception as e:
        print(f"Test failed with exception: {e}")
