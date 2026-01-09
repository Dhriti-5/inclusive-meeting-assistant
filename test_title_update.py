"""
Quick test script to verify meeting title update functionality
Run this after backend is started to test the endpoint
"""

import requests
import json

# Configuration
BASE_URL = "http://localhost:8000"
TEST_EMAIL = "ora@yourdomain.com"  # Replace with your Ora's email
TEST_PASSWORD = "your_password"     # Replace with Ora's password
MEETING_ID = "test_meeting_id"     # Replace with an actual meeting ID

def test_title_update():
    print("🧪 Testing Meeting Title Update Feature\n")
    
    # Step 1: Login
    print("1️⃣ Logging in...")
    login_data = {
        "username": TEST_EMAIL,
        "password": TEST_PASSWORD
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            data=login_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        if response.status_code == 200:
            token = response.json()["access_token"]
            print(f"✅ Login successful! Token obtained.\n")
        else:
            print(f"❌ Login failed: {response.text}")
            return
    except Exception as e:
        print(f"❌ Login error: {e}")
        return
    
    # Step 2: Get meeting history to find a real meeting ID
    print("2️⃣ Fetching meeting history...")
    try:
        response = requests.get(
            f"{BASE_URL}/api/meetings/history",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        if response.status_code == 200:
            meetings = response.json()
            if len(meetings) > 0:
                MEETING_ID = meetings[0]["_id"]
                current_title = meetings[0].get("title", "No title")
                print(f"✅ Found meeting: {MEETING_ID}")
                print(f"   Current title: {current_title}\n")
            else:
                print("❌ No meetings found. Please create a meeting first.")
                return
        else:
            print(f"❌ Failed to fetch meetings: {response.text}")
            return
    except Exception as e:
        print(f"❌ Error fetching meetings: {e}")
        return
    
    # Step 3: Update meeting title
    print("3️⃣ Updating meeting title...")
    new_title = "Test Meeting - Updated Title"
    
    try:
        response = requests.put(
            f"{BASE_URL}/api/meetings/{MEETING_ID}/title",
            data={"title": new_title},
            headers={"Authorization": f"Bearer {token}"}
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Title updated successfully!")
            print(f"   New title: {result.get('new_title')}\n")
        else:
            print(f"❌ Failed to update title: {response.text}\n")
            return
    except Exception as e:
        print(f"❌ Error updating title: {e}\n")
        return
    
    # Step 4: Verify the update
    print("4️⃣ Verifying the update...")
    try:
        response = requests.get(
            f"{BASE_URL}/api/meetings/{MEETING_ID}",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        if response.status_code == 200:
            meeting = response.json()
            verified_title = meeting.get("title", "No title")
            
            if verified_title == new_title:
                print(f"✅ Verification successful!")
                print(f"   Title correctly updated to: {verified_title}\n")
                print("🎉 All tests passed! Meeting title update feature is working correctly.")
            else:
                print(f"⚠️  Title mismatch!")
                print(f"   Expected: {new_title}")
                print(f"   Got: {verified_title}")
        else:
            print(f"❌ Failed to verify: {response.text}")
    except Exception as e:
        print(f"❌ Verification error: {e}")

if __name__ == "__main__":
    print("=" * 60)
    print("MEETING TITLE UPDATE TEST")
    print("=" * 60)
    print()
    print("⚠️  Before running this test:")
    print("   1. Make sure backend is running (port 8000)")
    print("   2. Update TEST_EMAIL and TEST_PASSWORD in this file")
    print("   3. Ensure you have at least one meeting in the system")
    print()
    input("Press Enter to continue...")
    print()
    
    test_title_update()
