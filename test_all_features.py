import requests
import time
import os

BASE_URL = "http://127.0.0.1:8000"

def wait_for_backend():
    print("⏳ Waiting for backend to be ready...")
    while True:
        try:
            r = requests.get(BASE_URL + "/")
            if r.status_code == 200:
                print("✅ Backend is running.")
                break
        except:
            pass
        time.sleep(1)

def test_sign_endpoint():
    print("\n🚀 Testing /process-sign/ ...")
    payload = {
        "sign_text": "We will finalize the budget next week and assign tasks to John and Priya.",
        "lang": "en",
        "email": "gandhi.dhriti2005@gmail.com"
    }
    response = requests.post(BASE_URL + "/process-sign/", data=payload)
    if response.status_code != 200:
        print("❌ API call failed:", response.text)
        return
    
    data = response.json()
    print("✅ API responded successfully.")
    print("📜 Summary (EN):", data.get("summary_en", "N/A"))
    print("📝 Action Items:", data.get("action_items", "N/A"))

    # Check if PDF exists
    pdf_path = f"output/sign_summary_{payload['lang']}.pdf"
    if os.path.exists(pdf_path):
        print(f"📄 PDF generated: {pdf_path}")
    else:
        print("❌ PDF not found!")

if __name__ == "__main__":
    wait_for_backend()
    test_sign_endpoint()
