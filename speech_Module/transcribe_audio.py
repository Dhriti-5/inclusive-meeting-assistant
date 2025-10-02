import whisper
import os

def transcribe_audio(audio_path):
    if not os.path.exists(audio_path):
        raise FileNotFoundError(f"The audio file {audio_path} does not exist.")
    print("loading whisper model...")
    model = whisper.load_model("base")

    print("transcribing audio...")
    result = model.transcribe(audio_path, language="en")

    print("\nTranscript:")
    print(result["text"])

    return result["text"]

if __name__ == "__main__":
    AUDIO_FILE = r"C:\Users\Pc\Deep Learning Specialization\inclusive-meeting-assistant\speech_Module\test_audio.wav"
    transcript = transcribe_audio(AUDIO_FILE)
    os.makedirs("output", exist_ok=True)
    with open("output/transcript.txt", "w", encoding="utf-8") as f:
        f.write(transcript)
