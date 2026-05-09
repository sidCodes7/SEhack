import { useState, useCallback, useRef } from 'react';

// ═══════════════════════════════════════════════════════
// AquaSentinel — Smart Dummy Chat Responses
// Matches user input to topic-specific responses
// with realistic AI-generated marine intelligence
// ═══════════════════════════════════════════════════════

const TOPIC_RESPONSES = {
  // ── Zone-specific ──
  zones: [
    `**Zone Status Overview — ${new Date().toLocaleDateString()}**\n\n🪸 **Lakshadweep Coral Reef** — SST +1.8°C above baseline for 8 days. Coral bleaching risk remains **HIGH**. DHW: 6.2°C-weeks.\n\n🦠 **Gujarat Mangrove Coast** — Chlorophyll-a at 4.2 mg/m³ (4.7× baseline). HAB probability: 72%. Noctiluca bloom pattern detected.\n\n💀 **Kerala Upwelling Zone** — DO at 3.2 mg/L and declining (-0.3/day). Hypoxia threshold breach in ~3 days if trend continues.\n\n🌊 **Mumbai Offshore** — Turbidity elevated at 12.4 NTU post-rainfall. No immediate biological threat.\n\n✅ **Andaman, Sundarbans, Goa, Sri Lanka** — Within normal parameters.`,
    `**Current Zone Health Matrix:**\n\n| Zone | Status | Key Metric | Trend |\n|------|--------|-----------|-------|\n| Z1 Lakshadweep | 🔴 Critical | SST +1.8°C | ↑ Rising |\n| Z2 Gujarat | 🟠 Warning | Chl-a 4.2× | ↑ Rising |\n| Z3 Kerala | 🟠 Warning | DO 3.2 mg/L | ↓ Falling |\n| Z4 Mumbai | 🟡 Watch | Turbidity 12.4 | → Stable |\n| Z5 Andaman | 🟡 Watch | SST +0.7°C | ↑ Slow rise |\n| Z6-Z8 | 🟢 Normal | All metrics | → Stable |\n\nRecommendation: Focus monitoring resources on **Z1** and **Z3** — both approaching critical action thresholds.`,
  ],

  // ── Alerts ──
  alerts: [
    `**Active Alert Summary:**\n\nCurrently tracking **5 active alerts** across the Indian Ocean monitoring network:\n\n🚨 **2 CRITICAL** — Lakshadweep thermal event (87% confidence) and Gujarat HAB (72%)\n⚠️ **1 WARNING** — Kerala hypoxia developing\n👁️ **2 WATCH** — Mumbai turbidity, Andaman thermal drift\n\nOf the last 52 readings processed:\n- 47 were **suppressed as noise** (71% noise rate)\n- 5 were **escalated** for human review\n- Multi-agent triage has maintained a 94% accuracy rate\n\nWould you like me to generate a detailed brief for any specific alert?`,
    `**Alert Trend Analysis (7-day):**\n\nThe pipeline has processed **364 sensor readings** this week across 8 zones.\n\n📊 **Detection breakdown:**\n- Thermal anomalies: 12 detected, 3 escalated\n- HAB indicators: 8 detected, 2 escalated\n- Hypoxia events: 5 detected, 1 escalated\n- Noise suppressed: 291 readings (80%)\n\n📈 **Trend:** Alert volume is up 23% vs. last week, primarily driven by pre-monsoon warming. The learning agent has increased sensitivity for Z1 and Z3 while decreasing Z4 sensitivity (too many false positives from tidal effects).`,
  ],

  // ── Correlations ──
  correlations: [
    `**Cross-Zone Correlation Report:**\n\n🔗 **Active correlations detected:** 3\n\n1. **Lakshadweep ↔ Andaman** (88% match)\n   Mechanism: Indian Ocean Dipole thermal propagation\n   Temporal lag: 3 days\n   Both zones showing synchronized SST increase\n\n2. **Kerala ↔ Gujarat** (72% match)\n   Mechanism: Upwelling-driven nutrient transport\n   The Kerala hypoxia event may be feeding nutrients northward\n\n3. **Gujarat ↔ Mumbai** (55% match)\n   Mechanism: Longshore current transport\n   HAB bloom may spread south if currents shift\n\nThe knowledge graph currently tracks **47 historical correlations** between these zones, with IOD-related thermal events being the most common pattern.`,
  ],

  // ── Trends ──
  trends: [
    `**Weekly Trend Analysis:**\n\n📈 **Sea Surface Temperature:**\nAll Arabian Sea zones showing +0.3 to +1.8°C anomaly. This is consistent with the developing positive Indian Ocean Dipole phase. Historical data shows similar patterns preceded the 2024 bleaching event by ~3 weeks.\n\n📉 **Dissolved Oxygen:**\nKerala upwelling zone shows the most concerning decline: -0.3 mg/L/day for the past 7 days. At this rate, DO will breach the 2.0 mg/L critical threshold by Friday.\n\n📊 **Chlorophyll-a:**\nGujarat coast experiencing a Noctiluca bloom — chlorophyll at 4.7× baseline and accelerating. Satellite imagery confirms a 45 km² bloom extent.\n\n🌊 **Salinity & Turbidity:**\nPost-rainfall turbidity spike in Mumbai resolving. Bay of Bengal zones showing normal seasonal variation.`,
  ],

  // ── Suppressed ──
  suppressed: [
    `**Suppressed Alert Analysis:**\n\nIn the last 24h, the triage agent suppressed **47 readings** as noise. Here's the breakdown:\n\n🔇 **Tidal interference:** 18 (38%)\nThese were periodic signals matching known tidal cycles (r² > 0.7 with tide tables).\n\n🔇 **Seasonal baseline shift:** 14 (30%)\nReadings fell within expected pre-monsoon variability (±2σ).\n\n🔇 **Sensor calibration drift:** 8 (17%)\nSingle-sensor readings without corroboration from adjacent sensors.\n\n🔇 **Known false-positive patterns:** 7 (15%)\nHistorical operator feedback trained the learning agent to suppress these.\n\nThe noise suppression rate has improved from 65% to 71% over the past week thanks to the learning agent's sensitivity adjustments.`,
  ],

  // ── Help/capabilities ──
  help: [
    `**🌊 AquaSentinel AI Assistant**\n\nI can help you with:\n\n📍 **Zone Analysis** — Ask about any specific zone's status, readings, or trends\n🚨 **Alert Management** — View active alerts, suppressed noise, or escalation history\n🔗 **Correlations** — Cross-zone pattern analysis and knowledge graph insights\n📊 **Trends** — Weekly/monthly metric trends across all monitoring zones\n⚖️ **Triage Decisions** — Understand why alerts were escalated or suppressed\n📋 **Briefings** — Generate intelligence briefs for specific events\n🧠 **Learning** — Check how sensitivity thresholds have adapted\n\n**Try asking:**\n- "What zones need attention?"\n- "Explain the Kerala hypoxia event"\n- "Why was alert #3 suppressed?"\n- "Show correlation between Lakshadweep and Andaman"\n- "Weekly SST trend report"`,
  ],

  // ── Default/greeting ──
  default: [
    `Based on current analysis, **3 zones require immediate attention:**\n\n**#1: Lakshadweep Coral Reef** 🪸\nThermal stress is CRITICAL (87% confidence). SST anomaly of +1.8°C has persisted for 8 days. DHW approaching 6.2°C-weeks. Action: Deploy field monitoring team and increase sensor polling to 5-minute intervals.\n\n**#2: Kerala Upwelling Zone** 💀\nHypoxia WARNING (68% confidence). Dissolved oxygen at 3.2 mg/L and declining. Fishing advisory recommended within 24h.\n\n**#3: Gujarat Mangrove Coast** 🦠\nHAB WARNING (72% confidence). Chlorophyll-a at 4.7× baseline. Noctiluca bloom likely. Toxin sampling recommended.\n\nAll other zones are within normal operational parameters.`,
    `The multi-agent pipeline completed its latest cycle:\n\n📡 **Ingested:** 8 zone readings from ISRO OceanSat-3, INCOIS buoys, and Argo floats\n🔍 **Detected:** 4 anomalies (2 thermal, 1 HAB, 1 hypoxia)\n🔗 **Correlated:** 2 cross-zone patterns identified\n⚖️ **Triaged:** 3 suppressed as noise, 1 escalated\n📋 **Briefed:** 1 intelligence report generated for Z1\n📧 **Dispatched:** Critical alert queued for operator approval\n🧠 **Learned:** Z3 sensitivity increased to 1.1 (catching more hypoxia events)\n\nOverall system health: **GOOD**. False positive rate: 71%.`,
    `Good question! Here's what I'm seeing across the network:\n\n🌡️ **Temperature Alert** — The Indian Ocean is experiencing a thermal anomaly consistent with early-stage positive IOD. Historically, similar SST patterns have preceded major coral bleaching events by 2-4 weeks.\n\n🦠 **Biological Activity** — Chlorophyll levels elevated in 3 of 8 zones, suggesting increased primary productivity. This could be natural upwelling or early HAB formation — the detection agent is monitoring spectral signatures to differentiate.\n\n📉 **Oxygen Decline** — Bottom-water DO is declining in the Kerala upwelling zone. The correlation agent has linked this to the same pattern that caused a fish kill event in 2024.\n\nRecommend reviewing the **Triage** agent for pending debate cases and the **Dispatch** queue for any emails awaiting your approval.`,
  ],
};

