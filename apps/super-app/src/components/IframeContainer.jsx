// ──────────────────────────────────────────────
// IframeContainer — Sandboxed Plugin Viewer
// ──────────────────────────────────────────────
// Opens plugin in a sandboxed iframe and sends
// scoped user data via postMessage (AETHER_INIT).

import { useRef, useEffect } from 'react';
import './IframeContainer.css';

export default function IframeContainer({ plugin, user, onBack }) {
  const iframeRef = useRef(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      // Send scoped user data to the mini-app
      // ⚠️ Only userName, role, department — NO auth tokens
      iframe.contentWindow.postMessage(
        {
          type: 'AETHER_INIT',
          payload: {
            userName: user.userName,
            role: user.role,
            department: user.department,
          },
        },
        '*'
      );
    };

    iframe.addEventListener('load', handleLoad);
    return () => iframe.removeEventListener('load', handleLoad);
  }, [plugin, user]);

  return (
    <div className="iframe-container">
      <div className="iframe-header">
        <button className="btn btn-outline" onClick={onBack}>
          ← Back
        </button>
        <div className="iframe-title">
          <h2>{plugin.name}</h2>
          <span className="iframe-url">{plugin.deploymentUrl}</span>
        </div>
      </div>

      <div className="iframe-wrapper">
        <iframe
          ref={iframeRef}
          src={plugin.deploymentUrl}
          sandbox="allow-scripts allow-same-origin"
          title={plugin.name}
          className="plugin-iframe"
        />
      </div>
    </div>
  );
}
