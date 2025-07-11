import pyttsx3
import os
import argparse

def save_audio(text, output_path, language="en"):
    engine = pyttsx3.init()


    voices = engine.getProperty('voices')
    if language == "hi":
        hindi_voice = next((v for v in voices if "hi" in v.id.lower() or "hindi" in v.name.lower()), None)
        if hindi_voice:
            engine.setProperty('voice', hindi_voice.id)
        else:
            print("⚠️ Hindi voice not found. Using default voice.")
    else:
        engine.setProperty('voice', voices[0].id)  # Default to English


    engine.save_to_file(text, output_path)
    engine.runAndWait()
    print(f"✅ Audio saved to: {output_path}")

def main():
    parser = argparse.ArgumentParser(description="🔊 Convert text summary to speech.")
    parser.add_argument('--lang', type=str, choices=['en', 'hi'], default='en', help='Choose language (en or hi)')
    args = parser.parse_args()

   
    base_dir = r"C:\Users\Pc\Deep Learning Specialization\inclusive-meeting-assistant\output"
    file_path = os.path.join(base_dir, f"summary_{args.lang}.txt" if args.lang == 'hi' else "summary.txt")
    output_audio = os.path.join(base_dir, f"summary_{args.lang}.wav")

    if not os.path.exists(file_path):
        print(f"❌ File not found: {file_path}")
        return

    with open(file_path, "r", encoding="utf-8") as f:
        text = f.read()

    save_audio(text, output_audio, language=args.lang)

if __name__ == "__main__":
    main()
