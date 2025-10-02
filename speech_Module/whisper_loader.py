# speech_Module/whisper_loader.py
import whisper

print("Loading Whisper model...")
model = whisper.load_model("base")
print("Whisper model loaded.")