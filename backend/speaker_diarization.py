# backend/speaker_diarization.py
import os
import warnings
import traceback
from pyannote.audio import Pipeline
import torch

# suppress that torchaudio deprecation spam (optional)
warnings.filterwarnings("ignore", message=".*torchaudio._backend.list_audio_backends.*")

HF_TOKEN = os.getenv("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")  # set this in your environment
PIPELINE = None

def get_pipeline():
    """
    Return a singleton pyannote pipeline. Loads on first call.
    """
    global PIPELINE
    if PIPELINE is not None:
        return PIPELINE

    if not HF_TOKEN:
        raise RuntimeError("HUGGINGFACE_TOKEN env var not set. Set it or you will not download gated models.")

    # choose the exact model ID you want; "pyannote/speaker-diarization" or a specific version
    model_id = "pyannote/speaker-diarization"

    print("Loading pyannote pipeline (this happens once)...")
    PIPELINE = Pipeline.from_pretrained(model_id, use_auth_token=HF_TOKEN)
    device = "cuda" if torch.cuda.is_available() else "cpu"
    PIPELINE.to(torch.device(device))
    print("Loaded pyannote pipeline on", device)
    return PIPELINE

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
    On error, returns [] (or ([], None)).
    """
    try:
        pipeline = get_pipeline()
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
