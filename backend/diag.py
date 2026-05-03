
import asyncio
import os
import sys
from bson import ObjectId

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from database import Database, JOBS_COLLECTION, USERS_COLLECTION, INTERACTIONS_COLLECTION

async def diag():
    print("Global Interaction Check...")
    await Database.connect()
    db = Database.get_database()
    
    # Check LATEST interactions globally
    ints = await db[INTERACTIONS_COLLECTION].find().sort("timestamp", -1).limit(10).to_list(length=10)
    print(f"Latest 10 interactions GLOBALLY:")
    for i in ints:
        print(f"  - User {i.get('user_id')} | Job {i.get('job_id')} | Action {i.get('action')} | Time {i.get('timestamp')}")
        
    await Database.disconnect()

if __name__ == "__main__":
    asyncio.run(diag())
