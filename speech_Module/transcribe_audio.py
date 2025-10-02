
import os
# Import the pre-loaded model from our new file
from .whisper_loader import model 

def transcribe_audio(audio_path, **options): # added **options for diarization
    if not os.path.exists(audio_path):
        raise FileNotFoundError(f"The audio file {audio_path} does not exist.")

    # The model is already loaded, so we remove the load_model line from here
    print("Transcribing audio...")

    # We need to handle diarization segments now
    start_time = options.get("start_time")
    end_time = options.get("end_time")

    if start_time is not None and end_time is not None:
        # We need to load the audio and clip it for segmented transcription
        audio = whisper.load_audio(audio_path)
        segment_duration = int((end_time - start_time) * whisper.audio.SAMPLE_RATE)
        audio_segment = audio[int(start_time * whisper.audio.SAMPLE_RATE):int(start_time * whisper.audio.SAMPLE_RATE) + segment_duration]
        result = model.transcribe(audio_segment, language="en")
    else:
        result = model.transcribe(audio_path, language="en")

    print(f"Transcript: {result['text']}")
    return result["text"]

# The if __name__ == "__main__": block can remain as is for testing.
if __name__ == "__main__":
    AUDIO_FILE = r"C:\Users\Pc\Deep Learning Specialization\inclusive-meeting-assistant\speech_Module\test_audio.wav"
    transcript = transcribe_audio(AUDIO_FILE)
    os.makedirs("output", exist_ok=True)
    with open("output/transcript.txt", "w", encoding="utf-8") as f:
        f.write(transcript)
