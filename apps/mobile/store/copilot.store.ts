import { create } from 'zustand';

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  source?: string;
  actionLabel?: string;
  actionRoute?: string;
  timestamp: number;
}

interface ProactiveAlert {
  id: string;
  title: string;
  subtitle: string;
  route?: string;
}

interface CopilotStore {
  messages: Message[];
  isLoading: boolean;
  language: string;
  proactiveAlerts: ProactiveAlert[];
  addMessage: (msg: Message) => void;
  setLoading: (val: boolean) => void;
  setLanguage: (lang: string) => void;
  setProactiveAlerts: (alerts: ProactiveAlert[]) => void;
  clearMessages: () => void;
}

export const useCopilotStore = create<CopilotStore>((set) => ({
  messages: [],
  isLoading: false,
  language: 'en',
  proactiveAlerts: [],
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  setLoading: (val) => set({ isLoading: val }),
  setLanguage: (lang) => set({ language: lang }),
  setProactiveAlerts: (alerts) => set({ proactiveAlerts: alerts }),
  clearMessages: () => set({ messages: [] }),
}));
