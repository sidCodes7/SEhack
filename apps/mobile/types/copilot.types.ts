export interface CopilotMessage {
  id: string;
  role: 'user' | 'bot';
  text: string;
  source?: string;
  actionLabel?: string;
  actionRoute?: string;
  timestamp: number;
}

export interface ProactiveAlert {
  id: string;
  title: string;
  subtitle: string;
  route?: string;
  icon?: string;
}

export interface CopilotSession {
  id: string;
  messages: CopilotMessage[];
  language: string;
  createdAt: string;
}
