"""
Test sending a real email with the meeting summary.
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def send_test_email():
    """Send a test email with meeting summary"""
    
    print("=== Email Sending Test ===\n")
    
    # Step 1: Create a meeting
    print("1. Creating test meeting...")
    response = requests.post(
        f"{BASE_URL}/api/meetings/join",
        json={"name": "Test Participant"}
    )
    meeting_data = response.json()
    meeting_id = meeting_data["meeting_id"]
    print(f"✅ Meeting created: {meeting_id}\n")
    
    # Step 2: Add some sample data to the meeting
    # (Simulating what would happen after audio processing)
    print("2. Simulating meeting content...")
    
    # In a real scenario, audio would be uploaded and processed
    # For this test, we'll manually add some data to the meetings_db
    # by making API calls
    
    # Get current meeting status
    status = requests.get(f"{BASE_URL}/api/meetings/{meeting_id}/status")
    print(f"   Current status: {status.json()['status']}\n")
    
    # Step 3: Ask user for email
    print("3. Email Configuration:")
    print(f"   Sender: gandhi.dhriti2005@gmail.com")
    
    recipient = input("\n   Enter recipient email address (or press Enter to skip): ").strip()
    
    if not recipient:
        print("\n⚠️  No email provided. Test cancelled.")
        print(f"\nTo test manually, use:")
        print(f"POST {BASE_URL}/api/meetings/{meeting_id}/email?email=YOUR_EMAIL")
        return
    
    # Step 4: Send email
    print(f"\n4. Sending email to {recipient}...")
    try:
        response = requests.post(
            f"{BASE_URL}/api/meetings/{meeting_id}/email",
            params={"email": recipient}
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"\n✅ Email sent successfully!")
            print(f"   Meeting ID: {result.get('meeting_id')}")
            print(f"   Recipient: {recipient}")
            print(f"\n📧 Check your inbox for the meeting summary PDF!")
        else:
            print(f"\n❌ Email failed with status {response.status_code}")
            print(f"   Error: {response.text}")
            
    except Exception as e:
        print(f"\n❌ Error sending email: {e}")

if __name__ == "__main__":
    send_test_email()
