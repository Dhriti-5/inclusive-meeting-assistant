# nlp_module/nlp_pipeline.py

import os
os.environ["TRANSFORMERS_NO_TF"] = "1"
os.environ["TRANSFORMERS_NO_FLAX"] = "1"

from transformers import pipeline, MarianMTModel, MarianTokenizer

class NLPPipeline:
    def __init__(self):
        print(" Loading NLP models into memory...")

        # Summarizer
        self.summarizer = pipeline(
            "summarization",
            model="sshleifer/distilbart-cnn-12-6"
        )

        # Action extractor
        self.action_extractor = pipeline(
            "text2text-generation",
            model="google/flan-t5-base",
            framework="pt"
        )
         # A dictionary to cache translation models
        self.translators = {}
        print("✅ Core NLP models loaded.")

    def summarize_text(self, transcript):
        summary = self.summarizer(transcript, max_length=150, min_length=40, do_sample=False)
        return summary[0]['summary_text']

    def translate_text(self, text, src_lang="en", tgt_lang="hi"):
        if src_lang == tgt_lang:
            return text  # no translation needed
        
        model_name = f'Helsinki-NLP/opus-mt-{src_lang}-{tgt_lang}'

        # Check if the model is already in our cache
        if model_name not in self.translators:
            print(f"Loading translation model: {model_name}...")
            tokenizer = MarianTokenizer.from_pretrained(model_name)
            model = MarianMTModel.from_pretrained(model_name)
            
            # Save the loaded model and tokenizer in our cache
            self.translators[model_name] = {"model": model, "tokenizer": tokenizer}
            print(f"✅ {model_name} loaded and cached.")

            # Use the cached model and tokenizer
            cached_translator = self.translators[model_name]
            tokenizer = cached_translator['tokenizer']
            model = cached_translator['model']
        
            inputs = tokenizer([text], return_tensors="pt", padding=True)
            translated = model.generate(**inputs)
            return tokenizer.decode(translated[0], skip_special_tokens=True)


    def extract_action_items(self, text):
        prompt = (
            "Extract action items from the following meeting summary. "
            "Return them clearly as bullet points.\n\n"
            f"{text}"
        )
        result = self.action_extractor(prompt, max_length=256, clean_up_tokenization_spaces=True)
        return result[0]['generated_text'].strip()

# Global instance
nlp_pipeline = NLPPipeline()
