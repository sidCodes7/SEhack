"""
AquaSentinel — HTML Email Templates
Three severity levels + daily digest template.
Dark-themed, mission-control aesthetic matching the dashboard.
"""


def critical_template(data):
    """Red-header critical alert email."""
    return f"""
    <html>
    <body style="margin:0; padding:0; background:#0a0f1e; color:#e2e8f0; font-family:'Segoe UI',Inter,Arial,sans-serif;">
      <div style="max-width:640px; margin:0 auto; padding:24px;">

        <!-- Header Banner -->
        <div style="background:linear-gradient(135deg,#ff1744,#d50000); border-radius:12px 12px 0 0; padding:24px; text-align:center;">
          <h1 style="margin:0; color:#fff; font-size:22px; letter-spacing:1px;">🔴 CRITICAL ALERT</h1>
          <p style="margin:8px 0 0; color:#ffcdd2; font-size:14px;">AquaSentinel — Automated Environmental Intelligence</p>
        </div>

        <!-- Zone & Type -->
        <div style="background:#141b2d; padding:20px; border-left:4px solid #ff1744;">
          <h2 style="margin:0 0 4px; color:#ff5252; font-size:20px;">{data.get('zone_name', 'Unknown Zone')}</h2>
          <p style="margin:0; color:#90a4ae; font-size:15px;">{data.get('anomaly_type', 'Anomaly Detected')}</p>
        </div>

        <!-- Situation -->
        <div style="background:#1a2235; padding:20px;">
          <h3 style="color:#4fc3f7; margin:0 0 12px; font-size:14px; text-transform:uppercase; letter-spacing:1px;">Situation</h3>
          <p style="color:#cfd8dc; line-height:1.6; margin:0;">{data.get('reasoning', 'Anomaly detected — review dashboard for details.')}</p>
        </div>

        <!-- Evidence -->
        <div style="background:#141b2d; padding:20px;">
          <h3 style="color:#4fc3f7; margin:0 0 12px; font-size:14px; text-transform:uppercase; letter-spacing:1px;">Evidence</h3>
          <table style="width:100%; border-collapse:collapse;">
            <tr>
              <td style="padding:8px 12px; color:#90a4ae; border-bottom:1px solid #263238;">Confidence</td>
              <td style="padding:8px 12px; color:#fff; font-weight:bold; border-bottom:1px solid #263238;">{data.get('confidence', 'N/A')}%</td>
            </tr>
            <tr>
              <td style="padding:8px 12px; color:#90a4ae; border-bottom:1px solid #263238;">Severity Score</td>
              <td style="padding:8px 12px; color:#ff5252; font-weight:bold; border-bottom:1px solid #263238;">{data.get('score', 'N/A')}</td>
            </tr>
            <tr>
              <td style="padding:8px 12px; color:#90a4ae;">Detected At</td>
              <td style="padding:8px 12px; color:#fff;">{data.get('detected_at', 'Just now')}</td>
            </tr>
          </table>
        </div>

        <!-- Actions -->
        <div style="background:#1a2235; padding:20px;">
          <h3 style="color:#4fc3f7; margin:0 0 12px; font-size:14px; text-transform:uppercase; letter-spacing:1px;">Recommended Actions</h3>
          <p style="color:#cfd8dc; line-height:1.6; margin:0;">{data.get('actions', 'Immediately review the AquaSentinel dashboard for detailed analysis and response coordination.')}</p>
        </div>

        <!-- Footer -->
        <div style="background:#0d1321; padding:16px; text-align:center; border-radius:0 0 12px 12px;">
          <p style="color:#455a64; font-size:11px; margin:0;">
            Automated alert from AquaSentinel Environmental Intelligence System<br>
            This is a machine-generated report — do not reply.
          </p>
        </div>
      </div>
    </body>
    </html>
    """


def warning_template(data):
    """Orange-header warning alert email."""
    return f"""
    <html>
    <body style="margin:0; padding:0; background:#0a0f1e; color:#e2e8f0; font-family:'Segoe UI',Inter,Arial,sans-serif;">
      <div style="max-width:640px; margin:0 auto; padding:24px;">
        <div style="background:linear-gradient(135deg,#ff9100,#e65100); border-radius:12px 12px 0 0; padding:24px; text-align:center;">
          <h1 style="margin:0; color:#fff; font-size:22px;">🟠 WARNING</h1>
          <p style="margin:8px 0 0; color:#ffe0b2; font-size:14px;">AquaSentinel Alert</p>
        </div>
        <div style="background:#141b2d; padding:20px; border-left:4px solid #ff9100;">
          <h2 style="margin:0 0 4px; color:#ffa726;">{data.get('zone_name', 'Unknown Zone')}</h2>
          <p style="margin:0; color:#90a4ae;">{data.get('anomaly_type', 'Warning Detected')}</p>
        </div>
        <div style="background:#1a2235; padding:20px;">
          <p style="color:#cfd8dc; line-height:1.6;">{data.get('reasoning', 'Monitor closely.')}</p>
          <p style="color:#90a4ae; margin-top:12px;">Confidence: <strong style="color:#fff;">{data.get('confidence', 'N/A')}%</strong> | Score: <strong style="color:#ffa726;">{data.get('score', 'N/A')}</strong></p>
        </div>
        <div style="background:#0d1321; padding:16px; text-align:center; border-radius:0 0 12px 12px;">
          <p style="color:#455a64; font-size:11px; margin:0;">AquaSentinel Automated Alert</p>
        </div>
      </div>
    </body>
    </html>
    """


