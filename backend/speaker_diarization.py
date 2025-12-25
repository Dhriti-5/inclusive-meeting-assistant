# backend/speaker_diarization.py
import os
import warnings
import traceback
from pyannote.audio import Pipeline
import torch
from dotenv import load_dotenv

load_dotenv()

# suppress that torchaudio deprecation spam (optional)
warnings.filterwarnings("ignore", message=".*torchaudio._backend.list_audio_backends.*")

HF_TOKEN = os.getenv("HUGGINGFACE_TOKEN")  # set this in your environment
PIPELINE = None
DIARIZATION_AVAILABLE = True  # Track if diarization is available

def get_pipeline():
    """
    Return a singleton pyannote pipeline. Loads on first call.
    Returns None if HuggingFace token is not configured (graceful degradation).
    """
    global PIPELINE, DIARIZATION_AVAILABLE
    
    if PIPELINE is not None:
        return PIPELINE

    if not HF_TOKEN:
        print("⚠️  HUGGINGFACE_TOKEN not set - Speaker diarization disabled")
        print("   💡 To enable: Get token from https://huggingface.co/settings/tokens")
        print("   📝 Add to .env: HUGGINGFACE_TOKEN=your_token_here")
        print("   ✅ Transcription still works - just without speaker labels")
        DIARIZATION_AVAILABLE = False
        return None

    # choose the exact model ID you want; "pyannote/speaker-diarization" or a specific version
    model_id = "pyannote/speaker-diarization"

    try:
        print("Loading pyannote pipeline (this happens once)...")
        PIPELINE = Pipeline.from_pretrained(model_id, use_auth_token=HF_TOKEN)
        device = "cuda" if torch.cuda.is_available() else "cpu"
        PIPELINE.to(torch.device(device))
        print(f"✅ Loaded pyannote pipeline on {device}")
        DIARIZATION_AVAILABLE = True
        return PIPELINE
    except Exception as e:
        print(f"⚠️  Failed to load diarization pipeline: {e}")
        print("   ✅ Continuing without speaker diarization...")
        DIARIZATION_AVAILABLE = False
        return None

def preload_pipeline():
    """
    Call at startup to download & initialize models once.
    """
    try:
        get_pipeline()
    except Exception as e:
        print("Failed to preload pyannote pipeline:", e)
        traceback.print_exc()

def diarize_audio(audio_file, return_raw=False):
    """
    Run diarization and return a list of dicts:
    [ {"speaker": "SPEAKER_00", "start": 1.23, "end": 4.56}, ... ]

    If return_raw=True, returns (segments_list, pyannote_annotation)
    On error or if diarization unavailable, returns [] (or ([], None)).
    """
    try:
        pipeline = get_pipeline()
        
        # If pipeline is None (no HF token), return empty gracefully
        if pipeline is None:
            print("ℹ️  Speaker diarization skipped (not configured)")
            if return_raw:
                return [], None
            return []
        
        annotation = pipeline(audio_file)

        segments = []
        for turn, _, speaker in annotation.itertracks(yield_label=True):
            segments.append({
                "speaker": speaker,
                "start": round(float(turn.start), 3),
                "end": round(float(turn.end), 3)
            })
        if return_raw:
            return segments, annotation
        return segments
    except Exception as e:
        print("Diarization error:", e)
        traceback.print_exc()
        return ([] if not return_raw else ([], None))
