from transformers import pipeline

summarizer = pipeline("summarization",model="sshleifer/distilbart-cnn-12-6")

with open(r"C:\Users\Pc\Deep Learning Specialization\inclusive-meeting-assistant\output\transcript.txt", "r", encoding="utf-8") as f:
    transcript = f.read()

summary = summarizer(transcript, max_length=150, min_length=40, do_sample=False)

print("\n--- Summary ---")
print(summary[0]['summary_text'])


