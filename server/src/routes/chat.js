import { Router } from 'express';
import { initSSE, sendSSE } from '../middleware/sse.js';

const router = Router();

const MOCK_SUGGESTIONS = [
  'What needs immediate attention?',
  'Which zones have anomalies right now?',
  'Explain the Mangrove Delta alert',
  'Why were some alerts suppressed?',
  'What is the thermal risk in Coral Bay?',
  'Show me cross-zone correlations',
  'What actions should I take today?',
  'How is the system learning from feedback?',
];

// ─── Mock streaming response (used when Grok API unavailable) ─────────────────
const MOCK_RESPONSES = {
  default: 'Based on current AquaSentinel analysis, **3 zones require immediate attention**:\n\n🔴 **#1: Lakshadweep Coral Reef** — Critical thermal spike detected. SST +1.8°C above 30-day baseline for 8 consecutive days. Degree Heating Weeks at 6.2. **Coral bleaching risk: HIGH.** Recommend immediate field team dispatch.\n\n🟠 **#2: Gujarat Mangrove Coast** — Harmful algal bloom developing. Chlorophyll-a at 3.2× baseline (0.45→1.44 mg/m³). Noctiluca scintillans signature detected with DO declining 0.3 mg/L/day.\n\n🟠 **#3: Kerala Upwelling Zone** — Dissolved oxygen declining 0.15 mg/L/day for 10 days. Current level 5.8 mg/L approaching hypoxic threshold (4.0 mg/L).\n\n📊 **System Status:** 8 total anomalies processed, 2 suppressed as noise (25% noise reduction), 6 active alerts.',
  thermal: '**Lakshadweep Coral Reef — Thermal Analysis:**\n\nSST has been elevated +1.8°C above the 30-day baseline for 8 consecutive days. The anomaly began on day 22 with a ramp rate of +0.3°C/day.\n\n**Key Metrics:**\n- Current SST: 30.3°C (baseline: 28.5°C)\n- Degree Heating Weeks: 6.2 (bleaching threshold: 4.0)\n- Confidence: 87%\n\n**Correlated Pattern:** Andaman Reef System showing similar SST trend with 3-day lag, suggesting large-scale oceanic warming event.\n\n**Recommended Actions:**\n1. Deploy buoy sensors for real-time monitoring\n2. Alert marine biologists for field assessment\n3. Prepare coral rescue protocol',
  suppressed: '**Noise Reduction Report:**\n\nThe AI triage agent has suppressed **2 alerts** this cycle, achieving **25% noise reduction**:\n\n1. **Goa Coastal Strip** (Score: 32, Confidence: 28%) — Chlorophyll oscillation between 0.5-1.2 mg/m³ matches natural monsoon pre-season pattern. No anthropogenic bloom signature.\n\n2. **Sri Lanka Southern Coast** (Score: 25, Confidence: 22%) — SST and wind speed variations within 2σ of normal weather pattern shifts.\n\nBoth were correctly classified as false positives based on historical baseline analysis.',
  correlation: '**Cross-Zone Correlations Detected:**\n\n1. **Z1 → Z5 (Lakshadweep → Andaman):** Thermal anomaly propagation with 3-day lag. Same oceanic warming pattern, suggesting basin-scale SST event. Confidence: 82%.\n\n2. **Z3 → Z4 (Kerala → Mumbai):** Upwelling-driven turbidity correlation with 6-hour lag. Kerala hypoxia event pushing sediment northward along Arabian Sea coast. Confidence: 67%.\n\nThese correlations strengthen the case for a coordinated multi-zone response.',
};

function getMockResponse(message) {
  if (/thermal|temperature|sst|bleach|coral/i.test(message)) return MOCK_RESPONSES.thermal;
  if (/suppress|noise|filter|false|triage/i.test(message)) return MOCK_RESPONSES.suppressed;
  if (/correlat|cross.zone|connect|link/i.test(message)) return MOCK_RESPONSES.correlation;
  return MOCK_RESPONSES.default;
}

async function streamMockResponse(res, message, zone_id) {
  const responseText = getMockResponse(message);
  const words = responseText.split(' ');
  for (let i = 0; i < words.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 30 + Math.random() * 40));
    if (res.writableEnded) return;
    sendSSE(res, 'token', { token: (i === 0 ? '' : ' ') + words[i] });
  }
  if (!res.writableEnded) {
    sendSSE(res, 'done', { tokens: words.length, timestamp: new Date().toISOString(), zone_id: zone_id || null });
    res.end();
  }
}

// ─── POST /api/chat/query ─────────────────────────────────────────────────────
router.post('/query', async (req, res, next) => {
  try {
    const { message = '', zone_id } = req.body;
    if (!message.trim()) {
      return res.status(400).json({ error: 'message is required' });
    }

    initSSE(res);

    let closed = false;
    req.on('close', () => { closed = true; });

    // Try real LLM first, fall back to mock on any error
    let usedRealLLM = false;
    try {
      const { queryBriefAgent } = await import('../agents/briefAgent.js');
      let tokenCount = 0;
      const generator = await queryBriefAgent(message, { zone_id });
      
      for await (const chunk of generator) {
        if (closed) break;
        // OpenAI streaming format: chunk.choices[0].delta.content
        const content = chunk.choices?.[0]?.delta?.content;
        if (content) {
          sendSSE(res, 'token', { token: content });
          tokenCount++;
          usedRealLLM = true;
        }
      }
      
      if (!closed && usedRealLLM) {
        sendSSE(res, 'done', { tokens: tokenCount, timestamp: new Date().toISOString(), zone_id: zone_id || null });
        res.end();
      }
    } catch (llmErr) {
      console.warn('[chat] LLM unavailable, using mock fallback:', llmErr.message);
    }

    // Fallback: if LLM didn't produce any output, stream mock
    if (!usedRealLLM && !closed && !res.writableEnded) {
      await streamMockResponse(res, message, zone_id);
    }
  } catch (err) { 
    console.error('[chat] Route error:', err);
    if (!res.headersSent) {
      next(err);
    }
  }
});

// ─── GET /api/chat/suggestions ────────────────────────────────────────────────
router.get('/suggestions', (_req, res) => {
  res.json(MOCK_SUGGESTIONS);
});

export default router;
