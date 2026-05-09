#!/usr/bin/env python3
"""
AquaSentinel — Email Alert Sender
Receives alert JSON via argv[1], sends HTML email via SMTP.
Prints JSON result to stdout for the Node.js emailRunner to parse.

Usage: python email_alert.py '{"severity":"critical","zone_name":"Lakshadweep",...}'
"""

import sys
import json
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email_templates import critical_template, warning_template, watch_template


def send_alert(alert_json_str):
    """Parse alert data, select template, send email, print result JSON."""
    try:
        data = json.loads(alert_json_str)
    except json.JSONDecodeError as e:
        print(json.dumps({"sent": False, "error": f"Invalid JSON: {e}"}))
        sys.exit(1)

    # Select template by severity
    severity = data.get("severity", "watch").lower()
    if severity == "critical":
        html = critical_template(data)
    elif severity == "warning":
        html = warning_template(data)
    else:
        html = watch_template(data)

    # Build MIME message
    msg = MIMEMultipart("alternative")
    zone = data.get("zone_name", "Unknown Zone")
    atype = data.get("anomaly_type", "Alert")
    icon = {"critical": "🔴", "warning": "🟠", "watch": "🟡"}.get(severity, "🔵")
    subject = f"{icon} AquaSentinel | {zone}: {atype}"

    smtp_user = os.environ.get("SMTP_USER", "alerts@aquasentinel.app")
    recipient = data.get("recipient", os.environ.get("ALERT_EMAIL_TO", ""))

    msg["Subject"] = subject
    msg["From"] = smtp_user
    msg["To"] = recipient
    msg.attach(MIMEText(html, "html"))

    # Send via SMTP
    smtp_host = os.environ.get("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.environ.get("SMTP_PORT", "587"))
    smtp_pass = os.environ.get("SMTP_PASS", "")

    if not smtp_pass or not recipient:
        # Dry run — no credentials configured
        result = {
            "sent": False,
            "dry_run": True,
            "to": recipient or "(not configured)",
            "subject": subject,
            "reason": "SMTP credentials or recipient not configured",
        }
        print(json.dumps(result))
        return

    try:
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(smtp_user, smtp_pass)
            server.send_message(msg)

        result = {"sent": True, "to": recipient, "subject": subject}
        print(json.dumps(result))

    except Exception as e:
        result = {"sent": False, "to": recipient, "subject": subject, "error": str(e)}
        print(json.dumps(result))
        sys.exit(1)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"sent": False, "error": "No alert data provided. Pass JSON as argv[1]."}))
        sys.exit(1)
    send_alert(sys.argv[1])
