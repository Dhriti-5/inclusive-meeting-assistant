from transformers import MarianMTModel, MarianTokenizer

def translate_text(text, src_lang="en", tgt_lang="hi"):
    src_lang = src_lang.strip().lower()
    tgt_lang = tgt_lang.strip().lower()

    # If languages are the same, skip translation
    if src_lang == tgt_lang:
        return text

    model_name = f'Helsinki-NLP/opus-mt-{src_lang}-{tgt_lang}'
    tokenizer = MarianTokenizer.from_pretrained(model_name)
    model = MarianMTModel.from_pretrained(model_name)

    inputs = tokenizer([text], return_tensors="pt", padding=True)
    translated = model.generate(**inputs)
    translated_text = tokenizer.decode(translated[0], skip_special_tokens=True)
    return translated_text
