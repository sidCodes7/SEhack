import React, { useState, useRef, useEffect } from 'react';
import '../../styles/chat.css';

const QUICK_QUERIES = [
  'What needs attention?',
  'Zone status summary',
  'Weekly trends',
  'Suppressed alerts',
  'Correlation report',
];

export default function ChatPanel({ messages = [], isTyping = false, onSend }) {
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const send = (text) => {
    if (!text.trim() || isTyping) return;
    onSend?.(text.trim());
    setInput('');
  };

  return (
    <div className="chat-panel" id="chat-panel">
      <div className="chat-messages" ref={scrollRef}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)', fontSize: 'var(--text-sm)' }}>
            💬 Ask about zone status, alerts, or trends
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={msg.id || i} className={`chat-message ${msg.role}`}>
            {msg.content}
            {msg.typing && <span className="typing-cursor" />}
          </div>
        ))}
      </div>
      <div className="chat-quick-queries">
        {QUICK_QUERIES.map(q => (
          <button key={q} className="chat-quick-btn" onClick={() => send(q)}>{q}</button>
        ))}
      </div>
      <div className="chat-input-row">
        <input
          className="input"
          placeholder="Type a message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send(input)}
          disabled={isTyping}
        />
        <button className="chat-send-btn" onClick={() => send(input)} disabled={isTyping}>▶</button>
      </div>
    </div>
  );
}