def watch_template(data):
    """Yellow-header watch/FYI email."""
    return f"""
    <html>
    <body style="margin:0; padding:0; background:#0a0f1e; color:#e2e8f0; font-family:'Segoe UI',Inter,Arial,sans-serif;">
      <div style="max-width:640px; margin:0 auto; padding:24px;">
        <div style="background:linear-gradient(135deg,#fdd835,#f9a825); border-radius:12px 12px 0 0; padding:24px; text-align:center;">
          <h1 style="margin:0; color:#1a1a2e; font-size:22px;">🟡 WATCH</h1>
          <p style="margin:8px 0 0; color:#333; font-size:14px;">AquaSentinel Notice</p>
        </div>
        <div style="background:#141b2d; padding:20px; border-left:4px solid #fdd835;">
          <h2 style="margin:0 0 4px; color:#fff176;">{data.get('zone_name', 'Unknown Zone')}</h2>
          <p style="margin:0; color:#90a4ae;">{data.get('anomaly_type', 'Watch Advisory')}</p>
        </div>
        <div style="background:#1a2235; padding:20px;">
          <p style="color:#cfd8dc; line-height:1.6;">{data.get('reasoning', 'No immediate action required.')}</p>
        </div>
        <div style="background:#0d1321; padding:16px; text-align:center; border-radius:0 0 12px 12px;">
          <p style="color:#455a64; font-size:11px; margin:0;">AquaSentinel Automated Alert</p>
        </div>
      </div>
    </body>
    </html>
    """


def daily_digest_template(summary_data):
    """Daily summary email with zone status overview."""
    zones_html = ""
    for z in summary_data.get("zones", []):
        color = {"critical": "#ff1744", "warning": "#ff9100", "watch": "#fdd835", "normal": "#00e676"}.get(z.get("status", "normal"), "#00e676")
        zones_html += f'<tr><td style="padding:6px 12px; color:#fff;">{z["name"]}</td><td style="padding:6px 12px; color:{color}; font-weight:bold;">{z.get("status","normal").upper()}</td><td style="padding:6px 12px; color:#90a4ae;">{z.get("summary","Normal")}</td></tr>'

    return f"""
    <html>
    <body style="margin:0; padding:0; background:#0a0f1e; color:#e2e8f0; font-family:'Segoe UI',Inter,Arial,sans-serif;">
      <div style="max-width:640px; margin:0 auto; padding:24px;">
        <div style="background:linear-gradient(135deg,#1a237e,#0d47a1); border-radius:12px 12px 0 0; padding:24px; text-align:center;">
          <h1 style="margin:0; color:#fff; font-size:22px;">📊 Daily Digest</h1>
          <p style="margin:8px 0 0; color:#90caf9;">{summary_data.get("date", "Today")}</p>
        </div>
        <div style="background:#141b2d; padding:20px;">
          <table style="width:100%; border-collapse:collapse;">
            <tr style="border-bottom:2px solid #263238;">
              <th style="padding:8px 12px; color:#4fc3f7; text-align:left;">Zone</th>
              <th style="padding:8px 12px; color:#4fc3f7; text-align:left;">Status</th>
              <th style="padding:8px 12px; color:#4fc3f7; text-align:left;">Summary</th>
            </tr>
            {zones_html}
          </table>
        </div>
        <div style="background:#1a2235; padding:16px; text-align:center;">
          <p style="color:#90a4ae; margin:0;">Processed: {summary_data.get("total_alerts",0)} alerts | Suppressed: {summary_data.get("suppressed",0)} | Escalated: {summary_data.get("escalated",0)}</p>
        </div>
        <div style="background:#0d1321; padding:16px; text-align:center; border-radius:0 0 12px 12px;">
          <p style="color:#455a64; font-size:11px; margin:0;">AquaSentinel Daily Digest</p>
        </div>
      </div>
    </body>
    </html>
    """
