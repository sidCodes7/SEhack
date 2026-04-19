// ──────────────────────────────────────────────
// IframeContainer — Sandboxed Plugin Viewer (Aether theme)
// ──────────────────────────────────────────────

import { useRef, useEffect } from 'react';
import './IframeContainer.css';

export default function IframeContainer({ plugin, user, onBack }) {
  const iframeRef = useRef(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      iframe.contentWindow.postMessage(
        {
          type: 'AETHER_INIT',
          payload: {
            userName: user.name,
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
    <div className="iframe-container animate-in">
      <div className="iframe-header">
        <button className="iframe-back" onClick={onBack}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="iframe-title-wrap">
          <h2 className="iframe-name">{plugin.name}</h2>
          <span className="iframe-url">{plugin.deploymentUrl}</span>
        </div>
      </div>

      <div className="iframe-wrapper card">
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
