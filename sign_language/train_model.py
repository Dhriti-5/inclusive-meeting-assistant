import numpy as np
import os
from sklearn.model_selection import train_test_split
from tensorflow.keras.utils import to_categorical
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout

# --- CONFIGURATION ---
DATA_PATH = os.path.join('MP_Data') 
actions = np.array(['hello', 'yes', 'no', 'thanks', 'question', 'idle']) 
no_sequences = 30
sequence_length = 30

label_map = {label:num for num, label in enumerate(actions)}

# --- LOAD DATA ---
print("📂 Loading Dataset...")
sequences, labels = [], []
for action in actions:
    for sequence in range(no_sequences):
        window = []
        for frame_num in range(sequence_length):
            res = np.load(os.path.join(DATA_PATH, action, str(sequence), "{}.npy".format(frame_num)))
            window.append(res)
        sequences.append(window)
        labels.append(label_map[action])

X = np.array(sequences)
y = to_categorical(labels).astype(int)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.05)

# --- BUILD ADVANCED LSTM MODEL ---
print("🧠 Building Model...")
model = Sequential()
# Input Layer
model.add(LSTM(64, return_sequences=True, activation='relu', input_shape=(30, 258)))
# Hidden Layers
model.add(LSTM(128, return_sequences=True, activation='relu'))
model.add(LSTM(64, return_sequences=False, activation='relu'))
# Dense Layers with Dropout (Prevents overfitting)
model.add(Dense(64, activation='relu'))
model.add(Dense(32, activation='relu'))
# Output Layer
model.add(Dense(actions.shape[0], activation='softmax'))

model.compile(optimizer='Adam', loss='categorical_crossentropy', metrics=['categorical_accuracy'])

# --- TRAIN ---
print("🚀 Training Started...")
model.fit(X_train, y_train, epochs=150) # Increased epochs for better accuracy
model.save('meeting_actions.h5')
print("✅ Model Saved as 'meeting_actions.h5'")