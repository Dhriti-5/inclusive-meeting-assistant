import pyttsx3
import os

def speak_text(file_path, language="en"):
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"❌ File not found: {file_path}")
    
    engine = pyttsx3.init()

    voices = engine.getProperty('voices')
    if language == "hi":
        # Try to select a Hindi voice (platform-dependent)
        hindi_voice = next((v for v in voices if "hi" in v.id or "Hindi" in v.name), None)
        if hindi_voice:
            engine.setProperty('voice', hindi_voice.id)
        else:
            print("⚠️ Hindi voice not found. Using default voice.")
    else:
        engine.setProperty('voice', voices[0].id)  # English default

    # Read the content
    with open(file_path, "r", encoding="utf-8") as f:
        text = f.read()

    print(f"🔊 Speaking text from: {file_path}")
    engine.say(text)
    engine.runAndWait()


english_summary_path = r"C:\Users\Pc\Deep Learning Specialization\inclusive-meeting-assistant\output\summary.txt"
speak_text(english_summary_path, language="en")

hindi_summary_path = r"C:\Users\Pc\Deep Learning Specialization\inclusive-meeting-assistant\output\summary_hi.txt"
speak_text(hindi_summary_path, language="hi")