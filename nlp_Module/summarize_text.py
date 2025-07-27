from transformers import pipeline

summarizer = pipeline("summarization",model="sshleifer/distilbart-cnn-12-6")

def summarize_text(transcript):
    summary = summarizer(transcript, max_length=150, min_length=40, do_sample=False)
    return summary[0]['summary_text']
