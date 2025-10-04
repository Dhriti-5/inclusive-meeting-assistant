import cv2
import numpy as np
import mediapipe as mp
import requests
from tensorflow.keras.models import load_model
from nlp_Module.nlp_pipeline import nlp_pipeline
from tts_module.text_to_speech import text_to_speech # Assuming it can take text directly
# import subprocess

# Load trained model and labels
model = load_model("sign_lang_Module/sign_model_v1.h5")
labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
          'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
          'U', 'V', 'W', 'X', 'Y', 'Z', 'del', 'nothing', 'space']

# MediaPipe hands setup
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=False, max_num_hands=1)
mp_draw = mp.solutions.drawing_utils

cap = cv2.VideoCapture(0)
buffer = ""
last_label = ""
space_count = 0
cooldown = 15
counter = 0

BACKEND_SIGN_URL = "http://127.0.0.1:8000/process-sign/"
# For this script, we'll hardcode the email. In a real app, you'd have a login.
USER_EMAIL = "gandhi.dhriti2005@gmail.com" 

print("[INFO] Starting real-time sign detection...")

while True:
    ret, frame = cap.read()
    if not ret:
        break

    image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    result = hands.process(image_rgb)

    if result.multi_hand_landmarks:
        for hand_landmarks in result.multi_hand_landmarks:
            h, w, _ = frame.shape
            x_coords = [lm.x * w for lm in hand_landmarks.landmark]
            y_coords = [lm.y * h for lm in hand_landmarks.landmark]
            x1, x2 = int(min(x_coords)), int(max(x_coords))
            y1, y2 = int(min(y_coords)), int(max(y_coords))
            pad = 20
            x1, x2 = max(0, x1 - pad), min(w, x2 + pad)
            y1, y2 = max(0, y1 - pad), min(h, y2 + pad)

            hand_roi = frame[y1:y2, x1:x2]
            try:
                img = cv2.resize(hand_roi, (224, 224))
                img = img.astype("float32") / 255.0
                img = np.expand_dims(img, axis=0)
                prediction = model.predict(img)
                pred_label = labels[np.argmax(prediction)]
            except:
                pred_label = "..."

            if pred_label != last_label:
                counter += 1
                if counter > cooldown:
                    if pred_label == "space":
                       # Add a single space to the buffer
                       if last_label != "space": # Prevents adding multiple spaces
                           buffer += " "
                       space_count += 1
                       if space_count >= 2: # Triggered by holding 'space' or signing it twice
                           final_text = buffer.strip()
                           print(f"[INFO] Final sentence detected: {final_text}")
                           
                           if final_text:
                               print("[INFO] Sending text to backend for processing...")
                               try:
                                   # Prepare the data payload for the API
                                   payload = {
                                       "sign_text": final_text,
                                       "lang": "en",
                                       "email": USER_EMAIL
                                   }
                                   
                                   # Make the POST request to your FastAPI backend
                                   response = requests.post(BACKEND_SIGN_URL, data=payload)
                                   
                                   if response.status_code == 200:
                                       print("✅ Backend processed the text successfully!")
                                       print("📬 Check your email for the summary.")
                                   else:
                                       print(f"❌ Error from backend: {response.status_code} - {response.text}")
                   
                               except requests.exceptions.RequestException as e:
                                   print(f"❌ Could not connect to the backend. Is it running? Error: {e}")
                           
                           # Reset for the next sentence
                           buffer = ""
                           space_count = 0
                    elif pred_label == "del":
                        buffer = buffer[:-1]
                        space_count = 0
                    elif pred_label == "nothing":
                        pass  # Do nothing
                    else:
                        buffer += pred_label
                        space_count = 0

                    last_label = pred_label
                    counter = 0

            mp_draw.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)
            cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 0, 0), 2)
            cv2.putText(frame, f"Sign: {pred_label}", (10, 50),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

    # Display current buffer
    cv2.putText(frame, f"Buffer: {buffer}", (10, 100),
                cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)

    cv2.imshow("Sign → Meeting Assistant", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
