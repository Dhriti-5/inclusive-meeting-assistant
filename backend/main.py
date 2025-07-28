# backend/main.py
import os
import uuid
import shutil
import sys

from utils.pdf_generator import generate_pdf
from utils.email_utils import send_email_with_attachment
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import FileResponse
from fastapi.responses import JSONResponse
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from pipeline_runner import run_pipeline_from_audio, run_pipeline_from_transcript

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Inclusive Meeting Assistant Backend is running."}

@app.post("/process-audio/")
async def process_audio(
    audio: UploadFile = File(...),
    lang: str = Form("en"),
    email: str = Form(...)
):
    try:
        temp_id = str(uuid.uuid4())[:8]
        audio_path = f"speech_Module/temp_{temp_id}.wav"

        with open(audio_path, "wb") as buffer:
            shutil.copyfileobj(audio.file, buffer)

        run_pipeline_from_audio(audio_path, lang)

        # Read outputs
        with open("output/summary.txt", "r") as f:
            summary = f.read()
        with open(f"output/summary_{lang}.txt", "r", encoding="utf-8") as f:
            translated = f.read()
        
        # Step 3.2: Generate PDF
        pdf_path = f"output/meeting_summary_{lang}.pdf"
        generate_pdf(summary, translated, pdf_path)

        # Step 3.3: Send Email
        send_email_with_attachment(
            receiver_email=email,
            subject="Meeting Summary",
            body=f"""Hi,

Thank you for using Inclusive Meeting Assistant. 
Please find attached the meeting summary in {lang.upper()}.

Regards,
Team Inclusive AI
""",
            attachment_path=pdf_path
        )

        return {
            "summary_en": summary,
            "summary_hi": translated,
            "summary_audio": f"output/summary_{lang}.wav"
        }
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/process-sign/")
async def process_sign_text(
    sign_text: str = Form(...),
    lang: str = Form("en"),
    email: str = Form(...)
):
    try:
        # Save input to transcript
        with open("output/transcript.txt", "w", encoding="utf-8") as f:
            f.write(sign_text)

        # Run summarization + translation + TTS
        run_pipeline_from_transcript(lang)

        # Return results
        with open("output/summary.txt", "r") as f:
            summary = f.read()
        with open(f"output/summary_{lang}.txt", "r", encoding="utf-8") as f:
            translated = f.read()
        pdf_path = f"output/sign_summary_{lang}.pdf"
        generate_pdf(summary, translated, pdf_path)

        send_email_with_attachment(
            receiver_email=email,
            subject="Sign Language Meeting Summary",
            body=f"""Hi,

Thank you for using Inclusive Meeting Assistant. 
Please find attached the meeting summary in {lang.upper()}.

Regards,
Team Inclusive AI
""",
            attachment_path=pdf_path
        )


        return {
            "source": "sign_input",
            "summary_en": summary,
            "summary_hi": translated,
            "summary_audio": f"output/summary_{lang}.wav"
        }
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
