import os
from speech_Module.transcribe_audio import transcribe_audio
from nlp_Module.summarize_text import summarize_text
from nlp_Module.translate_text import translate_text
from tts_module.text_to_speech import save_audio

def run_pipeline(audio_path, output_lang='en'):
    print(" Step 1: Transcribing audio...")
    transcript = transcribe_audio(audio_path)

    # Save transcript
    transcript_path = "output/transcript.txt"
    with open(transcript_path, "w", encoding="utf-8") as f:
        f.write(transcript)
    print(f" Transcript saved to {transcript_path}")

    print("\n Step 2: Summarizing transcript...")
    summary = summarize_text(transcript)

    summary_path = "output/summary.txt"
    with open(summary_path, "w", encoding="utf-8") as f:
        f.write(summary)
    print(f" Summary saved to {summary_path}")

    if output_lang == "hi":
        print("\n Step 3: Translating summary to Hindi...")
        translated_summary = translate_text(summary, src_lang="en", tgt_lang="hi")
        summary_path = "output/summary_hi.txt"
        with open(summary_path, "w", encoding="utf-8") as f:
            f.write(translated_summary)
        print(f" Hindi summary saved to {summary_path}")
    else:
        translated_summary = summary

    print("\n Step 4: Converting summary to speech...")
    audio_output_path = f"output/summary_{output_lang}.wav"
    save_audio(translated_summary, audio_output_path, language=output_lang)
    print(f" TTS audio saved to {audio_output_path}")


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Run full meeting pipeline")
    parser.add_argument('--audio', required=True, help='Path to input audio file')
    parser.add_argument('--lang', choices=['en', 'hi'], default='en', help='Output language (en or hi)')
    args = parser.parse_args()

    run_pipeline(args.audio, args.lang)
