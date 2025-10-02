# tts_Module/text_to_speech.py
import pyttsx3
import argparse

def text_to_speech(input_file, lang="en"):
    with open(input_file, 'r', encoding='utf-8') as f:
        text = f.read()

    engine = pyttsx3.init()
    
    if lang == "hi":
        engine.setProperty('voice', 'hi')  # You can customize Hindi voice if installed
    else:
        engine.setProperty('voice', 'english')  # Default English

    output_file = input_file.replace(".txt", ".wav")
    engine.save_to_file(text, output_file)
    engine.runAndWait()
    print(f" Speech saved to: {output_file}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, help="Path to input text file")
    parser.add_argument("--lang", choices=["en", "hi"], default="en", help="Language for TTS")
    args = parser.parse_args()

    text_to_speech(args.input, args.lang)
