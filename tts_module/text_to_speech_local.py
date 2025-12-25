# tts_module/text_to_speech_local.py
"""
Local Text-to-Speech using pyttsx3 (100% FREE, no cloud needed!)
Perfect for students - works completely offline
"""
import os
import pyttsx3

def text_to_speech(text_to_speak, output_filename, lang="en-US"):
    """
    Synthesizes speech from text using local pyttsx3.
    Saves the output as a WAV file.
    FREE and works offline!
    """
    try:
        # Initialize the TTS engine
        engine = pyttsx3.init()
        
        # Set properties (optional)
        engine.setProperty('rate', 150)    # Speed of speech
        engine.setProperty('volume', 0.9)  # Volume (0.0 to 1.0)
        
        # Get available voices
        voices = engine.getProperty('voices')
        
        # Select voice based on language
        if 'hi' in lang.lower():  # Hindi
            # Try to find Hindi voice, fallback to default
            for voice in voices:
                if 'hindi' in voice.name.lower() or 'hi' in voice.languages:
                    engine.setProperty('voice', voice.id)
                    break
        else:  # English or default
            engine.setProperty('voice', voices[0].id)
        
        # Save to file
        engine.save_to_file(text_to_speak, output_filename)
        engine.runAndWait()
        
        print(f'✅ Audio content written to file "{output_filename}" (Local TTS - FREE!)')
        return True
        
    except Exception as e:
        print(f"❌ Error during Text-to-Speech synthesis: {e}")
        print("    pyttsx3 may need installation: pip install pyttsx3")
        return False

def text_to_speech_stream(text_to_speak):
    """
    Speaks text directly without saving to file.
    Useful for real-time feedback.
    """
    try:
        engine = pyttsx3.init()
        engine.setProperty('rate', 150)
        engine.setProperty('volume', 0.9)
        engine.say(text_to_speak)
        engine.runAndWait()
        return True
    except Exception as e:
        print(f"❌ Error during TTS stream: {e}")
        return False

# Keep original function for backward compatibility
def text_to_speech_google_cloud(text_to_speak, output_filename, lang="en-US"):
    """
    Google Cloud TTS - REQUIRES PAYMENT
    Only use if you have GCP credits
    """
    print("⚠️  Google Cloud TTS is disabled to save costs")
    print("    Using free local alternative instead...")
    return text_to_speech(text_to_speak, output_filename, lang)
