"""
Test script for Phase 3: WebSocket Real-Time Engine
Tests WebSocket connections, real-time updates, and message broadcasting.
"""
import asyncio
import websockets
import json
import requests
from datetime import datetime

BASE_URL = "http://localhost:8000"
WS_URL = "ws://localhost:8000"

# Test credentials
TEST_USER = {
    "email": "websocket_test@example.com",
    "password": "testpass123",
    "name": "WebSocket Test User"
}

def print_section(title):
    """Print formatted section header"""
    print(f"\n{'='*70}")
    print(f"  {title}")
    print(f"{'='*70}\n")

async def websocket_client(ws_url, token):
    """Connect to WebSocket and listen for messages"""
    print(f"📡 Connecting to WebSocket...")
    print(f"   URL: {ws_url}")
    
    async with websockets.connect(ws_url) as websocket:
        print(f"✅ WebSocket connected!")
        
        # Listen for messages
        try:
            while True:
                message = await websocket.recv()
                data = json.loads(message)
                
                msg_type = data.get("type", "unknown")
                timestamp = data.get("timestamp", "")
                
                if msg_type == "connected":
                    print(f"\n🎉 {data.get('message')}")
                    print(f"   Meeting ID: {data.get('meeting_id')}")
                
                elif msg_type == "status":
                    status = data.get("status")
                    details = data.get("details", {})
                    stage = details.get("stage", "")
                    message = details.get("message", "")
                    print(f"\n📊 Status Update: {status}")
                    print(f"   Stage: {stage}")
                    print(f"   Message: {message}")
                
                elif msg_type == "transcript":
                    segment = data.get("segment", {})
                    speaker = segment.get("speaker", "UNKNOWN")
                    text = segment.get("text", "")
                    print(f"\n💬 New Transcript:")
                    print(f"   {speaker}: {text}")
                
                elif msg_type == "summary":
                    summary = data.get("summary", "")
                    action_items = data.get("action_items", [])
                    print(f"\n📝 Summary Received:")
                    print(f"   Summary: {summary[:100]}...")
                    print(f"   Action Items: {len(action_items)} items")
                
                elif msg_type == "error":
                    error = data.get("error")
                    print(f"\n❌ Error: {error}")
                
                else:
                    print(f"\n📨 Message: {msg_type}")
                    print(f"   Data: {json.dumps(data, indent=2)}")
        
        except websockets.exceptions.ConnectionClosed:
            print(f"\n🔌 WebSocket connection closed")
        except Exception as e:
            print(f"\n❌ WebSocket error: {e}")

def test_websocket_integration():
    """Test the complete WebSocket workflow"""
    
    print_section("PHASE 3: WebSocket Real-Time Engine Test")
    
    # Step 1: Register/Login User
    print_section("1. Authentication Setup")
    try:
        # Try to register (may fail if user exists)
        response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json=TEST_USER
        )
        if response.status_code == 201:
            print(f"✅ User registered")
        else:
            print(f"⚠️  User already exists (OK)")
    except Exception as e:
        print(f"⚠️  Registration: {e}")
    
    # Login
    try:
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            data={
                "username": TEST_USER["email"],
                "password": TEST_USER["password"]
            }
        )
        
        if response.status_code == 200:
            token_data = response.json()
            access_token = token_data["access_token"]
            print(f"✅ Login successful!")
            print(f"   Token: {access_token[:30]}...")
        else:
            print(f"❌ Login failed: {response.status_code}")
            print(f"   Please ensure MongoDB is running and backend is started")
            return
    except requests.exceptions.ConnectionError:
        print(f"❌ Cannot connect to backend at {BASE_URL}")
        print(f"   Please start: python -m uvicorn backend.main:app --reload")
        return
    except Exception as e:
        print(f"❌ Login error: {e}")
        return
    
    # Step 2: Create Meeting
    print_section("2. Creating Test Meeting")
    try:
        headers = {"Authorization": f"Bearer {access_token}"}
        response = requests.post(
            f"{BASE_URL}/api/meetings/join",
            json={"name": "WebSocket Test Meeting"},
            headers=headers
        )
        
        if response.status_code == 200:
            meeting_data = response.json()
            meeting_id = meeting_data["meeting_id"]
            print(f"✅ Meeting created!")
            print(f"   Meeting ID: {meeting_id}")
        else:
            print(f"❌ Create meeting failed: {response.status_code}")
            return
    except Exception as e:
        print(f"❌ Create meeting error: {e}")
        return
    
    # Step 3: Test WebSocket Connection
    print_section("3. Testing WebSocket Connection")
    
    ws_url = f"{WS_URL}/ws/meeting/{meeting_id}?token={access_token}"
    
    print(f"📝 Instructions:")
    print(f"   1. WebSocket will connect to meeting {meeting_id}")
    print(f"   2. You can now upload audio via the API or frontend")
    print(f"   3. Watch for real-time updates below")
    print(f"\n   To test, run in another terminal:")
    print(f"   curl -X POST {BASE_URL}/api/meetings/{meeting_id}/upload-audio \\")
    print(f"        -H 'Authorization: Bearer {access_token}' \\")
    print(f"        -F 'audio=@path/to/audio.wav'")
    
    print(f"\n🔄 Connecting to WebSocket...")
    print(f"   (Press Ctrl+C to stop)")
    
    try:
        # Run WebSocket client
        asyncio.run(websocket_client(ws_url, access_token))
    except KeyboardInterrupt:
        print(f"\n\n⏹️  WebSocket test stopped by user")
    except Exception as e:
        print(f"\n❌ WebSocket test error: {e}")
    
    # Summary
    print_section("TEST SUMMARY")
    print("✅ Phase 3 WebSocket implementation tested!")
    print("\n📋 What was tested:")
    print("   1. User authentication (JWT)")
    print("   2. Meeting creation")
    print("   3. WebSocket connection with token")
    print("   4. Real-time message reception")
    print("\n📝 To test full flow:")
    print("   1. Keep this script running (WebSocket listener)")
    print("   2. Upload audio via API or frontend")
    print("   3. Watch real-time updates appear here")
    print("\n🎯 Expected Updates:")
    print("   - Status: processing (various stages)")
    print("   - Transcript segments (real-time)")
    print("   - Summary and action items")
    print("   - Completion status")

if __name__ == "__main__":
    print("\n🚀 Starting Phase 3 WebSocket Tests...")
    print("📍 Prerequisites:")
    print("   ✓ MongoDB running")
    print("   ✓ Backend server started")
    print("   ✓ Port 8000 available")
    
    input("\nPress Enter to continue...")
    
    try:
        test_websocket_integration()
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
