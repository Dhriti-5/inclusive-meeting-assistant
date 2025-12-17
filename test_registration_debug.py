"""
Quick test to debug registration endpoint
"""
import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_registration():
    """Test user registration"""
    payload = {
        "email": "test@example.com",
        "password": "test123",
        "name": "Test User"
    }
    
    print("Sending registration request...")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"\nStatus Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        print(f"Response Body: {response.text}")
        
        if response.status_code == 201:
            print("\n✅ Registration successful!")
            print(json.dumps(response.json(), indent=2))
        else:
            print(f"\n❌ Registration failed!")
            try:
                print(json.dumps(response.json(), indent=2))
            except:
                print(response.text)
                
    except Exception as e:
        print(f"\n❌ Error: {e}")

if __name__ == "__main__":
    test_registration()
