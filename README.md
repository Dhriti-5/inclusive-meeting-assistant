#Inclusive Meeting Assisant
An AI-powered assistant that supports **inclusive meeting experiences** by enabling both **speech** and **sign language** input. It automatically transcribes spoken content, summarizes discussions, and is being developed to support sign language recognition in future versions.

##Features
**Speech-to-Text** using OpenAI Whisper
**Text Summarization** using Hugging Face's DistilBART
Easy-to-use modular structure
Upcoming: Sign language to text integration

##Project Structure
inclusive-meeting-assistant/
│
├── speech_Module/ # Handles audio transcription
│ └── transcribe_audio.py
│
├── nlp_Module/ # Handles summarization
│ └── summarize_text.py
│
├── output/ # Stores transcript and summaries
│ ├── transcript.txt
│ └── summary.txt
│
├── requirements.txt # All dependencies
├── .gitignore
└── README.md
