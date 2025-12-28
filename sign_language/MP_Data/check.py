import os

DATA_PATH = "MP_Data"
actions = ['hello','yes','no','thanks','question','idle']
no_sequences = 30
sequence_length = 30

missing = []
for action in actions:
    for sequence in range(no_sequences):
        for frame_num in range(sequence_length):
            path = os.path.join(DATA_PATH, action, str(sequence), f"{frame_num}.npy")
            if not os.path.exists(path):
                missing.append(path)

if missing:
    print("❌ Missing files:", missing[:20], "...")  # show first 20 missing
else:
    print("✅ Dataset is complete! Ready for training.")
