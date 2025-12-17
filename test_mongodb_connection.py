"""
Quick test to verify MongoDB connection and environment variables
"""
import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

# Load environment variables
load_dotenv()

async def test_connection():
    """Test MongoDB connection"""
    print("🔍 Testing MongoDB Connection...")
    print(f"   MONGODB_URL from .env: {os.getenv('MONGODB_URL')}")
    print(f"   DATABASE_NAME from .env: {os.getenv('DATABASE_NAME')}")
    
    try:
        # Try to connect
        mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
        client = AsyncIOMotorClient(mongodb_url)
        
        # Ping the database
        await client.admin.command('ping')
        print("✅ MongoDB connection successful!")
        
        # List databases
        db_list = await client.list_database_names()
        print(f"✅ Available databases: {db_list}")
        
        # Test inserting a document
        db = client[os.getenv("DATABASE_NAME", "inclusive_meeting_assistant")]
        test_collection = db.test_collection
        
        result = await test_collection.insert_one({"test": "data", "timestamp": "now"})
        print(f"✅ Test document inserted with ID: {result.inserted_id}")
        
        # Clean up test document
        await test_collection.delete_one({"_id": result.inserted_id})
        print("✅ Test document cleaned up")
        
        client.close()
        return True
        
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        print(f"   Error type: {type(e).__name__}")
        return False

if __name__ == "__main__":
    asyncio.run(test_connection())
