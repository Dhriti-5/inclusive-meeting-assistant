from transformers import MarianMTModel, MarianTokenizer
import os

# === Choose target language ===
src_lang = "en"
tgt_lang = "hi"  # 'hi' for Hindi, 'bn' for Bengali, 'ta' for Tamil, etc.

# === Model name format ===
model_name = f'Helsinki-NLP/opus-mt-{src_lang}-{tgt_lang}'

# === Load model and tokenizer ===
tokenizer = MarianTokenizer.from_pretrained(model_name)
model = MarianMTModel.from_pretrained(model_name)

# === Load input text (English) ===
with open(r"C:\Users\Pc\Deep Learning Specialization\inclusive-meeting-assistant\output\summary.txt", "r", encoding="utf-8") as f:
    text = f.read()

# === Tokenize and translate ===
inputs = tokenizer([text], return_tensors="pt", padding=True)
translated = model.generate(**inputs)
translated_text = tokenizer.decode(translated[0], skip_special_tokens=True)

# === Save or print ===
print(f"\nTranslated Summary ({tgt_lang}):\n")
print(translated_text)

# Optionally save to file
with open(r"C:\Users\Pc\Deep Learning Specialization\inclusive-meeting-assistant\output\summary_hi.txt", "w", encoding="utf-8") as f:
    f.write(translated_text)

