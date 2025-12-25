# tts_module/text_to_speech.py
import os
import warnings

# Try to use Google Cloud TTS, fallback to local TTS if not available
try:
    from google.cloud import texttospeech
    GOOGLE_CLOUD_AVAILABLE = True
    
    # Only set credentials if file exists
    if os.path.exists('gcp_credentials.json'):
        os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = 'gcp_credentials.json'
    else:
        GOOGLE_CLOUD_AVAILABLE = False
        warnings.warn("⚠️  Google Cloud credentials not found. Using free local TTS instead.")
except ImportError:
    GOOGLE_CLOUD_AVAILABLE = False
    warnings.warn("⚠️  Google Cloud TTS not available. Using free local TTS instead.")

# Import local TTS as fallback
try:
    import pyttsx3
    LOCAL_TTS_AVAILABLE = True
except ImportError:
    LOCAL_TTS_AVAILABLE = False
    warnings.warn("⚠️  pyttsx3 not installed. Install with: pip install pyttsx3")

def text_to_speech_local(text_to_speak, output_filename, lang="en-US"):
    """
    Local Text-to-Speech using pyttsx3 (FREE alternative to Google Cloud)
    """
    if not LOCAL_TTS_AVAILABLE:
        print("❌ Local TTS not available. Install pyttsx3: pip install pyttsx3")
        return False
    
    try:
        engine = pyttsx3.init()
        engine.setProperty('rate', 150)
        engine.setProperty('volume', 0.9)
        
        # Select appropriate voice
        voices = engine.getProperty('voices')
        if 'hi' in lang.lower() and len(voices) > 1:
            engine.setProperty('voice', voices[1].id)
        else:
            engine.setProperty('voice', voices[0].id)
        
        engine.save_to_file(text_to_speak, output_filename)
        engine.runAndWait()
        
        print(f'✅ Audio written to "{output_filename}" (FREE Local TTS - No Cloud Costs!)')
        return True
    except Exception as e:
        print(f"❌ Local TTS error: {e}")
        return False

def text_to_speech(text_to_speak, output_filename, lang="en-US"):
    """
    Synthesizes speech from text.
    Automatically uses Google Cloud TTS if available, otherwise uses FREE local TTS.
    
    Perfect for students - NO CLOUD COSTS!
    """
    # Try Google Cloud first (if credentials exist)
    if GOOGLE_CLOUD_AVAILABLE and os.getenv('USE_GOOGLE_CLOUD', 'false').lower() == 'true':
        try:
            client = texttospeech.TextToSpeechClient()
            synthesis_input = texttospeech.SynthesisInput(text=text_to_speak)
            voice = texttospeech.VoiceSelectionParams(
                language_code=lang, 
                ssml_gender=texttospeech.SsmlVoiceGender.NEUTRAL
            )
            audio_config = texttospeech.AudioConfig(
                audio_encoding=texttospeech.AudioEncoding.MP3
            )
            response = client.synthesize_speech(
                input=synthesis_input, voice=voice, config=audio_config
            )
            with open(output_filename, "wb") as out:
                out.write(response.audio_content)
            print(f'✅ Audio written to "{output_filename}" (Google Cloud TTS)')
            return True
        except Exception as e:
            print(f"⚠️  Google Cloud TTS failed: {e}")
            print("   Falling back to FREE local TTS...")
    
    # Use FREE local TTS (no cloud costs!)
    print("💡 Using FREE local TTS (No cloud costs - perfect for students!)")
    return text_to_speech_local(text_to_speak, output_filename, lang)