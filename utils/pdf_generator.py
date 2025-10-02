from fpdf import FPDF
import os

def generate_pdf(summary_en, summary_translated, output_path):
    # Read action items if they exist
    action_items_path = "output/action_items.txt"
    action_items = ""
    if os.path.exists(action_items_path):
        with open(action_items_path, "r", encoding="utf-8") as f:
            action_items = f.read().strip()

    pdf = FPDF()
    pdf.add_page()

    pdf.set_font("Arial", size=16)
    pdf.cell(200, 10, "Meeting Summary", ln=True, align="C")

    # English Summary
    pdf.set_font("Arial", size=12)
    pdf.multi_cell(0, 8, f"English Summary:\n{summary_en}")

    # Translated Summary
    pdf.multi_cell(0, 8, f"\nTranslated Summary:\n{summary_translated}")

    # ✅ New Action Items Section
    if action_items:
        pdf.set_font("Arial", "B", 14)
        pdf.multi_cell(0, 8, "\nAction Items:")
        pdf.set_font("Arial", size=12)
        pdf.multi_cell(0, 8, action_items)

    pdf.output(output_path)
