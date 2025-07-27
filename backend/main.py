# backend/main.py
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import FileResponse
import os
from run_pipeline import run_pipeline

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Inclusive Meeting Assistant Backend is running."}


@app.post("/process")
async def process_audio(file: UploadFile = File(...), lang: str = Form("en")):
    """
    Receives an audio file and language option,
    then runs the full pipeline and returns the output files.
    """
    # Step 1: Save the uploaded file locally
    input_path = f"speech_Module/{file.filename}"
    with open(input_path, "wb") as f:
        f.write(await file.read())

    # Step 2: Run the backend pipeline
    run_pipeline(audio_path=input_path, output_lang=lang)

    # Step 3: Define output file paths
    transcript_file = "output/transcript.txt"
    summary_file = f"output/summary_hi.txt" if lang == "hi" else "output/summary.txt"
    audio_file = f"output/summary_{lang}.wav"

    return {
        "message": " Pipeline completed successfully.",
        "transcript_path": transcript_file,
        "summary_path": summary_file,
        "tts_audio_path": audio_file
    }
