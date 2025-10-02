import cv2
import numpy as np
import mediapipe as mp
from tensorflow.keras.models import load_model

# Load model and labels
model = load_model("sign_lang_Module\sign_model_v1.h5")
labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
          'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
          'U', 'V', 'W', 'X', 'Y', 'Z', 'del', 'nothing', 'space']

mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=False, max_num_hands=1)
mp_draw = mp.solutions.drawing_utils

cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    result = hands.process(image_rgb)

    if result.multi_hand_landmarks:
        for hand_landmarks in result.multi_hand_landmarks:
            # Get bounding box from landmarks
            h, w, _ = frame.shape
            x_coords = [lm.x * w for lm in hand_landmarks.landmark]
            y_coords = [lm.y * h for lm in hand_landmarks.landmark]
            x1, x2 = int(min(x_coords)), int(max(x_coords))
            y1, y2 = int(min(y_coords)), int(max(y_coords))

            # Add padding
            pad = 20
            x1, x2 = max(0, x1 - pad), min(w, x2 + pad)
            y1, y2 = max(0, y1 - pad), min(h, y2 + pad)

            # Extract ROI
            hand_roi = frame[y1:y2, x1:x2]
            try:
                img = cv2.resize(hand_roi, (224, 224))
                img = img.astype("float32") / 255.0
                img = np.expand_dims(img, axis=0)
                prediction = model.predict(img)
                pred_label = labels[np.argmax(prediction)]
            except:
                pred_label = "..."

            # Draw box & label
            cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 0, 0), 2)
            cv2.putText(frame, f"Prediction: {pred_label}", (x1, y1 - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            mp_draw.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)

    cv2.imshow("Real-Time Sign Detection", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
