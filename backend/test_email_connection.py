"""
Quick test to verify email inbox service is working
"""
import sys
import os
sys.path.append(os.path.dirname(__file__))

from email_inbox_service import EmailInboxService

print("🔍 Testing Ora Email Connection...")
print(f"Email: {os.getenv('ORA_EMAIL')}")
print(f"Password: {'*' * len(os.getenv('ORA_EMAIL_PASSWORD', ''))}")
print()

try:
    service = EmailInboxService()
    print("📧 Connecting to Gmail IMAP...")
    mail = service.connect()
    print("✅ Successfully connected to Gmail!")
    mail.logout()
    
    print("\n📬 Fetching meeting invites...")
    invites = service.get_all_meeting_invites(include_read=True)
    print(f"✅ Found {len(invites)} emails with Google Meet links")
    
    if invites:
        print("\n📋 Sample invites:")
        for i, invite in enumerate(invites[:3], 1):
            print(f"\n{i}. {invite['subject']}")
            print(f"   From: {invite['sender']}")
            print(f"   Link: {invite['meet_link']}")
    else:
        print("\n💡 No meeting invites found. Try:")
        print("   1. Send a test email with a Google Meet link to ora.meeting.ai@gmail.com")
        print("   2. Make sure IMAP is enabled in Gmail settings")
    
except Exception as e:
    print(f"\n❌ Error: {str(e)}")
    print("\n🔧 Troubleshooting:")
    print("   1. Check ORA_EMAIL and ORA_EMAIL_PASSWORD in .env")
    print("   2. Enable IMAP: Gmail Settings → Forwarding and POP/IMAP → Enable IMAP")
    print("   3. Use Google App Password (not regular password)")
    print("   4. Enable 'Less secure app access' if needed")
