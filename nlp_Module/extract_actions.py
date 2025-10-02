# nlp_Module/extract_actions.py

import os
os.environ["TRANSFORMERS_NO_TF"] = "1"   # Skip TensorFlow
os.environ["TRANSFORMERS_NO_FLAX"] = "1" # Skip Flax

from transformers import pipeline
import argparse
import re

# Load HuggingFace FLAN-T5 using PyTorch
action_extractor = pipeline(
    "text2text-generation",
    model="google/flan-t5-base",
    framework="pt"  # Force PyTorch
)

def clean_action_items(raw_text: str) -> str:
    """
    Ensure output is clean bullet points.
    """
    # Split by newlines or sentence endings
    items = re.split(r"\n+|(?<=\.)\s+", raw_text.strip())

    clean_items = []
    for item in items:
        # Remove numbering/bullets already in text
        item = re.sub(r"^\s*[-*\d\.\)]\s*", "", item).strip()
        if item:
            clean_items.append(f"- {item}")

    return "\n".join(clean_items)

def extract_action_items(text):
    """
    Extract action items from meeting summary text.
    """
    prompt = (
        "Extract clear, concise action items from the following meeting summary. "
        "Return only the tasks as bullet points, no extra commentary.\n\n"
        f"{text}"
    )
    result = action_extractor(prompt, max_length=256, clean_up_tokenization_spaces=True)
    raw_output = result[0]['generated_text'].strip()
    return clean_action_items(raw_output)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", type=str, default="output/summary.txt")
    parser.add_argument("--output", type=str, default="output/action_items.txt")
    args = parser.parse_args()

    # Read meeting summary
    with open(args.input, "r", encoding="utf-8") as f:
        summary = f.read()

    # Extract action items
    action_items = extract_action_items(summary)

    # Save to file
    with open(args.output, "w", encoding="utf-8") as f:
        f.write(action_items)

    print(f"✅ Action items saved to {args.output}")

if __name__ == "__main__":
    main()
