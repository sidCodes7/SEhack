import { useCallback } from 'react';
import { copilotService } from '../services/copilot.service';
import { useCopilotStore } from '../store/copilot.store';

export function useCopilot() {
  const { messages, isLoading, language, proactiveAlerts, addMessage, setLoading, setLanguage, setProactiveAlerts } = useCopilotStore();

  const sendMessage = useCallback(async (text: string) => {
    const userMsg = {
      id: Date.now().toString(),
      role: 'user' as const,
      text,
      timestamp: Date.now(),
    };
    addMessage(userMsg);
    setLoading(true);

    try {
      const response = await copilotService.sendMessage(text, language);
      const botMsg = {
        id: (Date.now() + 1).toString(),
        role: 'bot' as const,
        text: response.reply || response.message || 'I understand.',
        source: response.source,
        actionLabel: response.actionLabel,
        actionRoute: response.actionRoute,
        timestamp: Date.now(),
      };
      addMessage(botMsg);
    } catch {
      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: 'Sorry, I had trouble connecting. Please try again.',
        timestamp: Date.now(),
      });
    } finally {
      setLoading(false);
    }
  }, [language, addMessage, setLoading]);

  const fetchAlerts = useCallback(async () => {
    try {
      const alerts = await copilotService.getProactiveAlerts();
      setProactiveAlerts(alerts);
    } catch {
      // Silently fail for proactive alerts
    }
  }, [setProactiveAlerts]);

  return { messages, isLoading, language, proactiveAlerts, sendMessage, fetchAlerts, setLanguage };
}
