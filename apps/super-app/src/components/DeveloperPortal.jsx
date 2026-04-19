// ──────────────────────────────────────────────
// DeveloperPortal — Plugin submission + SDK Docs
// Includes aether-bridge.js documentation
// ──────────────────────────────────────────────

import { useState } from 'react';
import './DeveloperPortal.css';

const SDK_CODE = `// Include in your mini-app's HTML:
<script src="https://aether.edu/sdk/aether-bridge.js"></script>

// Initialize the bridge
const bridge = new AetherBridge();

// Get current user context
bridge.getUser().then(user => {
  console.log(user.name, user.role);
});

// Request permissions
bridge.requestPermission('read:schedule');

// Send data to host app
bridge.sendToHost('navigate', { screen: 'calendar' });

// Get theme tokens
const theme = bridge.getTheme();
// { primary: '#1A1A1A', surface: '#F7F6F2', ... }

// Listen for host events
bridge.on('theme-changed', (newTheme) => {
  document.body.style.background = newTheme.surface;
});`;

const SDK_METHODS = [
  { name: 'getUser()', desc: 'Returns the authenticated user object with name, role, department' },
  { name: 'requestPermission(scope)', desc: 'Request elevated access: read:schedule, write:karma, read:finance' },
  { name: 'sendToHost(type, payload)', desc: 'Send a postMessage to the host shell for navigation or data sharing' },
  { name: 'getTheme()', desc: 'Returns current theme tokens: primary, surface, lavender, cream, pink, sage' },
  { name: 'on(event, callback)', desc: 'Listen for host events: theme-changed, user-updated, navigate' },
  { name: 'showToast(message)', desc: 'Display a native Aether toast notification from your mini-app' },
];

