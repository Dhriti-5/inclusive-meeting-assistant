# tts_module/text_to_speech.py
import os
from google.cloud import texttospeech


# This is the most secure way to handle authentication.
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = 'gcp_credentials.json'

def text_to_speech(text_to_speak, output_filename, lang="en-US"):
    """
    Synthesizes speech from the input string of text.
    Saves the output as an MP3 file.
    """
    try:
        # Instantiates a client
        client = texttospeech.TextToSpeechClient()

        # Set the text input to be synthesized
        synthesis_input = texttospeech.SynthesisInput(text=text_to_speak)

        # Build the voice request, select the language code ("en-US") and the ssml
        # voice gender ("neutral"). You can find more voices in the GCP documentation.
        voice = texttospeech.VoiceSelectionParams(
            language_code=lang, ssml_gender=texttospeech.SsmlVoiceGender.NEUTRAL
        )

        # Select the type of audio file you want
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3
        )

        # Perform the text-to-speech request on the text input with the selected
        # voice parameters and audio file type
        response = client.synthesize_speech(
            input=synthesis_input, voice=voice, config=audio_config
        )

        # The response's audio_content is binary.
        with open(output_filename, "wb") as out:
            # Write the response to the output file.
            out.write(response.audio_content)
            print(f'✅ High-quality audio content written to file "{output_filename}"')
        
        return True

    except Exception as e:
        print(f"❌ Error during Text-to-Speech synthesis: {e}")
        print("    Ensure your GCP credentials are correct and the API is enabled.")
        return False