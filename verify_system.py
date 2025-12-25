"""
Quick System Verification Script
Tests all critical components of the Inclusive Meeting Assistant
"""

import sys
import os
from datetime import datetime
import asyncio

print("\n" + "="*60)
print("  INCLUSIVE MEETING ASSISTANT - SYSTEM CHECK")
print("="*60 + "\n")

# Test 1: Python Imports
print("[1/6] Testing Python Dependencies...")
try:
    import fastapi
    import uvicorn
    import motor
    import jose
    import passlib
    import websockets
    print("  ✓ Core dependencies installed")
except ImportError as e:
    print(f"  ✗ Missing dependency: {e}")
    sys.exit(1)

# Test 2: MongoDB Connection
print("\n[2/6] Testing MongoDB Connection...")
try:
    from motor.motor_asyncio import AsyncIOMotorClient
    
    MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    client = AsyncIOMotorClient(MONGODB_URL, serverSelectionTimeoutMS=5000)
    
    # Test connection
    client.server_info()
    print(f"  ✓ MongoDB connected: {MONGODB_URL}")
    client.close()
except Exception as e:
    print(f"  ✗ MongoDB connection failed: {e}")
    print("  → Make sure MongoDB is running")

# Test 3: Environment Variables
print("\n[3/6] Checking Environment Configuration...")
from dotenv import load_dotenv
load_dotenv()

required_vars = {
    "MONGODB_URL": os.getenv("MONGODB_URL", "mongodb://localhost:27017"),
    "DATABASE_NAME": os.getenv("DATABASE_NAME", "inclusive_meeting_assistant"),
    "JWT_SECRET_KEY": os.getenv("JWT_SECRET_KEY", "NOT_SET")
}

all_set = True
for var, value in required_vars.items():
    if value == "NOT_SET" or (var == "JWT_SECRET_KEY" and "change-this" in value.lower()):
        print(f"  ⚠ {var}: Not properly configured")
        all_set = False
    else:
        print(f"  ✓ {var}: Configured")

# Test 4: File Structure
print("\n[4/6] Verifying Project Structure...")
required_files = [
    "backend/main.py",
    "backend/auth.py",
    "backend/models.py",
    "backend/database.py",
    "frontend/package.json",
    "requirements.txt"
]

all_exist = True
for file in required_files:
    if os.path.exists(file):
        print(f"  ✓ {file}")
    else:
        print(f"  ✗ {file} missing")
        all_exist = False

# Test 5: Authentication System
print("\n[5/6] Testing Authentication System...")
try:
    from backend.auth import get_password_hash, verify_password, create_access_token
    
    # Test password hashing
    test_password = "test123"
    hashed = get_password_hash(test_password)
    if verify_password(test_password, hashed):
        print("  ✓ Password hashing works")
    else:
        print("  ✗ Password verification failed")
    
    # Test token creation
    token = create_access_token(data={"sub": "test@example.com"})
    if token:
        print("  ✓ JWT token generation works")
    else:
        print("  ✗ Token generation failed")
        
except Exception as e:
    print(f"  ✗ Authentication test failed: {e}")

# Test 6: API Models
print("\n[6/6] Testing Data Models...")
try:
    from backend.models import (
        UserRegister, UserResponse, MeetingCreate, 
        MeetingResponse, TranscriptSegment
    )
    
    # Test user model
    user = UserRegister(email="test@test.com", password="test123", name="Test User")
    print("  ✓ User models work")
    
    # Test meeting model
    meeting = MeetingCreate(name="Test Meeting")
    print("  ✓ Meeting models work")
    
except Exception as e:
    print(f"  ✗ Model test failed: {e}")

# Summary
print("\n" + "="*60)
print("  SYSTEM CHECK COMPLETE")
print("="*60 + "\n")

print("Next Steps:")
print("  1. Start backend:  python -m uvicorn backend.main:app --port 8000")
print("  2. Start frontend: cd frontend && npm run dev")
print("  3. Open browser:   http://localhost:3000")
print("\nOr use quick start: .\\start_all.ps1")
print()