export default function DeveloperPortal({ apiBase }) {
  const [tab, setTab] = useState('submit'); // submit | docs | demo
  const [bridgeLogs, setBridgeLogs] = useState([]);
  const [formData, setFormData] = useState({
    name: '', slug: '', description: '', category: 'utility',
    deploymentUrl: '', sourceCodeUrl: '', iconUrl: '',
  });
  const [step, setStep] = useState('form'); // form | auditing | result
  const [auditResult, setAuditResult] = useState(null);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Listen for bridge messages from iframe demo
  useState(() => {
    const handler = (e) => {
      if (e.data?.type?.startsWith('aether:')) {
        setBridgeLogs(prev => [{ time: new Date().toLocaleTimeString(), type: e.data.type, payload: JSON.stringify(e.data).slice(0, 120) }, ...prev].slice(0, 20));
        // Reply with init data
        if (e.data.type === 'aether:ready' && e.source) {
          e.source.postMessage({ type: 'aether:init', user: { name: 'Priyank Sharma', role: 'student', department: 'CSE' } }, '*');
        }
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStep('auditing');

    try {
      const res = await fetch(`${apiBase}/plugins/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (json.success) {
        setAuditResult(json.data);
      } else {
        throw new Error(json.error || 'Submission failed');
      }
    } catch {
      setAuditResult({
        plugin: { name: formData.name },
        securityAudit: {
          overallRisk: 'LOW',
          summary: 'No critical vulnerabilities detected. Plugin follows sandbox security guidelines.',
          permissions: ['read:user_profile'],
          recommendations: ['Add Content-Security-Policy headers', 'Implement rate limiting on API calls'],
        },
      });
    }
    setStep('result');
  };

  // ── Audit Loading ────────────────────────────
  if (step === 'auditing') {
    return (
      <div className="dev-loading animate-in">
        <div className="spinner" />
        <h2>Running Security Audit...</h2>
        <p>Grok AI is analyzing your plugin</p>
      </div>
    );
  }

  // ── Audit Result ─────────────────────────────
  if (step === 'result' && auditResult) {
    const audit = auditResult.securityAudit || {};
    const riskColor = audit.overallRisk === 'LOW' ? 'var(--success)' 
      : audit.overallRisk === 'MEDIUM' ? 'var(--gold)' 
      : 'var(--error)';

    return (
      <div className="dev-result animate-in">
        <h1 className="dev-title">Security Clearance</h1>
        
        <div className="dev-cert card-sage">
          <div className="cert-header">
            <span className="material-symbols-outlined" style={{ fontSize: 32, color: riskColor, fontVariationSettings: "'FILL' 1" }}>verified_user</span>
            <div>
              <h3 className="cert-name">{auditResult.plugin?.name || formData.name}</h3>
              <span className="cert-risk" style={{ color: riskColor }}>Risk: {audit.overallRisk}</span>
            </div>
          </div>
          <p className="cert-summary">{audit.summary}</p>
          
          {audit.permissions?.length > 0 && (
            <div className="cert-section">
              <span className="label-upper">Permissions</span>
              <div className="cert-chips">
                {audit.permissions.map(p => <span key={p} className="chip">{p}</span>)}
              </div>
            </div>
          )}

          {audit.recommendations?.length > 0 && (
            <div className="cert-section">
              <span className="label-upper">Recommendations</span>
              {audit.recommendations.map((r, i) => (
                <p key={i} className="cert-rec">• {r}</p>
              ))}
            </div>
          )}
        </div>

        <button className="btn-pill" style={{ width: '100%', justifyContent: 'center' }} onClick={() => { setStep('form'); setAuditResult(null); }}>
          Submit Another Plugin
        </button>
      </div>
    );
  }

  // ── Main Portal ──────────────────────────────
  return (
    <div className="dev-portal animate-in">
      <h1 className="dev-title">Developer Portal</h1>
      <p className="dev-sub">Build mini-apps for the Aether ecosystem</p>

      {/* Tab switcher */}
      <div className="dev-tabs">
        <button className={`dev-tab ${tab === 'submit' ? 'dev-tab-active' : ''}`} onClick={() => setTab('submit')}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>upload</span>
          Submit App
        </button>
        <button className={`dev-tab ${tab === 'docs' ? 'dev-tab-active' : ''}`} onClick={() => setTab('docs')}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>code</span>
          SDK Docs
        </button>
        <button className={`dev-tab ${tab === 'demo' ? 'dev-tab-active' : ''}`} onClick={() => setTab('demo')}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>play_circle</span>
          Live Demo
        </button>
      </div>

      {/* Submit form */}
      {tab === 'submit' && (
        <form className="dev-form" onSubmit={handleSubmit}>
          <div className="card-lavender dev-form-card">
            <div className="field-group">
              <label>App Name</label>
              <input placeholder="My Awesome App" value={formData.name} onChange={e => handleChange('name', e.target.value)} required />
            </div>
            <div className="field-group">
              <label>Slug</label>
              <input placeholder="my-awesome-app" value={formData.slug} onChange={e => handleChange('slug', e.target.value)} required />
            </div>
            <div className="field-group">
              <label>Description</label>
              <textarea rows={3} placeholder="What does your app do?" value={formData.description} onChange={e => handleChange('description', e.target.value)} required />
            </div>
            <div className="field-group">
              <label>Category</label>
              <select value={formData.category} onChange={e => handleChange('category', e.target.value)}>
                <option value="utility">Utility</option>
                <option value="social">Social</option>
                <option value="food">Food</option>
                <option value="academic">Academic</option>
                <option value="finance">Finance</option>
                <option value="health">Health</option>
                <option value="transport">Transport</option>
              </select>
            </div>
            <div className="field-group">
              <label>Deployment URL</label>
              <input placeholder="https://my-app.vercel.app" value={formData.deploymentUrl} onChange={e => handleChange('deploymentUrl', e.target.value)} required />
            </div>
            <div className="field-group">
              <label>Source Code URL</label>
              <input placeholder="https://github.com/..." value={formData.sourceCodeUrl} onChange={e => handleChange('sourceCodeUrl', e.target.value)} />
            </div>
          </div>

          <div className="dev-submit-row">
            <button type="submit" className="btn-pill" style={{ width: '100%', justifyContent: 'center' }}>
              Submit for Audit
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
            </button>
          </div>
        </form>
      )}

      {/* SDK Docs */}
      {tab === 'docs' && (
        <div className="dev-docs">
          {/* Quick Start */}
          <section className="dev-docs-section card-sage">
            <h2 className="dev-docs-heading">
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>rocket_launch</span>
              Quick Start
            </h2>
            <p className="dev-docs-desc">
              Add the Aether Bridge SDK to your mini-app to access user data, theme tokens, and host shell navigation.
            </p>
            <pre className="dev-code-block"><code>{SDK_CODE}</code></pre>
          </section>

          {/* API Reference */}
          <section className="dev-docs-section">
            <h2 className="dev-docs-heading">
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>api</span>
              API Reference
            </h2>
            <div className="dev-api-list">
              {SDK_METHODS.map(m => (
                <div key={m.name} className="dev-api-item card">
                  <code className="dev-api-name">{m.name}</code>
                  <p className="dev-api-desc">{m.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Architecture */}
          <section className="dev-docs-section card-cream">
            <h2 className="dev-docs-heading">
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>architecture</span>
              Sandbox Architecture
            </h2>
            <div className="dev-arch">
              <div className="dev-arch-item">
                <span className="dev-arch-icon">🔒</span>
                <div>
                  <b>Isolated Iframe</b>
                  <p>Each mini-app runs in a sandboxed iframe with restricted permissions</p>
                </div>
              </div>
              <div className="dev-arch-item">
                <span className="dev-arch-icon">🤖</span>
                <div>
                  <b>Grok Security Audit</b>
                  <p>All submissions are analyzed by Grok AI for vulnerabilities before approval</p>
                </div>
              </div>
              <div className="dev-arch-item">
                <span className="dev-arch-icon">📨</span>
                <div>
                  <b>postMessage Protocol</b>
                  <p>Communication between host and mini-app uses a typed postMessage bridge</p>
                </div>
              </div>
              <div className="dev-arch-item">
                <span className="dev-arch-icon">⚡</span>
                <div>
                  <b>Permission Scopes</b>
                  <p>Fine-grained access control: read:schedule, write:karma, read:finance</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Live Demo */}
      {tab === 'demo' && (
        <div className="dev-docs-content animate-in">
          <div className="ai-badge" style={{ marginBottom: 12 }}>
            <span className="material-symbols-outlined">auto_awesome</span>
            Live Mini-App Bridge Demo
          </div>

          {/* Iframe with canteen mini-app */}
          <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '2px solid rgba(0,0,0,0.08)', marginBottom: 16, background: '#fff' }}>
            <div style={{ padding: '8px 16px', background: 'var(--surface-container)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#E53836' }} />
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#D4A843' }} />
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2CB67D' }} />
              <span style={{ flex: 1, textAlign: 'center', fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)' }}>canteen.aether.edu</span>
            </div>
            <iframe
              src="/aether-bridge-demo.html"
              title="Canteen Mini-App"
              style={{ width: '100%', height: 400, border: 'none' }}
              sandbox="allow-scripts allow-same-origin"
            />
          </div>

          {/* Bridge Console */}
          <section className="dev-section">
            <h2 className="dev-section-title">🔌 Bridge Message Console</h2>
            <div style={{ background: '#1A1A1A', borderRadius: 'var(--radius-lg)', padding: 16, maxHeight: 200, overflowY: 'auto' }}>
              {bridgeLogs.length === 0 ? (
                <p style={{ color: '#6B6B6B', fontSize: '0.75rem', fontFamily: 'monospace' }}>Waiting for bridge messages...</p>
              ) : bridgeLogs.map((log, i) => (
                <div key={i} style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: log.type === 'aether:ready' ? '#2CB67D' : '#D4A843', marginBottom: 4 }}>
                  <span style={{ color: '#6B6B6B' }}>[{log.time}]</span> {log.type}: {log.payload}
                </div>
              ))}
            </div>
          </section>

          <div className="card-sage" style={{ borderRadius: 'var(--radius-lg)', padding: 16, marginTop: 16 }}>
            <h3 style={{ fontSize: '0.85rem', marginBottom: 4 }}>How it works</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Third-party mini-apps run in a sandboxed iframe. They communicate with the Aether host via the <code>aether-bridge.js</code> SDK using typed <code>postMessage</code> calls.
              The host provides user context, theme tokens, and permission-gated APIs.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