// ── Topic matching ──
function matchTopic(text) {
  const lower = text.toLowerCase();

  if (lower.match(/zone|status|lakshadweep|kerala|gujarat|mumbai|andaman|goa|sundarbans|sri lanka/))
    return 'zones';
  if (lower.match(/alert|critical|warning|escalat|suppress|noise|flag/))
    return 'alerts';
  if (lower.match(/correlat|cross.?zone|pattern|relationship|link|connection/))
    return 'correlations';
  if (lower.match(/trend|weekly|monthly|history|over time|trajectory|forecast|predict/))
    return 'trends';
  if (lower.match(/suppress|noise|false.?positive|filter|why.*suppress|ignored/))
    return 'suppressed';
  if (lower.match(/help|what can you|capabilities|how to|guide|tutorial/))
    return 'help';

  return 'default';
}

// Track used indices to avoid repeating
const usedIndices = {};

function getRotatingResponse(topic) {
  const responses = TOPIC_RESPONSES[topic] || TOPIC_RESPONSES.default;
  if (!usedIndices[topic]) usedIndices[topic] = 0;
  const idx = usedIndices[topic] % responses.length;
  usedIndices[topic]++;
  return responses[idx];
}

export default function useChat() {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const abortRef = useRef(null);

  const sendMessage = useCallback(async (text, zoneId = null) => {
    if (!text.trim() || isTyping) return;

    // Add user message
    const userMsg = { role: 'user', content: text.trim(), ts: Date.now() };
    setMessages(prev => [...prev, userMsg]);

    // Add empty AI message
    const aiMsgId = Date.now();
    setMessages(prev => [...prev, { role: 'ai', content: '', typing: true, id: aiMsgId }]);
    setIsTyping(true);

    // Match topic and get response
    const topic = matchTopic(text);
    const response = getRotatingResponse(topic);

    // Simulate typing with character-by-character reveal
    let i = 0;
    const speed = Math.max(5, Math.min(15, 2000 / response.length)); // adaptive speed
    const interval = setInterval(() => {
      i += Math.floor(1 + Math.random() * 2); // 1-3 chars at a time for natural feel
      if (i >= response.length) {
        i = response.length;
        clearInterval(interval);
        setMessages(prev => prev.map(m =>
          m.id === aiMsgId ? { ...m, content: response, typing: false } : m
        ));
        setIsTyping(false);
      } else {
        setMessages(prev => prev.map(m =>
          m.id === aiMsgId ? { ...m, content: response.slice(0, i), typing: true } : m
        ));
      }
    }, speed);

    abortRef.current = { abort: () => { clearInterval(interval); setIsTyping(false); } };
  }, [isTyping]);

  const cancelStream = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    setIsTyping(false);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return { messages, isTyping, sendMessage, cancelStream, clearMessages };
}
