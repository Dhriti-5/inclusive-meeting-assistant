import cv2
import numpy as np
import os
import mediapipe as mp
from tensorflow.keras.models import load_model
import requests
import time
from datetime import datetime

# --- LOAD MODEL ---
try:
    model = load_model('meeting_actions.h5')
    print("✅ Model loaded successfully!")
except Exception as e:
    print(f"❌ Error loading model: {e}")
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
BACKEND_URL = "http://localhost:8000"
last_sent_word = None
last_sent_time = 0
SEND_COOLDOWN = 3  # Don't send same word within 3 seconds

cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("❌ Error: Cannot open webcam. Please check if camera is connected.")
    exit(1)

print("✅ Webcam opened successfully!")
print("🔗 Connected to backend at:", BACKEND_URL)
# Set standard meeting resolution
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

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
                            
                            # --- PHASE 4: SEND TO BACKEND API ---
                            current_time = time.time()
                            # Only send if: not idle, not recently sent, and above cooldown period
                            if (current_word != "idle" and 
                                (last_sent_word != current_word or 
                                 current_time - last_sent_time > SEND_COOLDOWN)):
                                
                                try:
                                    payload = {
                                        "word": current_word,
                                        "confidence": current_confidence
                                    }
                                    response = requests.post(
                                        f"{BACKEND_URL}/api/sign-detected",
                                        json=payload,
                                        timeout=2  # Don't block if backend is slow
                                    )
                                    
                                    if response.status_code == 200:
                                        result = response.json()
                                        if result.get("status") == "success":
                                            print(f"🚀 SENT TO BOT: {current_word} (confidence: {current_confidence:.2f})")
                                            print(f"   Message: {result.get('message')}")
                                            last_sent_word = current_word
                                            last_sent_time = current_time
                                        else:
                                            print(f"ℹ️ Ignored: {result.get('reason')}")
                                    else:
                                        print(f"⚠️ API returned status {response.status_code}")
                                        
                                except requests.exceptions.ConnectionError:
                                    print(f"⚠️ Backend not reachable at {BACKEND_URL}")
                                except requests.exceptions.Timeout:
                                    print(f"⚠️ Backend request timed out")
                                except Exception as e:
                                    print(f"⚠️ API Error: {e}")
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

    cap.release()
    cv2.destroyAllWindows()