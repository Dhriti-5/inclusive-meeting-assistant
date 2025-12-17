"""
Database configuration and connection for MongoDB.
Uses Motor for async operations with FastAPI.
"""
import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional

# Load environment variables
load_dotenv()

# MongoDB connection
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "inclusive_meeting_assistant")

class Database:
    client: Optional[AsyncIOMotorClient] = None
    
    @classmethod
    async def connect_db(cls):
        """Connect to MongoDB"""
        cls.client = AsyncIOMotorClient(MONGODB_URL)
        print(f"✅ Connected to MongoDB at {MONGODB_URL}")
    
    @classmethod
    async def close_db(cls):
        """Close MongoDB connection"""
        if cls.client:
            cls.client.close()
            print("✅ MongoDB connection closed")
    
    @classmethod
    def get_database(cls):
        """Get database instance"""
        if not cls.client:
            raise Exception("Database not connected. Call connect_db() first.")
        return cls.client[DATABASE_NAME]

# Helper functions to get collections
def get_users_collection():
    """Get users collection"""
    db = Database.get_database()
    return db.users

def get_meetings_collection():
    """Get meetings collection"""
    db = Database.get_database()
    return db.meetings
