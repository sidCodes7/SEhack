// ──────────────────────────────────────────────
// Copilot Context Builder
// ──────────────────────────────────────────────
// Builds structured context for Grok prompt by querying Neon PostgreSQL.
// ❌ NO RAG. NO Pinecone. NO LangChain. NO vector embeddings.
// Just deterministic DB queries.

import { db } from '../../shared/db/neon.client.js';
import { users, notices, workflowRequests, financeDues } from '../../shared/db/schema.js';
import { eq, desc } from 'drizzle-orm';

export interface CopilotContext {
  user: {
    name: string;
    role: string;
    department: string;
    karmaScore: number;
    preferredLanguage: string;
  };
  recentNotices: { title: string; content: string; createdAt: Date | null }[];
  pendingRequests: { id: string; type: string; status: string | null; currentStage: number | null; totalStages: number }[];
  financeDues: { type: string; amount: string; status: string | null }[];
}

/**
 * Fetch all relevant context for the copilot prompt.
 * Called before every Grok API call.
 */
export async function buildCopilotContext(userId: string): Promise<CopilotContext> {
  // 1. User profile
  const [user] = await db
    .select({
      name: users.name,
      role: users.role,
      department: users.department,
      karmaScore: users.karmaScore,
      preferredLanguage: users.preferredLanguage,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    throw new Error('User not found');
  }

  const department = user.department || 'general';

  // 2. Last 10 notices for the user's department
  const recentNotices = await db
    .select({
      title: notices.title,
      content: notices.content,
      createdAt: notices.createdAt,
    })
    .from(notices)
    .where(eq(notices.department, department))
    .orderBy(desc(notices.createdAt))
    .limit(10);

  // 3. User's pending workflow requests
  const pendingRequests = await db
    .select({
      id: workflowRequests.id,
      type: workflowRequests.type,
      status: workflowRequests.status,
      currentStage: workflowRequests.currentStage,
      totalStages: workflowRequests.totalStages,
    })
    .from(workflowRequests)
    .where(eq(workflowRequests.requesterId, userId));

  // 4. User's outstanding finance dues
  const outstandingDues = await db
    .select({
      type: financeDues.type,
      amount: financeDues.amount,
      status: financeDues.status,
    })
    .from(financeDues)
    .where(eq(financeDues.studentId, userId));

  return {
    user: {
      name: user.name,
      role: user.role,
      department,
      karmaScore: user.karmaScore ?? 0,
      preferredLanguage: user.preferredLanguage ?? 'en',
    },
    recentNotices,
    pendingRequests,
    financeDues: outstandingDues,
  };
}

/**
 * Format the context into a prompt-ready string block.
 */
export function formatContextForPrompt(ctx: CopilotContext): string {
  const noticesText = ctx.recentNotices.length > 0
    ? ctx.recentNotices.map((n) => `  - ${n.title}: ${n.content}`).join('\n')
    : '  No recent notices.';

  const requestsText = ctx.pendingRequests.length > 0
    ? ctx.pendingRequests.map((r) => `  - [${r.type}] Status: ${r.status}, Stage ${r.currentStage}/${r.totalStages}`).join('\n')
    : '  No pending requests.';

  const duesText = ctx.financeDues.length > 0
    ? ctx.financeDues.map((d) => `  - ${d.type}: ₹${d.amount} (${d.status})`).join('\n')
    : '  No outstanding dues.';

  return [
    `User: ${ctx.user.name} (${ctx.user.role}, ${ctx.user.department}), Karma: ${ctx.user.karmaScore}`,
    `Recent Notices:\n${noticesText}`,
    `Pending Requests:\n${requestsText}`,
    `Finance Dues:\n${duesText}`,
  ].join('\n\n');
}
