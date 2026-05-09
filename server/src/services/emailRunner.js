// ═══════════════════════════════════════════════════════════════
// AquaSentinel — Email Runner Service
// Spawns Python email script via child_process
// Export: runEmailScript(alertData) → Promise<{sent, to, subject}>
// Consumer: Avani (dispatchAgent.js)
// ═══════════════════════════════════════════════════════════════

import { execFile } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to Python email script (project_root/scripts/email_alert.py)
const SCRIPT_PATH = path.resolve(__dirname, '..', '..', '..', '..', 'scripts', 'email_alert.py');

/**
 * Spawn the Python email_alert.py script with alert data as JSON argument.
 * The Python script reads JSON from argv[1], sends the email via SMTP,
 * and prints a JSON result to stdout.
 *
 * @param {Object} alertData — { zone_name, anomaly_type, severity, confidence, score, reasoning, recipient? }
 * @returns {Promise<{sent: boolean, to: string, subject: string}>}
 */
export function runEmailScript(alertData) {
  return new Promise((resolve, reject) => {
    const dataJson = JSON.stringify(alertData);

    execFile(
      'python',
      [SCRIPT_PATH, dataJson],
      {
        timeout: 15000,  // 15s timeout
        env: {
          ...process.env,  // Pass through SMTP_* env vars
        },
      },
      (error, stdout, stderr) => {
        if (error) {
          console.error('[emailRunner] Python script error:', error.message);
          if (stderr) console.error('[emailRunner] stderr:', stderr);
          reject(new Error(`Email script failed: ${error.message}`));
          return;
        }

        try {
          const result = JSON.parse(stdout.trim());
          resolve(result);
        } catch (parseErr) {
          console.error('[emailRunner] Failed to parse stdout:', stdout);
          reject(new Error(`Email script returned invalid JSON: ${stdout}`));
        }
      }
    );
  });
}

/**
 * Generate an email preview (HTML + subject) without sending.
 * Used by the email preview modal in the UI.
 *
 * @param {Object} alertData — same shape as runEmailScript
 * @returns {{ subject: string, html_body: string, severity: string }}
 */
export function generateEmailPreview(alertData) {
  const severity = (alertData.severity || 'watch').toLowerCase();
  const icon = { critical: '🔴', warning: '🟠', watch: '🟡' }[severity] || '🔵';
  const zone = alertData.zone_name || 'Unknown Zone';
  const atype = alertData.anomaly_type || 'Alert';
  const subject = `${icon} AquaSentinel | ${zone}: ${atype}`;

  const colorMap = { critical: '#ff1744', warning: '#ff9100', watch: '#fdd835' };
  const headerColor = colorMap[severity] || '#42a5f5';

  const html_body = `
<!DOCTYPE html>
<html>
<body style="margin:0; padding:0; background:#0a0f1e; color:#e2e8f0; font-family:'Segoe UI',Inter,Arial,sans-serif;">
  <div style="max-width:640px; margin:0 auto; padding:24px;">
    <div style="background:${headerColor}; border-radius:12px 12px 0 0; padding:24px; text-align:center;">
      <h1 style="margin:0; color:#fff; font-size:22px;">${icon} ${severity.toUpperCase()}</h1>
      <p style="margin:8px 0 0; color:rgba(255,255,255,0.8); font-size:14px;">AquaSentinel Alert</p>
    </div>
    <div style="background:#141b2d; padding:20px; border-left:4px solid ${headerColor};">
      <h2 style="margin:0 0 4px; color:#fff;">${zone}</h2>
      <p style="margin:0; color:#90a4ae;">${atype}</p>
    </div>
    <div style="background:#1a2235; padding:20px;">
      <h3 style="color:#4fc3f7; margin:0 0 12px; font-size:14px; text-transform:uppercase;">Situation</h3>
      <p style="color:#cfd8dc; line-height:1.6;">${alertData.reasoning || 'Anomaly detected.'}</p>
      <table style="width:100%; margin-top:16px; border-collapse:collapse;">
        <tr><td style="padding:6px; color:#90a4ae;">Confidence</td><td style="padding:6px; color:#fff; font-weight:bold;">${alertData.confidence || 'N/A'}%</td></tr>
        <tr><td style="padding:6px; color:#90a4ae;">Score</td><td style="padding:6px; color:${headerColor}; font-weight:bold;">${alertData.score || 'N/A'}</td></tr>
      </table>
    </div>
    <div style="background:#0d1321; padding:16px; text-align:center; border-radius:0 0 12px 12px;">
      <p style="color:#455a64; font-size:11px; margin:0;">AquaSentinel Automated Alert</p>
    </div>
  </div>
</body>
</html>`.trim();

  return { subject, html_body, severity };
}

export default runEmailScript;
