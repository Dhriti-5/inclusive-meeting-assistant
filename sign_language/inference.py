import cv2
import numpy as np
import os
import mediapipe as mp
from tensorflow.keras.models import load_model
import requests
import time
from datetime import datetime
import sys
import argparse
import asyncio
import websockets
import json

# Parse command line arguments
parser = argparse.ArgumentParser(description='Sign Language Recognition with Backend Integration')
parser.add_argument('--meeting-id', type=str, default='live-session-001',
                    help='Meeting ID to send sign language detections to (default: live-session-001)')
parser.add_argument('--backend-url', type=str, default='http://localhost:8000',
                    help='Backend API URL (default: http://localhost:8000)')
args = parser.parse_args()

# --- LOAD MODEL ---
# Get the directory where this script is located
script_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(script_dir, 'meeting_actions.h5')

try:
    model = load_model(model_path)
    print("✅ Model loaded successfully!")
    print(f"   Model path: {model_path}")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    print(f"   Looking for model at: {model_path}")
    exit(1)

actions = np.array(['hello', 'yes', 'no', 'thanks', 'question', 'idle'])

# --- SETUP MEDIAPIPE ---
mp_holistic = mp.solutions.holistic
mp_drawing = mp.solutions.drawing_utils

# --- VISUALIZATION COLORS ---
colors = [(245,117,16), (117,245,16), (16,117,245), (200,100,200), (255,255,0), (0,255,0)]

def prob_viz(res, actions, input_frame, colors):
    output_frame = input_frame.copy()
    for num, prob in enumerate(res):
        # Draw the bar
        cv2.rectangle(output_frame, (0, 60+num*40), (int(prob*100), 90+num*40), colors[num], -1)
        # Draw the text
        cv2.putText(output_frame, actions[num], (0, 85+num*40), cv2.FONT_HERSHEY_SIMPLEX, 1, (255,255,255), 2, cv2.LINE_AA)
    return output_frame

def mediapipe_detection(image, model):
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB) 
    image.flags.writeable = False                  
    results = model.process(image)                 
    image.flags.writeable = True                   
    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR) 
    return image, results

def extract_keypoints(results):
    pose = np.array([[res.x, res.y, res.z, res.visibility] for res in results.pose_landmarks.landmark]).flatten() if results.pose_landmarks else np.zeros(33*4)
    lh = np.array([[res.x, res.y, res.z] for res in results.left_hand_landmarks.landmark]).flatten() if results.left_hand_landmarks else np.zeros(21*3)
    rh = np.array([[res.x, res.y, res.z] for res in results.right_hand_landmarks.landmark]).flatten() if results.right_hand_landmarks else np.zeros(21*3)
    return np.concatenate([pose, lh, rh])

# --- MAIN LOOP ---
sequence = []
sentence = []
predictions = []
threshold = 0.8 # Confidence must be > 80% to trigger

# Backend API configuration
BACKEND_URL = args.backend_url
MEETING_ID = args.meeting_id
last_sent_word = None
last_sent_time = 0
SEND_COOLDOWN = 3  # Don't send same word within 3 seconds

# WebSocket URL (convert http to ws)
WS_URL = BACKEND_URL.replace('http://', 'ws://').replace('https://', 'wss://')

