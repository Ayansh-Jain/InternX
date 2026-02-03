"""Test MongoDB connection with various SSL options"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import ssl

async def test():
    print("🔧 Testing MongoDB connection...")
    print(f"OpenSSL version: {ssl.OPENSSL_VERSION}")
    
    try:
        # Use tlsInsecure which disables all TLS validation
        client = AsyncIOMotorClient(
            "mongodb+srv://Ayansh:9WHEsz***@internx.hernfm1.mongodb.net/?appName=INTERNX",
            tls=True,
            tlsInsecure=True,
            serverSelectionTimeoutMS=15000
        )
        await client.admin.command('ping')
        print("✅ Connection successful!")
        client.close()
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        print("\n--- Trying alternative method ---")
        try:
            # Alternative: using direct parameters
            client = AsyncIOMotorClient(
                "mongodb+srv://Ayansh:9WHEsz***@internx.hernfm1.mongodb.net/?appName=INTERNX&ssl=true&ssl_cert_reqs=CERT_NONE",
                serverSelectionTimeoutMS=15000
            )
            await client.admin.command('ping')
            print("✅ Alternative connection successful!")
            client.close()
        except Exception as e2:
            print(f"❌ Alternative also failed: {e2}")

asyncio.run(test())
