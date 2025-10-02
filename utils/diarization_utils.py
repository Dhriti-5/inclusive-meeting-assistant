# backend/utils/diarization_utils.py
from typing import List, Dict

def overlap(a_start, a_end, b_start, b_end):
    return max(0.0, min(a_end, b_end) - max(a_start, b_start))

def align_transcript_with_diarization(transcript_segments: List[Dict], diarization_segments: List[Dict]):
    """
    Align transcript segments (with timestamps) to diarization segments.

    transcript_segments: [{'start':float,'end':float,'text':str}, ...]
    diarization_segments: [{'speaker':str,'start':float,'end':float}, ...]

    Returns: [{'start','end','speaker','text'}, ...]
    """
    if not transcript_segments or not diarization_segments:
        return []

    diar = diarization_segments
    aligned = []

    for t in transcript_segments:
        best = None
        best_ov = 0.0
        for d in diar:
            ov = overlap(t['start'], t['end'], d['start'], d['end'])
            if ov > best_ov:
                best_ov = ov
                best = d
        speaker = best['speaker'] if best and best_ov > 0 else None
        aligned.append({
            "start": t["start"],
            "end": t["end"],
            "speaker": speaker,
            "text": t["text"]
        })
    return aligned

def naive_align_text_to_diarization(full_text: str, diarization_segments: List[Dict]):
    """
    Fallback when ASR does not provide timestamps.
    Splits full_text into chunks proportional to diarization segment durations.
    This is heuristic and lossy but works as fallback.
    """
    words = full_text.split()
    total_words = len(words)
    if total_words == 0 or not diarization_segments:
        return []

    durations = [max(0.0001, seg['end'] - seg['start']) for seg in diarization_segments]
    total_dur = sum(durations)
    if total_dur <= 0:
        # equal split
        per = total_words // len(diarization_segments)
        assigned = []
        idx = 0
        for i, seg in enumerate(diarization_segments):
            n = per if i < len(diarization_segments)-1 else total_words - idx
            chunk = " ".join(words[idx: idx+n])
            idx += n
            assigned.append({
                "speaker": seg["speaker"],
                "start": seg["start"],
                "end": seg["end"],
                "text": chunk
            })
        return assigned

    assigned = []
    idx = 0
    for i, seg in enumerate(diarization_segments):
        frac = durations[i] / total_dur
        nwords = int(round(frac * total_words))
        # avoid zero-length except maybe last
        if i == len(diarization_segments) - 1:
            chunk = " ".join(words[idx:])
        else:
            chunk = " ".join(words[idx: idx + nwords])
        idx += nwords
        assigned.append({
            "speaker": seg["speaker"],
            "start": seg["start"],
            "end": seg["end"],
            "text": chunk
        })
    # any leftover words -> append to last
    if idx < total_words:
        assigned[-1]['text'] = (assigned[-1]['text'] + " " + " ".join(words[idx:])).strip()
    return assigned

def build_speaker_tagged_text(aligned_segments: List[Dict]) -> str:
    """
    Produce a human-readable text with speaker labels for PDF or UI.
    Example:
      [SPEAKER_00] 00:00:03 - 00:00:10: Hello everyone.
    """
    lines = []
    for seg in aligned_segments:
        sp = seg.get("speaker", "UNKNOWN")
        start = seg.get("start", 0.0)
        end = seg.get("end", 0.0)
        text = seg.get("text", "").strip()
        lines.append(f"[{sp}] {start:.2f}s - {end:.2f}s: {text}")
    return "\n\n".join(lines)
