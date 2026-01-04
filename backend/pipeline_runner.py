# backend/pipeline_runner.py
import os
import sys

# Add the project's root directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from nlp_Module.nlp_pipeline import nlp_pipeline
from speech_Module.transcribe_audio import transcribe_audio as speech_to_text
from tts_module.text_to_speech import text_to_speech

# Optional speaker diarization import (may fail on Windows due to TorchAudio)
diarize_audio = None
try:
    from speaker_diarization import diarize_audio
    DIARIZATION_AVAILABLE = True
except Exception as e:
    DIARIZATION_AVAILABLE = False
    print(f"⚠️  Speaker diarization not available in pipeline_runner: {str(e)[:80]}")


# Language mapping for Google Cloud TTS
LANG_MAP = {
    "en": "en-US",
    "hi": "hi-IN",
    "gu": "gu-IN",
    "fr": "fr-FR",
    # Add more if needed
}

def run_pipeline_from_audio(audio_path, lang="en"):
    """
    Full pipeline: Audio → Diarization → Transcript → Summary → Translation → Action Items → TTS
    """
    # --- Step 0: Speaker Diarization (optional) ---
    diarization_segments = []
    if DIARIZATION_AVAILABLE and diarize_audio:
        try:
            diarization_segments = diarize_audio(audio_path) or []
            print("Diarization segments:", diarization_segments)
        except Exception as e:
            print(f"⚠️  Diarization failed: {e}")
    else:
        print("ℹ️  Diarization skipped (not available)")

    # --- Step 1: Transcription ---
    transcript_segments = []
    full_transcript_parts = []

    if diarization_segments:
        # Transcribe each diarized time range
        for seg in diarization_segments:
            start_time = seg.get("start")
            end_time = seg.get("end")
            speaker = seg.get("speaker")

            # Transcribe only this segment of audio
            seg_text = speech_to_text(audio_path, start_time=start_time, end_time=end_time)
            transcript_segments.append({
                "start": start_time,
                "end": end_time,
                "speaker": speaker,
                "text": seg_text
            })
            full_transcript_parts.append(f"[{speaker}] {seg_text}")
    else:
        # No diarization — transcribe whole file
        seg_text = speech_to_text(audio_path)
        transcript_segments.append({
            "start": 0.0,
            "end": None,
            "speaker": "UNKNOWN",
            "text": seg_text
        })
        full_transcript_parts.append(f"[UNKNOWN] {seg_text}")

    transcript = "\n".join(full_transcript_parts)

    # Save transcript
    os.makedirs("output", exist_ok=True)
    with open("output/transcript.txt", "w", encoding="utf-8") as f:
        f.write(transcript)

    # --- Step 2: Summarize ---
    summary = nlp_pipeline.summarize_text(transcript)
    with open("output/summary.txt", "w", encoding="utf-8") as f:
        f.write(summary)

    # --- Step 3: Translate ---
    translated = nlp_pipeline.translate_text(summary, "en", lang)
    translated_file_path = f"output/summary_{lang}.txt"
    with open(translated_file_path, "w", encoding="utf-8") as f:
        f.write(translated)

    # --- Step 4: Extract action items ---
    action_items = nlp_pipeline.extract_action_items(summary)
    with open("output/action_items.txt", "w", encoding="utf-8") as f:
        f.write(action_items)

     # --- Step 5: TTS for translated summary ---
    gcp_lang = LANG_MAP.get(lang, "en-US")
    tts_path = f"output/summary_{lang}.mp3"
    text_to_speech(translated, tts_path, lang=gcp_lang)


    return {
        "transcript": transcript,
        "transcript_segments": transcript_segments,  # NEW — for diarization alignment
        "summary": summary,
        "translated": translated,
        "action_items": action_items,
        "summary_audio": tts_path,
        "diarization": diarization_segments
    }


def run_pipeline_from_transcript(lang="en"):
    """
    Full pipeline: Transcript (existing) → Summary → Translation → Action Items → TTS
    """
    with open("output/transcript.txt", "r", encoding="utf-8") as f:
        transcript = f.read()

    summary = nlp_pipeline.summarize_text(transcript)
    with open("output/summary.txt", "w", encoding="utf-8") as f:
        f.write(summary)

    translated = nlp_pipeline.translate_text(summary, "en", lang)
    translated_file_path = f"output/summary_{lang}.txt"
    with open(translated_file_path, "w", encoding="utf-8") as f:
        f.write(translated)

    action_items = nlp_pipeline.extract_action_items(summary)
    with open("output/action_items.txt", "w", encoding="utf-8") as f:
        f.write(action_items)
        
    gcp_lang = LANG_MAP.get(lang, "en-US")
    tts_path = f"output/summary_{lang}.mp3"
    text_to_speech(translated, tts_path, lang=gcp_lang)
   


    return {
        "transcript": transcript,
        "summary": summary,
        "translated": translated,
        "action_items": action_items,
        "summary_audio": tts_path
    }
