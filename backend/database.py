"""
Database configuration for MongoDB using motor async driver.
"""

from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional
import os
import ssl

# MongoDB connection settings
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb+srv://Ayansh:9WHEsz***@internx.hernfm1.mongodb.net/?appName=INTERNX")
DATABASE_NAME = os.getenv("DATABASE_NAME", "internx")

class Database:
    client: Optional[AsyncIOMotorClient] = None
    
    @classmethod
    async def connect(cls):
        """Connect to MongoDB."""
        # Create SSL context that doesn't verify certificates
        ssl_context = ssl.create_default_context()
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE
        
        cls.client = AsyncIOMotorClient(MONGODB_URL, tls=True, tlsAllowInvalidCertificates=True)
        # Verify connection
        await cls.client.admin.command('ping')
        print(f"Connected to MongoDB: {DATABASE_NAME}")
    
    @classmethod
    async def disconnect(cls):
        """Disconnect from MongoDB."""
        if cls.client:
            cls.client.close()
            print("Disconnected from MongoDB")
    
    @classmethod
    def get_database(cls):
        """Get database instance."""
        return cls.client[DATABASE_NAME]
    
    @classmethod
    def get_collection(cls, collection_name: str):
        """Get a specific collection."""
        return cls.client[DATABASE_NAME][collection_name]


# Collection names
USERS_COLLECTION = "users"
JOBS_COLLECTION = "jobs"
APPLICATIONS_COLLECTION = "applications"
SAVED_JOBS_COLLECTION = "saved_jobs"
ADMIN_LOGS_COLLECTION = "admin_logs"


async def get_users_collection():
    return Database.get_collection(USERS_COLLECTION)


async def get_jobs_collection():
    return Database.get_collection(JOBS_COLLECTION)


async def get_applications_collection():
    return Database.get_collection(APPLICATIONS_COLLECTION)


async def get_saved_jobs_collection():
    return Database.get_collection(SAVED_JOBS_COLLECTION)


async def get_admin_logs_collection():
    return Database.get_collection(ADMIN_LOGS_COLLECTION)
