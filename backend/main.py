import uuid
import shutil
import sys
import os
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse

# Append project root to sys.path **before** importing from utils or other root modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Now safe to import project modules
from speaker_diarization import diarize_audio, preload_pipeline
from utils.diarization_utils import (
    align_transcript_with_diarization,
    naive_align_text_to_diarization,
    build_speaker_tagged_text
)
from utils.pdf_generator import generate_pdf
from utils.email_utils import send_email_with_attachment
from pipeline_runner import run_pipeline_from_audio, run_pipeline_from_transcript
from nlp_Module.nlp_pipeline import nlp_pipeline  # Preload models

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Inclusive Meeting Assistant Backend is running."}
# inside app startup:
@app.on_event("startup")
def load_models():
    # preload NLP pipeline
    _ = nlp_pipeline
    print(" NLP models loaded and ready.")
    # preload diarization pipeline (optional; safe to wrap in try)
    try:
        preload_pipeline()
    except Exception as e:
        print("Warning: failed to preload diarization pipeline:", e)

# updated process_audio endpoint:
@app.post("/process-audio/")
async def process_audio(audio: UploadFile = File(...), lang: str = Form("en"), email: str = Form(...)):
    try:
        temp_id = str(uuid.uuid4())[:8]
        audio_path = f"speech_Module/temp_{temp_id}.wav"
        with open(audio_path, "wb") as buffer:
            shutil.copyfileobj(audio.file, buffer)

        # --- Step A: Diarization (safe) ---
        try:
            diarization_result = diarize_audio(audio_path) or []
        except Exception as e:
            print("Diarization failed, continuing without it:", e)
            diarization_result = []

        # --- Step B: Run existing pipeline (ASR, summary, etc.) ---
        result = run_pipeline_from_audio(audio_path, lang)

        # Try to obtain transcript segments from result (your pipeline should supply these if possible)
        transcript_segments = result.get("transcript_segments")  # expected [{'start','end','text'}, ...]
        full_transcript = result.get("transcript") or result.get("full_transcript") or result.get("summary_audio")

        # --- Step C: Align transcripts with diarization ---
        speaker_aligned = []
        if transcript_segments and diarization_result:
            speaker_aligned = align_transcript_with_diarization(transcript_segments, diarization_result)
        elif full_transcript and diarization_result:
            # fallback: naive proportional split
            speaker_aligned = naive_align_text_to_diarization(full_transcript, diarization_result)
        else:
            # nothing to align; speaker_aligned stays empty
            speaker_aligned = []

        # Build speaker-tagged text for PDF (or fall back to summary if no transcript)
        if speaker_aligned:
            speaker_tagged_text = build_speaker_tagged_text(speaker_aligned)
        else:
            # fallback: tag the single summary with UNKNOWN speaker
            summary_text = result.get("summary", "")
            speaker_tagged_text = f"[UNKNOWN] 0.00s - 0.00s: {summary_text}"

        # --- Step D: Generate PDF using speaker-tagged text ---
        pdf_path = f"output/meeting_summary_{lang}.pdf"
        # If your generate_pdf expects (summary, translated), you might modify it or wrap it.
        # Here we call it with the speaker_tagged_text as the primary content.
        generate_pdf(speaker_tagged_text, result.get("translated", ""), pdf_path)

        # --- Step E: Emailing etc (same as before) ---
        action_items_text = f"\nAction Items:\n{result['action_items']}" if result.get("action_items") else ""
        email_body = f"""Hi,

Thank you for using Inclusive Meeting Assistant. 
Please find attached the meeting summary in {lang.upper()}.
{action_items_text}
Regards,
Team Inclusive AI
"""
        send_email_with_attachment(email, "Meeting Summary", email_body, pdf_path)

        # Response: include diarization + aligned transcript
        return {
            "summary_en": result.get("summary"),
            "summary_hi": result.get("translated"),
            "summary_audio": result.get("summary_audio"),
            "action_items": result.get("action_items"),
            "diarization": diarization_result,
            "speaker_aligned": speaker_aligned
        }

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.post("/process-sign/")
async def process_sign_text(sign_text: str = Form(...), lang: str = Form("en"), email: str = Form(...)):
    try:
        # Save sign text to file
        with open("output/transcript.txt", "w", encoding="utf-8") as f:
            f.write(sign_text)

        # Process transcript
        result = run_pipeline_from_transcript(lang)

        # Generate PDF
        pdf_path = f"output/sign_summary_{lang}.pdf"
        generate_pdf(result["summary"], result["translated"], pdf_path)

        # Email body
        action_items_text = f"\nAction Items:\n{result['action_items']}" if result["action_items"] else ""
        email_body = f"""Hi,

Thank you for using Inclusive Meeting Assistant. 
Please find attached the meeting summary in {lang.upper()}.
{action_items_text}
Regards,
Team Inclusive AI
"""

        send_email_with_attachment(email, "Sign Language Meeting Summary", email_body, pdf_path)

        return {
            "source": "sign_input",
            "summary_en": result["summary"],
            "summary_hi": result["translated"],
            "summary_audio": result["summary_audio"],
            "action_items": result["action_items"]
        }

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