async def run_sign_language_detection():
    """
    Main async function that runs sign language detection with WebSocket communication.
    This provides real-time, low-latency updates to the backend.
    """
    global last_sent_word, last_sent_time, sequence, sentence, predictions
    
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("❌ Error: Cannot open webcam. Please check if camera is connected.")
        return

    print("✅ Webcam opened successfully!")
    print(f"🔗 Connecting to backend WebSocket at: {WS_URL}")
    print(f"📋 Meeting ID: {MEETING_ID}")
    print(f"💡 Tip: Use --meeting-id <id> to specify a different meeting")
    
    # Set standard meeting resolution
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
    
    # For demo purposes, we'll use a mock token. In production, get this from user login.
    # TODO: Integrate with actual authentication system
    ws_uri = f"{WS_URL}/ws/meeting/{MEETING_ID}?token=demo_token_for_sign_language"
    
    try:
        async with websockets.connect(ws_uri) as websocket:
            print("✅ Connected to Meeting WebSocket!")
            
            # Send initial connection message
            await websocket.send(json.dumps({
                "type": "client_connected",
                "client_type": "sign_language_detector",
                "meeting_id": MEETING_ID
            }))
            
            with mp_holistic.Holistic(min_detection_confidence=0.5, min_tracking_confidence=0.5) as holistic:
                print("🎥 Starting inference... Press 'q' to quit.")
                
                while cap.isOpened():
                    ret, frame = cap.read()
                    
                    if not ret:
                        print("❌ Failed to read frame from camera")
                        break
                    
                    # 1. Detection
                    image, results = mediapipe_detection(frame, holistic)
                    
                    # 2. Draw Skeleton (Optional: Comment out if you want clean video)
                    mp_drawing.draw_landmarks(image, results.left_hand_landmarks, mp_holistic.HAND_CONNECTIONS)
                    mp_drawing.draw_landmarks(image, results.right_hand_landmarks, mp_holistic.HAND_CONNECTIONS)
                    
                    # 3. Prediction Logic
                    keypoints = extract_keypoints(results)
                    sequence.append(keypoints)
                    sequence = sequence[-30:] # Keep last 30 frames

                    if len(sequence) == 30:
                        res = model.predict(np.expand_dims(sequence, axis=0))[0]
                        predictions.append(np.argmax(res))
                        
                        # Stabilization: Only predict if the last 10 frames agree (prevents flickering)
                        if np.unique(predictions[-10:])[0]==np.argmax(res): 
                            if res[np.argmax(res)] > threshold: 
                                current_word = actions[np.argmax(res)]
                                current_confidence = float(res[np.argmax(res)])
                                
                                if len(sentence) > 0: 
                                    if current_word != sentence[-1]:
                                        sentence.append(current_word)
                                        
                                        # --- PHASE 4: SEND VIA WEBSOCKET (REAL-TIME) ---
                                        current_time = time.time()
                                        # Only send if: not idle, not recently sent, and above cooldown period
                                        if (current_word != "idle" and 
                                            (last_sent_word != current_word or 
                                             current_time - last_sent_time > SEND_COOLDOWN)):
                                            
                                            try:
                                                payload = {
                                                    "type": "gesture",
                                                    "word": current_word,
                                                    "confidence": current_confidence,
                                                    "timestamp": datetime.utcnow().isoformat()
                                                }
                                                
                                                # Send via WebSocket - Fast and Real-time!
                                                await websocket.send(json.dumps(payload))
                                                
                                                print(f"🚀 SENT TO MEETING: {current_word} (confidence: {current_confidence:.2f})")
                                                last_sent_word = current_word
                                                last_sent_time = current_time
                                                
                                            except Exception as e:
                                                print(f"⚠️ WebSocket Error: {e}")
                                        # -----------------------------------------
                                        
                                else:
                                    sentence.append(current_word)

                        if len(sentence) > 1: 
                            sentence = sentence[-1:]

                        # 4. Visualization (Probability Bars)
                        image = prob_viz(res, actions, image, colors)
                        
                    # 5. Display Result
                    cv2.rectangle(image, (0,0), (640, 40), (245, 117, 16), -1)
                    cv2.putText(image, ' '.join(sentence), (3,30), 
                                   cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2, cv2.LINE_AA)
                    
                    cv2.imshow('Sign Language Bridge', image)

                    if cv2.waitKey(10) & 0xFF == ord('q'):
                        break
                
    except websockets.exceptions.InvalidStatusCode as e:
        print(f"❌ WebSocket Connection Failed: {e}")
        print(f"   This might happen if:")
        print(f"   1. Backend is not running at {BACKEND_URL}")
        print(f"   2. Authentication token is invalid (using demo token)")
        print(f"   3. Meeting ID '{MEETING_ID}' doesn't exist")
        print(f"\n💡 Falling back to HTTP mode...")
        # Fall back to old HTTP mode if WebSocket fails
        await run_http_fallback_mode(cap, holistic)
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        cap.release()
        cv2.destroyAllWindows()
        print("👋 Sign Language Detection stopped")


async def run_http_fallback_mode(cap, holistic):
    """
    Fallback mode using HTTP requests if WebSocket connection fails.
    This maintains backward compatibility with the original implementation.
    """
    global last_sent_word, last_sent_time, sequence, sentence, predictions
    
    print("🔄 Running in HTTP fallback mode...")
    
    with holistic:
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            # Same detection logic as before
            image, results = mediapipe_detection(frame, holistic)
            mp_drawing.draw_landmarks(image, results.left_hand_landmarks, mp_holistic.HAND_CONNECTIONS)
            mp_drawing.draw_landmarks(image, results.right_hand_landmarks, mp_holistic.HAND_CONNECTIONS)
            
            keypoints = extract_keypoints(results)
            sequence.append(keypoints)
            sequence = sequence[-30:]

            if len(sequence) == 30:
                res = model.predict(np.expand_dims(sequence, axis=0))[0]
                predictions.append(np.argmax(res))
                
                if np.unique(predictions[-10:])[0]==np.argmax(res): 
                    if res[np.argmax(res)] > threshold: 
                        current_word = actions[np.argmax(res)]
                        current_confidence = float(res[np.argmax(res)])
                        
                        if len(sentence) > 0: 
                            if current_word != sentence[-1]:
                                sentence.append(current_word)
                                
                                current_time = time.time()
                                if (current_word != "idle" and 
                                    (last_sent_word != current_word or 
                                     current_time - last_sent_time > SEND_COOLDOWN)):
                                    
                                    try:
                                        payload = {
                                            "word": current_word,
                                            "confidence": current_confidence,
                                            "meeting_id": MEETING_ID
                                        }
                                        response = requests.post(
                                            f"{BACKEND_URL}/api/sign-detected",
                                            json=payload,
                                            timeout=2
                                        )
                                        
                                        if response.status_code == 200:
                                            result = response.json()
                                            if result.get("status") == "success":
                                                print(f"🚀 SENT TO BOT: {current_word} (confidence: {current_confidence:.2f})")
                                                last_sent_word = current_word
                                                last_sent_time = current_time
                                    except Exception as e:
                                        print(f"⚠️ API Error: {e}")
                        else:
                            sentence.append(current_word)

                if len(sentence) > 1: 
                    sentence = sentence[-1:]

                image = prob_viz(res, actions, image, colors)
                
            cv2.rectangle(image, (0,0), (640, 40), (245, 117, 16), -1)
            cv2.putText(image, ' '.join(sentence), (3,30), 
                           cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2, cv2.LINE_AA)
            
            cv2.imshow('Sign Language Bridge', image)

            if cv2.waitKey(10) & 0xFF == ord('q'):
                break


# Run the async main loop
if __name__ == "__main__":
    try:
        asyncio.run(run_sign_language_detection())
    except KeyboardInterrupt:
        print("\n👋 Shutting down gracefully...")
    except Exception as e:
        print(f"❌ Fatal error: {e}")