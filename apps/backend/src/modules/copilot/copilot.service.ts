// ──────────────────────────────────────────────
// Copilot Service — AI Chat via Direct Grok API
// ──────────────────────────────────────────────
// ❌ NO RAG pipeline. NO Pinecone. NO LangChain. NO vector embeddings.
// ✅ Direct Grok API call with DB-sourced context.

import axios from 'axios';
import { db } from '../../shared/db/neon.client.js';
import {
  copilotSessions,
  workflowRequests,
  financeDues,
  calendarEvents,
} from '../../shared/db/schema.js';
import { eq, and, sql, desc } from 'drizzle-orm';
import { buildCopilotContext, formatContextForPrompt } from './context-builder.js';
import { translate } from './translation.service.js';
import { createError } from '../../shared/middleware/error.middleware.js';
import { SPIT_KNOWLEDGE_BASE, retrieveRelevantChunks } from './spit-knowledge-base.js';

type SupportedLanguage = 'en' | 'hi' | 'ta' | 'mr' | 'te';

interface CopilotMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  translatedContent?: string;
}

interface ProactiveAlert {
  type: 'due_soon' | 'low_attendance' | 'pending_approval' | 'new_notice';
  title: string;
  message: string;
  actionUrl?: string;
  severity: 'info' | 'warning' | 'critical';
}

const XAI_API_KEY = process.env.XAI_API_KEY;
const XAI_API_URL = 'https://api.x.ai/v1/chat/completions';
const GROK_MODEL = process.env.GROK_MODEL || 'grok-3-mini';

const SUPPORTED_LANGUAGES: { code: SupportedLanguage; name: string }[] = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ta', name: 'Tamil' },
  { code: 'mr', name: 'Marathi' },
  { code: 'te', name: 'Telugu' },
];

// ── Chat ───────────────────────────────────────

export async function chat(userId: string, message: string) {
  if (!XAI_API_KEY) {
    throw createError('Grok API key not configured (XAI_API_KEY)', 500);
  }

  // 1. Build context from DB
  const context = await buildCopilotContext(userId);
  const contextBlock = formatContextForPrompt(context);

  // 2. Get or create session (fetch last messages for conversation continuity)
  let session = await getOrCreateSession(userId);
  const previousMessages = (session.messages as CopilotMessage[]) || [];

  // 3. RAG-style retrieval: find relevant knowledge chunks
  const relevantChunks = retrieveRelevantChunks(message, 3);
  const ragContext = relevantChunks.length > 0
    ? `\n\nRetrieved Knowledge (RAG):\n${relevantChunks.map(c => `  - ${c}`).join('\n')}`
    : '';

  // 4. Compose Grok prompt with institutional knowledge
  const systemPrompt = [
    'You are Aether Copilot, the AI assistant for SPIT (Sardar Patel Institute of Technology).',
    'You help students, professors, and staff with campus-related questions.',
    'Answer concisely and accurately using the knowledge base below.',
    'When answering about SPIT policies, exams, attendance, fees, or calendar — ALWAYS use the institutional data provided.',
    'Provide 2-3 actionable next steps when appropriate.',
    '',
    'Student Context:',
    contextBlock,
    ragContext,
    '',
    SPIT_KNOWLEDGE_BASE,
  ].join('\n');

  // Build messages array for Grok (last 10 messages for context window)
  const grokMessages = [
    { role: 'system' as const, content: systemPrompt },
    ...previousMessages.slice(-10).map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user' as const, content: message },
  ];

  // 4. Call Grok API
  let grokReply: string;
  try {
    const response = await axios.post(
      XAI_API_URL,
      {
        model: GROK_MODEL,
        messages: grokMessages,
        temperature: 0.7,
        max_tokens: 1024,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${XAI_API_KEY}`,
        },
        timeout: 30000, // 30s timeout for LLM
      }
    );

    grokReply = response.data?.choices?.[0]?.message?.content || 'I could not generate a response. Please try again.';
  } catch (error) {
    console.error('Grok API error:', error instanceof Error ? error.message : '');
    throw createError('Failed to get response from AI assistant', 502);
  }

  // 5. Translate if needed (AFTER Grok responds)
  let translatedReply: string | undefined;
  const preferredLang = context.user.preferredLanguage as SupportedLanguage;
  if (preferredLang !== 'en') {
    translatedReply = await translate(grokReply, preferredLang);
  }

  // 6. Append to session in DB
  const now = new Date().toISOString();
  const newMessages: CopilotMessage[] = [
    ...previousMessages,
    { role: 'user', content: message, timestamp: now },
    {
      role: 'assistant',
      content: grokReply,
      timestamp: now,
      ...(translatedReply ? { translatedContent: translatedReply } : {}),
    },
  ];

  await db
    .update(copilotSessions)
    .set({
      messages: newMessages,
      updatedAt: sql`NOW()`,
    })
    .where(eq(copilotSessions.id, session.id));

  return {
    reply: grokReply,
    translatedReply,
    sessionId: session.id,
  };
}

// ── Session Management ─────────────────────────

async function getOrCreateSession(userId: string) {
  // Try to find an existing session for this user
  const [existing] = await db
    .select()
    .from(copilotSessions)
    .where(eq(copilotSessions.userId, userId))
    .orderBy(desc(copilotSessions.updatedAt))
    .limit(1);

  if (existing) {
    return existing;
  }

  // Create a new session
  const [newSession] = await db
    .insert(copilotSessions)
    .values({
      userId,
      messages: [],
    })
    .returning();

  return newSession;
}

export async function getSession(userId: string) {
  const [session] = await db
    .select()
    .from(copilotSessions)
    .where(eq(copilotSessions.userId, userId))
    .orderBy(desc(copilotSessions.updatedAt))
    .limit(1);

  if (!session) {
    return { messages: [], sessionId: null };
  }

  return {
    messages: session.messages as CopilotMessage[],
    sessionId: session.id,
  };
}

// ── Proactive Alerts ───────────────────────────
// Deterministic DB queries ONLY. No Grok call.

export async function getProactiveAlerts(userId: string): Promise<ProactiveAlert[]> {
  const alerts: ProactiveAlert[] = [];

  // 1. Check pending workflow requests
  const pendingRequests = await db
    .select({ id: workflowRequests.id, type: workflowRequests.type })
    .from(workflowRequests)
    .where(
      and(
        eq(workflowRequests.requesterId, userId),
        eq(workflowRequests.status, 'pending')
      )
    );

  if (pendingRequests.length > 0) {
    alerts.push({
      type: 'pending_approval',
      title: 'Pending Approvals',
      message: `You have ${pendingRequests.length} request(s) awaiting approval.`,
      actionUrl: '/bookings/status',
      severity: 'info',
    });
  }

  // 2. Check pending finance dues
  const pendingDues = await db
    .select({ type: financeDues.type, amount: financeDues.amount })
    .from(financeDues)
    .where(
      and(
        eq(financeDues.studentId, userId),
        eq(financeDues.status, 'pending')
      )
    );

  if (pendingDues.length > 0) {
    const totalDue = pendingDues.reduce((sum, d) => sum + parseFloat(d.amount), 0);
    alerts.push({
      type: 'due_soon',
      title: 'Outstanding Dues',
      message: `You have ₹${totalDue.toFixed(2)} in pending dues across ${pendingDues.length} item(s).`,
      actionUrl: '/finance',
      severity: totalDue > 5000 ? 'critical' : 'warning',
    });
  }

  // 3. Check upcoming calendar events (within 2 days)
  const upcomingEvents = await db
    .select({ title: calendarEvents.title, startTime: calendarEvents.startTime })
    .from(calendarEvents)
    .where(
      and(
        eq(calendarEvents.organizerId, userId),
        sql`${calendarEvents.startTime} < NOW() + INTERVAL '2 days'`,
        sql`${calendarEvents.startTime} > NOW()`
      )
    );

  if (upcomingEvents.length > 0) {
    alerts.push({
      type: 'due_soon',
      title: 'Upcoming Events',
      message: `You have ${upcomingEvents.length} event(s) in the next 48 hours.`,
      actionUrl: '/calendar',
      severity: 'info',
    });
  }

  return alerts;
}

// ── Languages ──────────────────────────────────

export function getSupportedLanguages() {
  return SUPPORTED_LANGUAGES;
}

// ── AI Summarize (used by PYQ, Finance, Issues) ──

export async function aiSummarize(text: string, context: string = 'campus') {
  if (!XAI_API_KEY) throw createError('Grok API key not configured', 500);
  const response = await axios.post(XAI_API_URL, {
    model: GROK_MODEL,
    messages: [
      { role: 'system', content: `You are a helpful campus AI. Generate a brief, actionable insight (2-3 sentences max) about the following ${context}. Be specific and practical.` },
      { role: 'user', content: text },
    ],
    temperature: 0.6, max_tokens: 256,
  }, { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${XAI_API_KEY}` }, timeout: 15000 });
  return response.data?.choices?.[0]?.message?.content || 'Unable to generate insight.';
}

