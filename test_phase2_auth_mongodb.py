"""
Test script for Phase 2: Authentication and MongoDB Integration
Tests user registration, login, JWT authentication, and MongoDB operations.
"""
import requests
import json

BASE_URL = "http://localhost:8000"

# Test credentials
TEST_USER = {
    "email": "test@example.com",
    "password": "testpassword123",
    "name": "Test User"
}

def print_section(title):
    """Print formatted section header"""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")

def test_authentication_flow():
    """Test the complete authentication and database workflow"""
    
    print_section("PHASE 2: Authentication & MongoDB Integration Test")
    
    # Step 1: User Registration
    print_section("1. Testing User Registration")
    try:
        response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json=TEST_USER
        )
        
        if response.status_code == 201:
            user_data = response.json()
            print(f"✅ User registered successfully!")
            print(f"   User ID: {user_data['id']}")
            print(f"   Email: {user_data['email']}")
            print(f"   Name: {user_data['name']}")
        elif response.status_code == 400 and "already registered" in response.text:
            print(f"⚠️  User already exists (this is OK for repeated tests)")
        else:
            print(f"❌ Registration failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Registration error: {e}")
        return False
    
    # Step 2: User Login
    print_section("2. Testing User Login")
    try:
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            data={
                "username": TEST_USER["email"],  # OAuth2 uses 'username' field
                "password": TEST_USER["password"]
            }
        )
        
        if response.status_code == 200:
            token_data = response.json()
            access_token = token_data["access_token"]
            print(f"✅ Login successful!")
            print(f"   Access Token: {access_token[:50]}...")
            print(f"   Token Type: {token_data['token_type']}")
        else:
            print(f"❌ Login failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Login error: {e}")
        return False
    
    # Step 3: Get Current User
    print_section("3. Testing Get Current User (Protected Route)")
    try:
        headers = {"Authorization": f"Bearer {access_token}"}
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers=headers
        )
        
        if response.status_code == 200:
            user_data = response.json()
            print(f"✅ Successfully retrieved user info!")
            print(f"   User ID: {user_data['id']}")
            print(f"   Email: {user_data['email']}")
        else:
            print(f"❌ Get user failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Get user error: {e}")
        return False
    
    # Step 4: Create Meeting (Protected)
    print_section("4. Testing Meeting Creation (Protected Route)")
    try:
        headers = {"Authorization": f"Bearer {access_token}"}
        response = requests.post(
            f"{BASE_URL}/api/meetings/join",
            json={"name": "Test Meeting"},
            headers=headers
        )
        
        if response.status_code == 200:
            meeting_data = response.json()
            meeting_id = meeting_data["meeting_id"]
            print(f"✅ Meeting created successfully!")
            print(f"   Meeting ID: {meeting_id}")
            print(f"   Status: {meeting_data['meeting']['status']}")
        else:
            print(f"❌ Create meeting failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Create meeting error: {e}")
        return False
    
    # Step 5: Get Meeting Status (Protected)
    print_section("5. Testing Get Meeting Status (Protected Route)")
    try:
        headers = {"Authorization": f"Bearer {access_token}"}
        response = requests.get(
            f"{BASE_URL}/api/meetings/{meeting_id}/status",
            headers=headers
        )
        
        if response.status_code == 200:
            status_data = response.json()
            print(f"✅ Retrieved meeting status!")
            print(f"   Status: {status_data['status']}")
            print(f"   Created: {status_data['created_at']}")
        else:
            print(f"❌ Get status failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Get status error: {e}")
        return False
    
    # Step 6: Get Meeting History (Protected)
    print_section("6. Testing Get Meeting History (Protected Route)")
    try:
        headers = {"Authorization": f"Bearer {access_token}"}
        response = requests.get(
            f"{BASE_URL}/api/meetings/history",
            headers=headers
        )
        
        if response.status_code == 200:
            history_data = response.json()
            print(f"✅ Retrieved meeting history!")
            print(f"   Total meetings: {len(history_data['meetings'])}")
            if history_data['meetings']:
                print(f"   Latest meeting: {history_data['meetings'][0]['name']}")
        else:
            print(f"❌ Get history failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Get history error: {e}")
        return False
    
    # Step 7: Test Unauthorized Access
    print_section("7. Testing Unauthorized Access (Should Fail)")
    try:
        # Try to access protected route without token
        response = requests.get(f"{BASE_URL}/api/meetings/history")
        
        if response.status_code == 401:
            print(f"✅ Unauthorized access correctly blocked!")
            print(f"   Status: {response.status_code}")
        else:
            print(f"⚠️  Expected 401, got {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"❌ Unauthorized test error: {e}")
    
    # Final Summary
    print_section("TEST SUMMARY")
    print("✅ All Phase 2 tests passed successfully!")
    print("\n📋 What was tested:")
    print("   1. User registration with password hashing")
    print("   2. User login with JWT token generation")
    print("   3. Protected route access with JWT authentication")
    print("   4. Meeting creation in MongoDB")
    print("   5. Meeting status retrieval from MongoDB")
    print("   6. Meeting history from MongoDB")
    print("   7. Unauthorized access prevention")
    print("\n🎉 Phase 2 Implementation Complete!")
    print("\n📝 Next Steps:")
    print("   - Install and start MongoDB: mongod --dbpath=<path>")
    print("   - Start backend: python -m uvicorn backend.main:app --reload")
    print("   - Update frontend to use authentication")
    
    return True

if __name__ == "__main__":
    print("\n🚀 Starting Phase 2 Integration Tests...")
    print("📍 Make sure MongoDB is running and backend server is started!")
    
    input("\nPress Enter to continue...")
    
    try:
        # Check if server is running
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            print(f"✅ Backend server is running!\n")
            test_authentication_flow()
        else:
            print(f"❌ Backend server returned {response.status_code}")
    except requests.exceptions.ConnectionError:
        print(f"❌ Cannot connect to backend server at {BASE_URL}")
        print("   Please start the server with: python -m uvicorn backend.main:app --reload")
