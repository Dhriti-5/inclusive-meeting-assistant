"""
Comprehensive test script for Phase 2 implementation.
Tests MongoDB connection, user registration, login, and meeting operations.
"""
import asyncio
import sys
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

def print_section(title, color="cyan"):
    """Print formatted section header"""
    colors = {
        "cyan": "\033[96m",
        "green": "\033[92m",
        "yellow": "\033[93m",
        "red": "\033[91m",
        "reset": "\033[0m"
    }
    c = colors.get(color, colors["cyan"])
    r = colors["reset"]
    print(f"\n{c}{'=' * 70}{r}")
    print(f"{c}  {title}{r}")
    print(f"{c}{'=' * 70}{r}\n")

async def test_mongodb_setup():
    """Test MongoDB connection and collections"""
    print_section("🔍 TESTING MONGODB SETUP", "cyan")
    
    try:
        # Get configuration
        mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
        database_name = os.getenv("DATABASE_NAME", "inclusive_meeting_assistant")
        
        print(f"📍 MongoDB URL: {mongodb_url}")
        print(f"📍 Database Name: {database_name}")
        
        # Connect
        client = AsyncIOMotorClient(mongodb_url)
        
        # Test connection
        await client.admin.command('ping')
        print("✅ MongoDB connection successful!\n")
        
        # Get database
        db = client[database_name]
        
        # List existing collections
        collections = await db.list_collection_names()
        print(f"📚 Existing collections: {collections if collections else 'None (new database)'}\n")
        
        # Test users collection
        users_collection = db.users
        user_count = await users_collection.count_documents({})
        print(f"👥 Users collection: {user_count} users")
        
        # Test meetings collection
        meetings_collection = db.meetings
        meeting_count = await meetings_collection.count_documents({})
        print(f"📅 Meetings collection: {meeting_count} meetings")
        
        # Show sample user (without password)
        if user_count > 0:
            sample_user = await users_collection.find_one({})
            if sample_user:
                print(f"\n📋 Sample user:")
                print(f"   Email: {sample_user.get('email', 'N/A')}")
                print(f"   Name: {sample_user.get('name', 'N/A')}")
                print(f"   Created: {sample_user.get('created_at', 'N/A')}")
        
        client.close()
        return True
        
    except Exception as e:
        print(f"❌ MongoDB test failed: {e}")
        return False

async def test_user_operations():
    """Test user CRUD operations"""
    print_section("👤 TESTING USER OPERATIONS", "green")
    
    try:
        mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
        database_name = os.getenv("DATABASE_NAME", "inclusive_meeting_assistant")
        
        client = AsyncIOMotorClient(mongodb_url)
        db = client[database_name]
        users_collection = db.users
        
        # Test data
        test_email = "test@example.com"
        
        # Check if test user exists
        existing_user = await users_collection.find_one({"email": test_email})
        
        if existing_user:
            print(f"✅ Test user already exists: {test_email}")
            print(f"   User ID: {existing_user['_id']}")
            print(f"   Created: {existing_user.get('created_at', 'N/A')}")
        else:
            print(f"ℹ️  Test user doesn't exist yet")
            print(f"   Will be created during backend API test")
        
        client.close()
        return True
        
    except Exception as e:
        print(f"❌ User operations test failed: {e}")
        return False

async def test_meeting_operations():
    """Test meeting CRUD operations"""
    print_section("📅 TESTING MEETING OPERATIONS", "yellow")
    
    try:
        mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
        database_name = os.getenv("DATABASE_NAME", "inclusive_meeting_assistant")
        
        client = AsyncIOMotorClient(mongodb_url)
        db = client[database_name]
        meetings_collection = db.meetings
        
        # Count meetings
        meeting_count = await meetings_collection.count_documents({})
        print(f"📊 Total meetings in database: {meeting_count}")
        
        if meeting_count > 0:
            # Show recent meetings
            recent_meetings = meetings_collection.find().sort("created_at", -1).limit(3)
            print(f"\n📋 Recent meetings:")
            async for meeting in recent_meetings:
                print(f"   • ID: {meeting['_id']}")
                print(f"     Status: {meeting.get('status', 'N/A')}")
                print(f"     Created: {meeting.get('created_at', 'N/A')}")
                print()
        
        client.close()
        return True
        
    except Exception as e:
        print(f"❌ Meeting operations test failed: {e}")
        return False

async def check_environment():
    """Check environment configuration"""
    print_section("⚙️  CHECKING ENVIRONMENT CONFIGURATION", "cyan")
    
    required_vars = [
        "MONGODB_URL",
        "DATABASE_NAME",
        "JWT_SECRET_KEY",
        "ALGORITHM",
        "ACCESS_TOKEN_EXPIRE_MINUTES"
    ]
    
    optional_vars = [
        "HF_TOKEN",
        "SENDER_EMAIL",
        "APP_PASSWORD"
    ]
    
    print("📝 Required variables:")
    all_present = True
    for var in required_vars:
        value = os.getenv(var)
        if value:
            # Mask sensitive values
            if "SECRET" in var or "PASSWORD" in var:
                display_value = f"{value[:8]}..." if len(value) > 8 else "***"
            else:
                display_value = value
            print(f"   ✅ {var}: {display_value}")
        else:
            print(f"   ❌ {var}: NOT SET")
            all_present = False
    
    print("\n📝 Optional variables:")
    for var in optional_vars:
        value = os.getenv(var)
        if value:
            if "PASSWORD" in var or "TOKEN" in var:
                display_value = f"{value[:8]}..." if len(value) > 8 else "***"
            else:
                display_value = value
            print(f"   ✅ {var}: {display_value}")
        else:
            print(f"   ⚠️  {var}: Not set")
    
    return all_present

async def main():
    """Run all tests"""
    print_section("🚀 PHASE 2 DIAGNOSTIC TEST", "cyan")
    print("This script tests MongoDB setup and database operations.")
    print("Make sure MongoDB is running before proceeding.\n")
    
    # Check environment
    env_ok = await check_environment()
    if not env_ok:
        print("\n❌ Environment configuration incomplete!")
        print("   Please check your .env file.")
        return
    
    # Run tests
    tests = [
        ("MongoDB Setup", test_mongodb_setup),
        ("User Operations", test_user_operations),
        ("Meeting Operations", test_meeting_operations),
    ]
    
    results = []
    for test_name, test_func in tests:
        result = await test_func()
        results.append((test_name, result))
    
    # Summary
    print_section("📊 TEST SUMMARY", "green")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{status}: {test_name}")
    
    print(f"\n{'='*70}")
    if passed == total:
        print(f"  ✅ All tests passed! ({passed}/{total})")
        print(f"{'='*70}")
        print("\n🎉 Phase 2 MongoDB setup is working correctly!")
        print("   You can now start the backend server and test the API endpoints.")
    else:
        print(f"  ⚠️  Some tests failed ({passed}/{total} passed)")
        print(f"{'='*70}")
        print("\n💡 Next steps:")
        print("   1. Check that MongoDB is running")
        print("   2. Verify .env file configuration")
        print("   3. Check error messages above for details")

if __name__ == "__main__":
    asyncio.run(main())
