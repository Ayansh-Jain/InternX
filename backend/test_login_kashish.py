import asyncio
import os
import sys
from dotenv import load_dotenv

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), "backend"))

from database import Database, USERS_COLLECTION
from auth.security import verify_password

async def test_login(email, password):
    load_dotenv(os.path.join("backend", ".env"))
    await Database.connect()
    users = Database.get_collection(USERS_COLLECTION)
    
    user = await users.find_one({"email": email.lower()})
    if not user:
        print(f"User {email} not found")
        return
    
    print(f"User found: {user['email']}")
    is_valid = verify_password(password, user["password_hash"])
    print(f"Password valid: {is_valid}")
    
    await Database.disconnect()

if __name__ == "__main__":
    email = "admin@internx.com"
    password = "Admin@123"
    # Use system python to run this since venv is still installing
    asyncio.run(test_login(email, password))
