// ──────────────────────────────────────────────
// Copilot / AI Types — @aether/shared-types
// ──────────────────────────────────────────────

export type CopilotMessageRole = 'user' | 'assistant' | 'system';

export interface CopilotMessage {
  role: CopilotMessageRole;
  content: string;
  timestamp: string;
  translatedContent?: string;
}

export interface CopilotSession {
  id: string;
  userId: string;
  messages: CopilotMessage[];
  contextSummary?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CopilotChatPayload {
  message: string;
  sessionId?: string;
}

export interface CopilotChatResponse {
  reply: string;
  translatedReply?: string;
  sessionId: string;
}

export interface ProactiveAlert {
  type: 'due_soon' | 'low_attendance' | 'pending_approval' | 'new_notice';
  title: string;
  message: string;
  actionUrl?: string;
  severity: 'info' | 'warning' | 'critical';
}
