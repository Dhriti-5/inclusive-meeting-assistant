"""
Email Inbox Service for Ora AI Meeting Assistant
Polls Gmail inbox for meeting invites and extracts Google Meet links
"""

import imaplib
import email
from email.header import decode_header
import re
from datetime import datetime
from typing import List, Dict, Optional
import os
from dotenv import load_dotenv

load_dotenv()


class EmailInboxService:
    def __init__(self):
        self.email_address = os.getenv("ORA_EMAIL")
        self.email_password = os.getenv("ORA_EMAIL_PASSWORD")
        self.imap_server = "imap.gmail.com"
        
    def connect(self) -> imaplib.IMAP4_SSL:
        """Connect to Gmail IMAP server"""
        try:
            mail = imaplib.IMAP4_SSL(self.imap_server)
            mail.login(self.email_address, self.email_password)
            return mail
        except Exception as e:
            print(f"❌ Failed to connect to email: {str(e)}")
            raise
    
    def extract_meet_link(self, text: str) -> Optional[str]:
        """Extract Google Meet link from email body"""
        # Pattern: https://meet.google.com/xxx-xxxx-xxx
        pattern = r'https://meet\.google\.com/[a-z]{3}-[a-z]{4}-[a-z]{3}'
        match = re.search(pattern, text)
        return match.group(0) if match else None
    
    def decode_email_subject(self, subject) -> str:
        """Decode email subject"""
        decoded = decode_header(subject)
        subject_str = ""
        for content, encoding in decoded:
            if isinstance(content, bytes):
                subject_str += content.decode(encoding or 'utf-8')
            else:
                subject_str += content
        return subject_str
    
    def get_email_body(self, msg) -> str:
        """Extract email body"""
        body = ""
        if msg.is_multipart():
            for part in msg.walk():
                content_type = part.get_content_type()
                if content_type == "text/plain":
                    try:
                        body += part.get_payload(decode=True).decode()
                    except:
                        pass
                elif content_type == "text/html":
                    try:
                        html_body = part.get_payload(decode=True).decode()
                        body += html_body
                    except:
                        pass
        else:
            try:
                body = msg.get_payload(decode=True).decode()
            except:
                pass
        return body
    
    def fetch_meeting_invites(self, limit: int = 20) -> List[Dict]:
        """
        Fetch unread emails containing Google Meet links
        Returns list of meeting invites with metadata
        """
        invites = []
        
        try:
            mail = self.connect()
            mail.select("INBOX")
            
            # Search for unread emails
            status, messages = mail.search(None, 'UNSEEN')
            
            if status != "OK":
                return invites
            
            email_ids = messages[0].split()
            email_ids = email_ids[-limit:] if len(email_ids) > limit else email_ids
            
            for email_id in email_ids:
                try:
                    status, msg_data = mail.fetch(email_id, "(RFC822)")
                    
                    if status != "OK":
                        continue
                    
                    msg = email.message_from_bytes(msg_data[0][1])
                    
                    # Get subject
                    subject = self.decode_email_subject(msg["Subject"] or "No Subject")
                    
                    # Get sender
                    sender = msg.get("From", "Unknown")
                    
                    # Get date
                    date_str = msg.get("Date", "")
                    
                    # Get body and extract meet link
                    body = self.get_email_body(msg)
                    meet_link = self.extract_meet_link(body)
                    
                    # Only include emails with Google Meet links
                    if meet_link:
                        # Extract meeting time from subject or body
                        meeting_time = self.extract_meeting_time(subject, body)
                        
                        invites.append({
                            "id": email_id.decode(),
                            "subject": subject,
                            "sender": sender,
                            "date": date_str,
                            "meet_link": meet_link,
                            "meeting_time": meeting_time,
                            "body_preview": body[:200] if body else ""
                        })
                
                except Exception as e:
                    print(f"Error processing email {email_id}: {str(e)}")
                    continue
            
            mail.close()
            mail.logout()
            
        except Exception as e:
            print(f"Error fetching emails: {str(e)}")
        
        return invites
    
    def extract_meeting_time(self, subject: str, body: str) -> Optional[str]:
        """Extract meeting time from subject or body"""
        # Try to find date patterns in subject first
        text = f"{subject} {body}"
        
        # Common patterns for meeting times
        patterns = [
            r'(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm))',
            r'(\d{1,2}/\d{1,2}/\d{4})',
            r'((?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),\s*\d{1,2}\s*\w+)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                return match.group(1)
        
        return None
    
    def mark_as_read(self, email_id: str):
        """Mark an email as read"""
        try:
            mail = self.connect()
            mail.select("INBOX")
            mail.store(email_id.encode(), '+FLAGS', '\\Seen')
            mail.close()
            mail.logout()
        except Exception as e:
            print(f"Error marking email as read: {str(e)}")
    
    def get_all_meeting_invites(self, include_read: bool = False) -> List[Dict]:
        """
        Fetch all emails containing Google Meet links
        """
        invites = []
        
        try:
            mail = self.connect()
            mail.select("INBOX")
            
            # Search criteria
            search_criteria = 'ALL' if include_read else 'UNSEEN'
            status, messages = mail.search(None, search_criteria)
            
            if status != "OK":
                return invites
            
            email_ids = messages[0].split()
            # Get last 50 emails to avoid loading too many
            email_ids = email_ids[-50:] if len(email_ids) > 50 else email_ids
            
            for email_id in email_ids:
                try:
                    status, msg_data = mail.fetch(email_id, "(RFC822)")
                    
                    if status != "OK":
                        continue
                    
                    msg = email.message_from_bytes(msg_data[0][1])
                    
                    subject = self.decode_email_subject(msg["Subject"] or "No Subject")
                    sender = msg.get("From", "Unknown")
                    date_str = msg.get("Date", "")
                    body = self.get_email_body(msg)
                    meet_link = self.extract_meet_link(body)
                    
                    if meet_link:
                        meeting_time = self.extract_meeting_time(subject, body)
                        
                        invites.append({
                            "id": email_id.decode(),
                            "subject": subject,
                            "sender": sender,
                            "date": date_str,
                            "meet_link": meet_link,
                            "meeting_time": meeting_time,
                            "body_preview": body[:200] if body else "",
                            "is_read": False  # Will be updated based on flags
                        })
                
                except Exception as e:
                    print(f"Error processing email {email_id}: {str(e)}")
                    continue
            
            mail.close()
            mail.logout()
            
        except Exception as e:
            print(f"Error fetching emails: {str(e)}")
        
        # Sort by date (newest first)
        invites.reverse()
        
        return invites


if __name__ == "__main__":
    # Test the service
    service = EmailInboxService()
    invites = service.fetch_meeting_invites()
    print(f"📧 Found {len(invites)} meeting invites:")
    for invite in invites:
        print(f"\n✉️  {invite['subject']}")
        print(f"   From: {invite['sender']}")
        print(f"   Link: {invite['meet_link']}")
        print(f"   Time: {invite['meeting_time']}")
