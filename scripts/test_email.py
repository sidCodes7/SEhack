#!/usr/bin/env python3
"""
AquaSentinel — Quick Email Test
Sends a test critical alert email to verify SMTP setup.

Usage: python test_email.py
Requires: SMTP_USER, SMTP_PASS, ALERT_EMAIL_TO in environment
"""

import json
from email_alert import send_alert

TEST_ALERT = {
    "severity": "critical",
    "zone_name": "Lakshadweep Coral Reef",
    "anomaly_type": "Sustained Thermal Stress",
    "confidence": 87,
    "score": 92,
    "reasoning": (
        "Sea surface temperature has risen +2.4°C above the May baseline over 8 consecutive days. "
        "Current SST of 30.9°C exceeds the coral bleaching threshold (29.5°C). "
        "Degree Heating Weeks (DHW) now at 6.2, indicating high probability of mass bleaching. "
        "This pattern is consistent with the 2024 marine heatwave event in the same region."
    ),
    "actions": (
        "1. Deploy emergency monitoring buoys to Lakshadweep atoll\n"
        "2. Activate coral rescue team and document bleaching extent\n"
        "3. Coordinate with INCOIS for satellite overpass requests\n"
        "4. Issue advisory to local fisheries and dive operators"
    ),
    "detected_at": "2026-05-08T14:00:00Z",
}

if __name__ == "__main__":
    print("🧪 AquaSentinel — Email Test\n")
    print(f"Sending test alert for: {TEST_ALERT['zone_name']}")
    print(f"Type: {TEST_ALERT['anomaly_type']}")
    print(f"Severity: {TEST_ALERT['severity']}\n")
    send_alert(json.dumps(TEST_ALERT))
