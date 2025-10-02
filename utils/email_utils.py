# utils/email_utils.py

import smtplib
import os
from email.message import EmailMessage
from dotenv import load_dotenv
load_dotenv() # Loads variables from .env file

def send_email_with_attachment(receiver_email, subject, body, attachment_path):
    print(" Sending email to", receiver_email)
    sender_email = os.getenv("SENDER_EMAIL")
    app_password = os.getenv("APP_PASSWORD")
    msg = EmailMessage()
    msg['Subject'] = subject
    msg['From'] = sender_email
    msg['To'] = receiver_email
    msg.set_content(body)

    # Attach PDF
    with open(attachment_path, 'rb') as f:
        file_data = f.read()
        file_name = attachment_path.split("/")[-1]
    msg.add_attachment(file_data, maintype="application", subtype="octet-stream", filename=file_name)
    # Send
    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
        smtp.login(sender_email, app_password)
        smtp.send_message(msg)
        print(" Email sent successfully!")

