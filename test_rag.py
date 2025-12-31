# Test script for RAG (Chat with Meeting) functionality
import requests
import json
import time

BASE_URL = "http://localhost:8000"
MEETING_ID = "test_brain_layer_001"  # Use the meeting ID from test_brain_layer.py

# You need to login first to get a token
def get_auth_token():
    """Login and get auth token"""
    # Register a test user (if not exists)
    register_data = {
        "email": "test@example.com",
        "password": "test123",
        "name": "Test User"
    }
    try:
        response = requests.post(f"{BASE_URL}/api/auth/register", json=register_data)
    except:
        pass  # User might already exist
    
    # Login
    login_data = {
        "username": "test@example.com",
        "password": "test123"
    }
    response = requests.post(f"{BASE_URL}/api/auth/login", data=login_data)
    
    if response.status_code == 200:
        return response.json()["access_token"]
    else:
        print(f"❌ Login failed: {response.text}")
        return None

def test_rag_health(token, meeting_id):
    """Check if RAG indexing is available"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/api/meetings/{meeting_id}/chat/health", headers=headers)
    
    print(f"\n🔍 RAG Health Check:")
    print(json.dumps(response.json(), indent=2))
    return response.json()

def test_chat_query(token, meeting_id, question):
    """Ask a question about the meeting"""
    headers = {"Authorization": f"Bearer {token}"}
    data = {
        "meeting_id": meeting_id,
        "question": question
    }
    
    print(f"\n💬 Question: {question}")
    response = requests.post(f"{BASE_URL}/api/meetings/{meeting_id}/chat", json=data, headers=headers)
    
    if response.status_code == 200:
        result = response.json()
        print(f"📝 Answer: {result['answer']}\n")
        print(f"📚 Sources ({len(result['sources'])} chunks):")
        for i, source in enumerate(result['sources'], 1):
            print(f"   {i}. [{', '.join(source['speakers'])}] @ {source['timestamp']:.1f}s")
            print(f"      {source['text'][:100]}...")
    else:
        print(f"❌ Error: {response.status_code}")
        print(response.text)

def main():
    print("🚀 Testing RAG (Chat with Meeting) Feature")
    print("=" * 60)
    
    # Step 1: Authenticate
    print("\n1️⃣ Authenticating...")
    token = get_auth_token()
    if not token:
        print("❌ Failed to authenticate")
        return
    print("✅ Authenticated")
    
    # Step 2: Check RAG health
    print("\n2️⃣ Checking RAG index availability...")
    health = test_rag_health(token, MEETING_ID)
    
    if not health.get("indexed"):
        print("\n⚠️  Meeting not indexed yet!")
        print("   Make sure you:")
        print("   1. Ran the backend: python backend/main.py")
        print("   2. Ran the test: python test_brain_layer.py")
        print("   3. Waited for post-meeting analysis to complete")
        print("   4. Saw the message: '✅ RAG indexing complete'")
        return
    
    print(f"✅ Meeting indexed with {health['chunk_count']} chunks")
    
    # Step 3: Ask questions
    print("\n3️⃣ Testing chat queries...")
    print("=" * 60)
    
    # Test questions (adjust based on your audio content)
    questions = [
        "What was discussed in this meeting?",
        "Can you summarize the main points?",
        "What did the speakers talk about?",
        "Were there any action items mentioned?"
    ]
    
    for question in questions:
        test_chat_query(token, MEETING_ID, question)
        time.sleep(1)  # Rate limiting
    
    print("\n✅ RAG testing complete!")
    print("\n💡 Next Steps:")
    print("   - Integrate this into your frontend UI")
    print("   - Add a chat panel to the Meeting Report page")
    print("   - Display citations with clickable timestamps")

if __name__ == "__main__":
    try:
        main()
    except requests.exceptions.ConnectionError:
        print("❌ Connection refused. Is the backend running?")
        print("   Run: python backend/main.py")
    except Exception as e:
        print(f"❌ Error: {e}")
