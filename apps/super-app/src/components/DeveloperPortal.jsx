// ──────────────────────────────────────────────
// DeveloperPortal — Plugin Submission Form
// ──────────────────────────────────────────────
// Form to submit a new plugin. Shows scanning
// animation while Grok audit runs, then displays
// the Security Clearance Certificate.

import { useState } from 'react';
import './DeveloperPortal.css';

export default function DeveloperPortal({ apiBase }) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'utility',
    deploymentUrl: '',
    permissions: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch(`${apiBase}/plugins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          permissions: form.permissions
            .split(',')
            .map((p) => p.trim())
            .filter(Boolean),
        }),
      });

      const json = await res.json();
      if (json.success) {
        setResult(json.data);
        setForm({ name: '', description: '', category: 'utility', deploymentUrl: '', permissions: '' });
      } else {
        setError(json.error || 'Submission failed');
      }
    } catch {
      setError('Network error — is the backend running?');
    } finally {
      setSubmitting(false);
    }
  };

  const audit = result?.grokAuditReport;

  return (
    <div className="developer-portal">
      <div className="portal-header">
        <h1>Developer Portal</h1>
        <p className="portal-subtitle">
          Submit your mini-app for Aether. It will be scanned by our AI security auditor.
        </p>
      </div>

      <div className="portal-layout">
        {/* Submission Form */}
        <form className="submission-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>App Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Canteen Tracker"
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="What does your app do?"
              rows={3}
              required
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select name="category" value={form.category} onChange={handleChange}>
              <option value="utility">Utility</option>
              <option value="social">Social</option>
              <option value="food">Food & Dining</option>
              <option value="academic">Academic</option>
              <option value="finance">Finance</option>
              <option value="health">Health</option>
              <option value="transport">Transport</option>
            </select>
          </div>

          <div className="form-group">
            <label>Deployment URL</label>
            <input
              name="deploymentUrl"
              value={form.deploymentUrl}
              onChange={handleChange}
              placeholder="https://your-app.vercel.app"
              type="url"
              required
            />
          </div>

          <div className="form-group">
            <label>Permissions (comma-separated)</label>
            <input
              name="permissions"
              value={form.permissions}
              onChange={handleChange}
              placeholder="e.g. user_name, department"
            />
          </div>

          <button type="submit" className="btn btn-primary submit-btn" disabled={submitting}>
            {submitting ? '🔍 Scanning...' : '🚀 Submit for Review'}
          </button>
        </form>

        {/* Results */}
        <div className="results-panel">
          {submitting && (
            <div className="scanning-animation">
              <div className="scan-ring" />
              <p className="scan-text">AI Security Audit in Progress...</p>
              <p className="scan-subtext">Grok is analyzing your submission</p>
            </div>
          )}

          {error && (
            <div className="error-card">
              <p>❌ {error}</p>
            </div>
          )}

          {audit && (
            <div className={`certificate-card risk-${audit.riskLevel?.toLowerCase()}`}>
              <h3>🛡️ Security Clearance Certificate</h3>

              <div className="cert-field">
                <span className="cert-label">Risk Level</span>
                <span className={`risk-badge risk-${audit.riskLevel?.toLowerCase()}`}>
                  {audit.riskLevel}
                </span>
              </div>

              <div className="cert-field">
                <span className="cert-label">Recommendation</span>
                <span className="cert-value">{audit.recommendation}</span>
              </div>

              <div className="cert-field">
                <span className="cert-label">Compliance</span>
                <span className="cert-value">{audit.compliance}</span>
              </div>

              {audit.findings?.length > 0 && (
                <div className="cert-findings">
                  <span className="cert-label">Findings</span>
                  <ul>
                    {audit.findings.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