// ── AI Analyze Issue ─────────────────────────

export async function aiAnalyzeIssue(description: string) {
  if (!XAI_API_KEY) throw createError('Grok API key not configured', 500);
  const response = await axios.post(XAI_API_URL, {
    model: GROK_MODEL,
    messages: [
      { role: 'system', content: 'You are a campus facility management AI. Given an issue description, classify it. Return ONLY valid JSON: {"priority":"P1"|"P2"|"P3","category":"infrastructure"|"electrical"|"plumbing"|"IT"|"safety"|"other","suggestedFix":"brief suggestion","severity":"critical"|"high"|"medium"|"low"}' },
      { role: 'user', content: description },
    ],
    temperature: 0.3, max_tokens: 200,
  }, { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${XAI_API_KEY}` }, timeout: 15000 });
  const raw = response.data?.choices?.[0]?.message?.content || '{}';
  try { const m = raw.match(/\{[\s\S]*\}/); return m ? JSON.parse(m[0]) : { priority: 'P2', category: 'other', suggestedFix: raw, severity: 'medium' }; }
  catch { return { priority: 'P2', category: 'other', suggestedFix: raw, severity: 'medium' }; }
}

// ── AI Rewrite (used by NoticePublisher) ─────

export async function aiRewrite(text: string) {
  if (!XAI_API_KEY) throw createError('Grok API key not configured', 500);
  const response = await axios.post(XAI_API_URL, {
    model: GROK_MODEL,
    messages: [
      { role: 'system', content: 'You are a professional academic communicator. Rewrite the following notice to be clearer, more professional, and well-structured. Keep it concise. Return ONLY the rewritten text.' },
      { role: 'user', content: text },
    ],
    temperature: 0.5, max_tokens: 512,
  }, { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${XAI_API_KEY}` }, timeout: 15000 });
  return response.data?.choices?.[0]?.message?.content || text;
}
