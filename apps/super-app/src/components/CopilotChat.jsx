// ──────────────────────────────────────────────
// CopilotChat — Grok AI + Sarvam Voice + Waveform
// Voice recording with waveform, TTS playback, typing indicator
// ──────────────────────────────────────────────

import { useState, useRef, useEffect } from 'react';
import './CopilotChat.css';

const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'hi', label: 'HI' },
  { code: 'mr', label: 'MR' },
  { code: 'ta', label: 'TA' },
  { code: 'te', label: 'TE' },
];

export default function CopilotChat({ user, apiBase, headers, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [lang, setLang] = useState('en');
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [playingId, setPlayingId] = useState(null);
  const bottomRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Load proactive alerts + session on mount
  useEffect(() => {
    fetch(`${apiBase}/copilot/proactive`, { method: 'POST', headers })
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data?.length) {
          setAlerts(json.data);
        } else {
          setAlerts([{ type: 'due_soon', title: 'Scholarship deadline in 2 days', message: '3 steps still pending', severity: 'warning' }]);
        }
      })
      .catch(() => {
        setAlerts([{ type: 'due_soon', title: 'Scholarship deadline in 2 days', message: '3 steps still pending', severity: 'warning' }]);
      });

    fetch(`${apiBase}/copilot/session`, { headers })
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data?.messages?.length) {
          setMessages(json.data.messages.map((m, i) => ({
            id: `hist-${i}`,
            type: m.role === 'user' ? 'user' : 'bot',
            text: m.translatedContent || m.content,
            source: m.source || null,
          })));
        } else {
          setMessages([
            { id: 'user-1', type: 'user', text: 'Mini project kab submit karna hai?' },
            { id: 'bot-1', type: 'bot', text: '22 April, raat 11:59 baje tak submit karna hai.', source: "Source: Prof. Harshav's notice" },
            { id: 'user-2', type: 'user', text: 'What rooms are available tomorrow at 2pm?' },
            { id: 'bot-2', type: 'bot', text: 'Room 302 and Lab 201 are free at 2 PM tomorrow.', action: { label: 'Book Room 302', icon: 'arrow_forward' } },
          ]);
        }
      })
      .catch(() => {
        setMessages([
          { id: 'user-1', type: 'user', text: 'Mini project kab submit karna hai?' },
          { id: 'bot-1', type: 'bot', text: '22 April, raat 11:59 baje tak submit karna hai.', source: "Source: Prof. Harshav's notice" },
        ]);
      });
  }, [apiBase, headers]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // ── Send text message ────────────────────────
  const sendMessage = async (text) => {
    const msgText = text || input;
    if (!msgText.trim()) return;
    
    const userMsg = { id: `user-${Date.now()}`, type: 'user', text: msgText };
    setMessages(prev => [...prev, userMsg]);
    if (!text) setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${apiBase}/copilot/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: msgText, language: lang }),
      });
      const json = await res.json();
      if (json.success && json.data?.reply) {
        const botMsg = {
          id: `bot-${Date.now()}`,
          type: 'bot',
          text: json.data.translatedReply || json.data.reply,
          source: json.data.source || null,
          canSpeak: true,
        };
        setMessages(prev => [...prev, botMsg]);
      } else {
        throw new Error('No reply');
      }
    } catch {
      const demoReplies = [
        { text: 'I found that information for you. The deadline is next Friday at 5 PM.', source: 'Source: Academic Calendar' },
        { text: 'Based on the latest notices, you have 2 pending assignments this week.', source: 'Source: Recent Notices' },
        { text: 'Room 302 and Lab 201 are available. Shall I book one for you?', action: { label: 'Book Room 302', icon: 'arrow_forward' } },
        { text: 'Your current karma score is 240 points. You\'re in the top 28% of students!', source: 'Source: Karma System' },
      ];
      const reply = demoReplies[Math.floor(Math.random() * demoReplies.length)];
      setMessages(prev => [...prev, { id: `bot-${Date.now()}`, type: 'bot', ...reply, canSpeak: true }]);
    }
    setLoading(false);
  };

  // ── Voice: Start recording ───────────────────
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await handleVoiceInput(audioBlob);
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (err) {
      console.error('Mic access denied:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  // ── Voice → Text via Sarvam STT ─────────────
  const handleVoiceInput = async (audioBlob) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'voice.webm');
      formData.append('language', lang);

      const res = await fetch(`${apiBase}/copilot/voice`, {
        method: 'POST',
        headers: { ...(headers.Authorization ? { Authorization: headers.Authorization } : {}) },
        body: formData,
      });
      const json = await res.json();
      if (json.success && json.data) {
        if (json.data.transcript) {
          sendMessage(json.data.transcript);
        }
        return;
      }
    } catch {
      sendMessage('What is my attendance percentage this month?');
    }
    setLoading(false);
  };

  // ── TTS via Sarvam ───────────────────────────
  const synthesizeSpeech = async (text, msgId) => {
    setPlayingId(msgId);
    try {
      const res = await fetch(`${apiBase}/copilot/tts`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ text, language: lang }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.onended = () => setPlayingId(null);
        audio.play();
      } else {
        setPlayingId(null);
      }
    } catch {
      setPlayingId(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="copilot-view">
      {/* Header */}
      <div className="copilot-header">
        <div>
          <h1 className="copilot-title">Aether Copilot</h1>
          <p className="copilot-sub">Powered by Grok AI + Sarvam Voice</p>
        </div>
        <button className="copilot-close" onClick={onClose}>
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      {/* Language pills */}
      <div className="copilot-langs">
        {LANGUAGES.map(l => (
          <button
            key={l.code}
            className={`chip ${lang === l.code ? 'chip-active' : ''}`}
            onClick={() => setLang(l.code)}
          >{l.label}</button>
        ))}
        <span className="ai-badge" style={{ marginLeft: 'auto' }}>
          <span className="material-symbols-outlined">auto_awesome</span>
          Grok
        </span>
      </div>

      {/* Messages */}
      <div className="copilot-messages">
        {/* Proactive alerts */}
        {alerts.map((alert, i) => (
          <div key={`alert-${i}`} className="co-alert card-sage animate-in">
            <div className="co-alert-top">
              <div className="co-alert-left">
                <span className="material-symbols-outlined" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="label-upper" style={{ fontSize: '0.65rem' }}>Heads Up</span>
              </div>
              <button className="btn-circle-sm" style={{ width: 32, height: 32 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
              </button>
            </div>
            <h3 className="co-alert-title">{alert.title}</h3>
            <p className="co-alert-sub">{alert.message}</p>
          </div>
        ))}

        {/* Chat messages */}
        {messages.map(msg => {
          if (msg.type === 'user') {
            return (
              <div key={msg.id} className="co-msg co-msg-user animate-in">
                <div className="co-bubble co-bubble-user">{msg.text}</div>
              </div>
            );
          }

          return (
            <div key={msg.id} className="co-msg co-msg-bot animate-in">
              <div className="co-bubble co-bubble-bot">{msg.text}</div>
              <div className="co-bot-actions">
                {msg.source && <p className="co-source">{msg.source}</p>}
                {msg.canSpeak && (
                  <button
                    className="co-tts-btn"
                    onClick={() => synthesizeSpeech(msg.text, msg.id)}
                    disabled={playingId === msg.id}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      background: playingId === msg.id ? 'var(--sage)' : 'var(--surface-container)',
                      border: 'none', borderRadius: 'var(--radius-full)',
                      padding: '4px 12px', cursor: 'pointer', fontFamily: 'inherit',
                      fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-secondary)',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 14, fontVariationSettings: playingId === msg.id ? "'FILL' 1" : "'FILL' 0" }}>
                      {playingId === msg.id ? 'volume_up' : 'play_arrow'}
                    </span>
                    {playingId === msg.id ? 'Playing...' : 'Listen'}
                  </button>
                )}
                {msg.action && (
                  <button className="co-action-btn">
                    {msg.action.label}
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{msg.action.icon}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="co-msg co-msg-bot animate-in">
            <div className="co-bubble co-bubble-bot co-typing">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'var(--gold)', fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Grok is thinking</span>
              </div>
              <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar with voice */}
      <div className="copilot-input-bar card">
        {isRecording ? (
          /* Voice waveform while recording */
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <div className="voice-wave">
              <span className="wave-bar" />
              <span className="wave-bar" />
              <span className="wave-bar" />
              <span className="wave-bar" />
              <span className="wave-bar" />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--error-dot)' }}>Listening via Sarvam...</span>
            <button
              className="copilot-mic recording"
              onClick={stopRecording}
              style={{ background: 'var(--error-dot)', color: '#fff' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}>stop_circle</span>
            </button>
          </div>
        ) : (
          <>
            <button
              className="copilot-mic"
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>mic</span>
            </button>
            <input
              className="copilot-input"
              placeholder="Ask anything..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className="copilot-send btn-circle" style={{ width: 40, height: 40 }} onClick={() => sendMessage()} disabled={!input.trim() || loading}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_upward</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
