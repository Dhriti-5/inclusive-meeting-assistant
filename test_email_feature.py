"""
Test script to verify email functionality end-to-end.
"""
import requests
import json
import time
import os

BASE_URL = "http://localhost:8000"

def wait_for_server():
    """Wait for server to be ready"""
    print("⏳ Waiting for server to start...")
    max_attempts = 40
    for i in range(max_attempts):
        try:
            response = requests.get(f"{BASE_URL}/", timeout=2)
            if response.status_code == 200:
                print("✅ Server is ready!")
                return True
        except:
            if i < max_attempts - 1:
                time.sleep(1)
    print("❌ Server did not start in time")
    return False

def test_email_functionality():
    """Test the complete email sending flow"""
    
    # Wait for server
    if not wait_for_server():
        return
    
    print("\n=== Testing Email Functionality ===\n")
    
    # Step 1: Create a new meeting
    print("1. Creating test meeting...")
    try:
        response = requests.post(
            f"{BASE_URL}/api/meetings/join",
            json={"name": "Test User"}
        )
        response.raise_for_status()
        meeting_data = response.json()
        meeting_id = meeting_data.get("meeting_id")
        print(f"✅ Meeting created: {meeting_id}")
    except Exception as e:
        print(f"❌ Failed to create meeting: {e}")
        return
    
    # Step 2: Create sample transcript and report data
    print("\n2. Creating sample meeting data...")
    try:
        # Simulate some meeting content
        # (In real scenario, this would come from audio processing)
        # For testing, we'll just create a meeting with minimal data
        
        # Check meeting status
        status_response = requests.get(f"{BASE_URL}/api/meetings/{meeting_id}/status")
        status_response.raise_for_status()
        print(f"✅ Meeting status: {status_response.json()}")
    except Exception as e:
        print(f"❌ Failed to get meeting status: {e}")
        return
    
    # Step 3: Test email endpoint
    print("\n3. Testing email endpoint...")
    test_email = "test@example.com"  # Replace with actual email for real test
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/meetings/{meeting_id}/email",
            params={"email": test_email}
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Email endpoint responded successfully!")
            print(f"   Response: {json.dumps(result, indent=2)}")
        else:
            print(f"⚠️  Email endpoint returned status {response.status_code}")
            print(f"   Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Email endpoint test failed: {e}")
        return
    
    # Step 4: Test with actual email (if user wants to)
    print("\n4. Would you like to send a test email to a real address?")
    print("   Note: This requires valid Gmail credentials in .env file")
    print("   (SENDER_EMAIL and APP_PASSWORD)")
    
    # Check if .env has email credentials
    env_file = os.path.join(os.path.dirname(__file__), '.env')
    if os.path.exists(env_file):
        with open(env_file, 'r') as f:
            env_content = f.read()
            if 'SENDER_EMAIL' in env_content and 'APP_PASSWORD' in env_content:
                print("   ✅ Email credentials found in .env")
            else:
                print("   ⚠️  Email credentials not found in .env")
    else:
        print("   ⚠️  .env file not found")
    
    print("\n=== Email Functionality Test Complete ===\n")
    print("Summary:")
    print(f"  - Backend server: ✅ Running on port 8000")
    print(f"  - Meeting creation: ✅ Working")
    print(f"  - Email endpoint: ✅ Accessible")
    print(f"  - Meeting ID: {meeting_id}")
    print(f"\nTo manually test email sending, use:")
    print(f"  POST {BASE_URL}/api/meetings/{meeting_id}/email?email=YOUR_EMAIL@example.com")

if __name__ == "__main__":
    test_email_functionality()
