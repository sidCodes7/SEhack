import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Send, Sparkles } from 'lucide-react';
import useChat from '../hooks/useChat';
import '../styles/chat-page.css';

const QUICK_QUERIES = [
  { text: 'What needs attention?', icon: '🚨' },
  { text: 'Zone status summary', icon: '🗺️' },
  { text: 'Weekly trends', icon: '📈' },
  { text: 'Suppressed alerts', icon: '🔇' },
  { text: 'Correlation report', icon: '🔗' },
  { text: 'Thermal risk analysis', icon: '🌡️' },
  { text: 'Recommend actions', icon: '🎯' },
  { text: 'Bleaching forecast', icon: '🪸' },
];

export default function ChatPage() {
  const navigate = useNavigate();
  const { messages, isTyping, sendMessage } = useChat();
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const send = (text) => {
    if (!text.trim() || isTyping) return;
    sendMessage(text.trim());
    setInput('');
  };

  return (
    <div className="page chat-page">
      <header className="page-header">
        <div className="page-nav">
          <button className="btn btn-back" onClick={() => navigate('/')}>
            <ArrowLeft size={18} /> Dashboard
          </button>
        </div>
        <div className="page-title-row">
          <h1><Sparkles size={24} /> AI Advisor</h1>
          <p className="text-dim">Ask questions about zones, alerts, and environmental trends</p>
        </div>
      </header>

      <div className="chat-page-body">
        <div className="chat-page-messages" ref={scrollRef}>
          {messages.length === 0 && (
            <div className="chat-page-empty">
              <div className="chat-page-empty-icon">🌊</div>
              <h2>AquaSentinel AI Advisor</h2>
              <p>Ask me about zone status, anomalies, trends, or recommended actions.</p>
              <div className="chat-page-suggestions">
                {QUICK_QUERIES.map(q => (
                  <button key={q.text} className="chat-suggestion-card glass-card" onClick={() => send(q.text)}>
                    <span className="chat-suggestion-icon">{q.icon}</span>
                    <span>{q.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={msg.id || i} className={`chat-page-msg ${msg.role}`}>
              <div className="chat-msg-avatar">
                {msg.role === 'user' ? '👤' : '🤖'}
              </div>
              <div className="chat-msg-bubble">
                <div className="chat-msg-content">{msg.content}</div>
                {msg.typing && <span className="typing-cursor" />}
              </div>
            </div>
          ))}
          {isTyping && messages[messages.length - 1]?.role !== 'ai' && (
            <div className="chat-page-msg ai">
              <div className="chat-msg-avatar">🤖</div>
              <div className="chat-msg-bubble">
                <div className="chat-typing-dots"><span /><span /><span /></div>
              </div>
            </div>
          )}
        </div>

        <div className="chat-page-input-area">
          <div className="chat-page-input-wrapper glass-card">
            <input
              className="chat-page-input"
              placeholder="Ask about zones, alerts, or trends..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send(input)}
              disabled={isTyping}
            />
            <button className="chat-page-send" onClick={() => send(input)} disabled={isTyping || !input.trim()}>
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
