// ──────────────────────────────────────────────
// LoginScreen — Matching wireframe exactly
// Light warm theme, Plus Jakarta Sans, black circle CTA
// ──────────────────────────────────────────────

import { useState } from 'react';
import './LoginScreen.css';

export default function LoginScreen({ onLogin, onSwitchToRoles }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await onLogin(email, password);
    setLoading(false);
    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <div className="login-page">
      {/* Decorative sage blob */}
      <div className="login-blob" />

      <main className="login-card animate-in">
        <div className="login-inner">
          {/* Header */}
          <header className="login-header">
            <p className="login-institution">Aether Institution</p>
            <h1 className="login-title">Welcome<br/>back.</h1>
          </header>

          {/* Form */}
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-fields">
              <div className="field-group">
                <label htmlFor="login-email">Email Address</label>
                <input
                  id="login-email"
                  type="email"
                  placeholder="hello@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="field-group">
                <label htmlFor="login-password">Password</label>
                <input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && <p className="login-error">{error}</p>}

            <div className="login-actions">
              <button type="submit" className="login-submit" disabled={loading}>
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>

            <button type="button" className="login-forgot" onClick={onSwitchToRoles}>
              Quick demo login →
            </button>
          </form>
        </div>

        {/* Demo hint */}
        <div className="demo-hint">
          <p>Demo: priyank@aether.edu / aether123</p>
        </div>
      </main>
    </div>
  );
}
