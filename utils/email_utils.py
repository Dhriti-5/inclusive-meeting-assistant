# utils/email_utils.py

import smtplib
import os
from email.message import EmailMessage
from dotenv import load_dotenv
load_dotenv() # Loads variables from .env file

def send_email_with_attachment(receiver_email, subject, body, attachment_path):
    """
    Send email with PDF attachment.
    Gracefully handles missing email configuration.
    """
    print(f"📧 Sending email to {receiver_email}")
    
    sender_email = os.getenv("SENDER_EMAIL")
    app_password = os.getenv("APP_PASSWORD")
    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    
    # Check if email is configured
    if not sender_email or not app_password:
        print("⚠️  Email not configured. Set SENDER_EMAIL and APP_PASSWORD in .env")
        print("   📝 For Gmail: Use app password from https://myaccount.google.com/apppasswords")
        raise ValueError("Email credentials not configured. Check .env file.")
    
    if not os.path.exists(attachment_path):
        raise FileNotFoundError(f"Attachment not found: {attachment_path}")
    
    try:
        msg = EmailMessage()
        msg['Subject'] = subject
        msg['From'] = sender_email
        msg['To'] = receiver_email
        msg.set_content(body)

        # Attach PDF
        with open(attachment_path, 'rb') as f:
            file_data = f.read()
            file_name = os.path.basename(attachment_path)
        msg.add_attachment(file_data, maintype="application", subtype="pdf", filename=file_name)
        
        # Send using SMTP_SSL (port 465) or STARTTLS (port 587)
        if smtp_port == 465:
            with smtplib.SMTP_SSL(smtp_server, smtp_port) as smtp:
                smtp.login(sender_email, app_password)
                smtp.send_message(msg)
        else:
            with smtplib.SMTP(smtp_server, smtp_port) as smtp:
                smtp.starttls()
                smtp.login(sender_email, app_password)
                smtp.send_message(msg)
                
        print("✅ Email sent successfully!")
        return True
        
    except smtplib.SMTPAuthenticationError:
        print("❌ Email authentication failed. Check SENDER_EMAIL and APP_PASSWORD")
        raise
    except Exception as e:
        print(f"❌ Failed to send email: {e}")
        raise

