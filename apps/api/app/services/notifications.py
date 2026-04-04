import smtplib
from email.message import EmailMessage
from app.core.config import settings


def _send_smtp(to_email: str, subject: str, body: str) -> None:
    if not settings.SMTP_HOST or not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
        raise RuntimeError("SMTP non configurato")

    msg = EmailMessage()
    msg["From"] = settings.SMTP_FROM
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.set_content(body)

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
        server.starttls()
        server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        server.send_message(msg)


def send_booking_emails(studio_email: str, customer_email: str | None, subject: str, body: str) -> None:
    try:
        _send_smtp(studio_email, subject, body)
        if customer_email:
            _send_smtp(customer_email, subject, body)
    except Exception:
        print("[EMAIL_PLACEHOLDER] to:", studio_email, "|", customer_email or "-")
        print("[EMAIL_PLACEHOLDER] subject:", subject)
        print("[EMAIL_PLACEHOLDER] body:", body)
