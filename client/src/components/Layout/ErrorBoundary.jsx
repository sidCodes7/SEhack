import React, { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('AquaSentinel Error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: 'var(--space-xl)',
          textAlign: 'center',
          color: 'var(--text-secondary)',
        }}>
          <div style={{
            display: 'inline-block',
            padding: 'var(--space-xl)',
            background: 'var(--bg-glass)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,59,92,0.2)',
            borderRadius: 'var(--radius-lg)',
            maxWidth: 400,
          }}>
            <div style={{ fontSize: '2rem', marginBottom: 'var(--space-md)' }}>⚠️</div>
            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-sm)', color: 'var(--severity-critical)' }}>
              Component Error
            </div>
            <div style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-lg)', lineHeight: 1.5 }}>
              {this.state.error?.message || 'An unexpected error occurred.'}
            </div>
            <button
              className="btn btn-primary"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
