import os
import asyncio
from datetime import datetime
from typing import List, Dict, Any

# Import existing modules
# Note: We use absolute imports based on the workspace structure
from speech_Module.whisper_loader import get_whisper_model
from backend.speaker_diarization import diarize_audio
from nlp_Module.nlp_pipeline import nlp_pipeline
from backend.database import get_meetings_collection
from utils.diarization_utils import align_transcript_with_diarization, build_speaker_tagged_text

async def analyze_meeting(meeting_id: str, audio_path: str):
    """
    Perform post-meeting analysis:
    1. Full transcription (for better quality than real-time)
    2. Speaker Diarization
    3. Alignment
    4. Summarization
    5. Action Item Extraction
    6. Database Update
    """
    print(f"🧠 [Layer 2] Starting post-meeting analysis for {meeting_id}...")
    
    if not os.path.exists(audio_path):
        print(f"❌ Audio file not found: {audio_path}")
        return

    try:
        # 1. Full Transcription
        print("   🎙️  Running full transcription...")
        model = get_whisper_model()
        # Transcribe with word timestamps for better alignment
        result = model.transcribe(audio_path, word_timestamps=True)
        full_text = result["text"]
        segments = result["segments"] # List of segments with start/end/text
        
        # Convert Whisper segments to our format
        transcript_segments = []
        for seg in segments:
            transcript_segments.append({
                "start": seg["start"],
                "end": seg["end"],
                "text": seg["text"].strip()
            })

        # 2. Speaker Diarization
        print("   👥 Running speaker diarization...")
        diarization_result = diarize_audio(audio_path)
        
        # 3. Alignment
        print("   🔗 Aligning speakers with transcript...")
        speaker_aligned_segments = []
        if diarization_result:
            speaker_aligned_segments = align_transcript_with_diarization(transcript_segments, diarization_result)
        else:
            # Fallback if diarization fails
            speaker_aligned_segments = [{"speaker": "Unknown", "text": s["text"], "timestamp": s["start"]} for s in transcript_segments]

        # Build readable transcript for summarization
        readable_transcript = build_speaker_tagged_text(speaker_aligned_segments)

        # 4. Summarization
        print("   📝 Generating summary...")
        summary = nlp_pipeline.summarize_text(readable_transcript)

        # 5. Action Item Extraction
        print("   ✅ Extracting action items...")
        action_items_text = nlp_pipeline.extract_action_items(summary)
        # Convert bullet points to structured action items
        action_items = []
        for item in action_items_text.split("\n"):
            item_text = item.strip("- ").strip()
            if item_text:
                action_items.append({
                    "task": item_text,
                    "assignee": None,
                    "status": "pending",
                    "created_at": datetime.utcnow()
                })

        # Calculate speaker statistics
        print("   📊 Calculating speaker statistics...")
        speaker_stats = {}
        total_duration = 0
        
        for segment in speaker_aligned_segments:
            speaker = segment.get("speaker", "Unknown")
            start = segment.get("start", segment.get("timestamp", 0))
            end = segment.get("end", start)
            duration = end - start
            
            if speaker not in speaker_stats:
                speaker_stats[speaker] = 0
            speaker_stats[speaker] += duration
            total_duration += duration

        # 6. RAG Indexing (Feature 4)
        print("   🔍 Indexing for RAG (Chat with Meeting)...")
        try:
            from backend.rag_engine import get_rag_engine
            rag_engine = get_rag_engine()
            rag_engine.index_meeting(meeting_id, speaker_aligned_segments)
            print("   ✅ RAG indexing complete")
        except Exception as e:
            print(f"   ⚠️  RAG indexing failed: {e}")
            # Don't fail the entire analysis if RAG fails

        # 7. Database Update
        print("   💾 Saving to database...")
        meetings_collection = get_meetings_collection()
        
        update_data = {
            "status": "completed",
            "transcript": speaker_aligned_segments,
            "summary": summary,
            "action_items": action_items,
            "duration_seconds": total_duration,
            "speaker_stats": speaker_stats,
            "ended_at": datetime.utcnow(),
            "rag_indexed": True
        }
        
        await meetings_collection.update_one(
            {"_id": meeting_id},
            {"$set": update_data}
        )
        
        print(f"✨ Post-meeting analysis complete for {meeting_id}")
        
        # Clean up audio file (optional, maybe keep for a while?)
        # os.remove(audio_path) 

    except Exception as e:
        print(f"❌ Error during post-meeting analysis: {e}")
        # Update status to failed or partial
        meetings_collection = get_meetings_collection()
        await meetings_collection.update_one(
            {"_id": meeting_id},
            {"$set": {"status": "analysis_failed", "error": str(e)}}
        )

def run_analysis_background(meeting_id: str, audio_path: str):
    """Helper to run analysis in background loop"""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(analyze_meeting(meeting_id, audio_path))
    loop.close()
