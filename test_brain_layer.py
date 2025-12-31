import asyncio
import websockets
import json
import time
import os

# Configuration
BACKEND_URL = "ws://localhost:8000/ws/bot-audio"
AUDIO_FILE = r"c:\Users\Pc\Deep Learning Specialization\inclusive-meeting-assistant\speech_Module\test_audio.wav"
MEETING_ID = "test_brain_layer_001"
CHUNK_SIZE = 8000  # Larger chunks for faster testing
DELAY = 0.1       

async def run_test():
    print(f"🚀 Starting Brain Layer Test for Meeting ID: {MEETING_ID}")
    
    if not os.path.exists(AUDIO_FILE):
        print(f"❌ Error: Test audio file not found at {AUDIO_FILE}")
        return

    print(f"Connecting to {BACKEND_URL}...")
    async with websockets.connect(BACKEND_URL) as websocket:
        # 1. Handshake
        print("🤝 Sending handshake...")
        await websocket.send(json.dumps({
            "type": "bot_connected",
            "meeting_id": MEETING_ID,
            "sampleRate": 16000
        }))
        
        response = await websocket.recv()
        print(f"📩 Server response: {response}")

        # 2. Stream Audio (Max 1 minute)
        print("🎙️  Streaming audio (max 60 seconds)...")
        start_time = time.time()
        max_duration = 60  # seconds
        
        with open(AUDIO_FILE, "rb") as f:
            # Skip header if it's a WAV file (simple heuristic)
            f.read(44) 
            
            while True:
                # Check if 1 minute has elapsed
                elapsed = time.time() - start_time
                if elapsed >= max_duration:
                    print(f"\n⏰ Reached {max_duration}s time limit, stopping stream...")
                    break
                
                chunk = f.read(CHUNK_SIZE)
                if not chunk:
                    break
                
                await websocket.send(chunk)
                await asyncio.sleep(DELAY) 
                print(".", end="", flush=True)
        
        print("\n✅ Audio streaming complete.")
        await asyncio.sleep(1)

    # 3. Disconnect (Trigger Post-Processing)
    print("\n🔌 Disconnected. Watch the BACKEND TERMINAL now!")
    print("   You should see:")
    print("   1. '💾 Meeting audio saved to...'")
    print("   2. '🚀 Triggered post-meeting analysis...'")
    print("   3. '🧠 [Layer 2] Starting post-meeting analysis...'")
    print("   4. '✨ Post-meeting analysis complete'")

if __name__ == "__main__":
    try:
        asyncio.run(run_test())
    except ConnectionRefusedError:
        print("❌ Connection refused. Is the backend running? (python backend/main.py)")
    except Exception as e:
        print(f"❌ Error: {e}")
