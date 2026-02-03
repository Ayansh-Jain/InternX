"""
Script to create the first admin user.
Run this once to set up admin account.
"""

import asyncio
from datetime import datetime
import os
import sys
import bcrypt

# Add parent directory to path to import from database
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import Database, USERS_COLLECTION

def get_password_hash(password: str) -> str:
    """Generate password hash using direct bcrypt."""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

async def create_admin():
    """Create the first admin user."""
    
    # Admin credentials - CHANGE THESE!
    ADMIN_EMAIL = "admin@internx.com"
    ADMIN_PASSWORD = "Admin@123"
    ADMIN_NAME = "System Admin"
    
    print("🔧 Connecting to MongoDB Atlas...")
    try:
        await Database.connect()
        db = Database.get_database()
        users = db[USERS_COLLECTION]
        
        # Check if admin already exists
        existing = await users.find_one({"email": ADMIN_EMAIL.lower()})
        if existing:
            print(f"⚠️ Admin with email {ADMIN_EMAIL} already exists!")
            await Database.disconnect()
            return
        
        # Create admin user
        now = datetime.utcnow()
        admin_doc = {
            "email": ADMIN_EMAIL.lower(),
            "password_hash": get_password_hash(ADMIN_PASSWORD),
            "role": "ADMIN",
            "status": "active",
            "profile": {
                "fullName": ADMIN_NAME,
                "phone": "",
                "location": "",
                "linkedIn": "",
                "github": "",
                "portfolio": "",
                "company": "InternX",
                "bio": "System Administrator",
                "resumeData": None
            },
            "score": {
                "total_score": 0,
                "breakdown": {},
                "last_updated": None
            },
            "created_at": now,
            "updated_at": now
        }
        
        result = await users.insert_one(admin_doc)
        print(f"✅ Admin user created successfully!")
        print(f"   Email: {ADMIN_EMAIL}")
        print(f"   Password: {ADMIN_PASSWORD}")
        print(f"   ID: {result.inserted_id}")
        print("\n⚠️ IMPORTANT: Change the password after first login!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        await Database.disconnect()

if __name__ == "__main__":
    asyncio.run(create_admin())
