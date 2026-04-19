// ──────────────────────────────────────────────
// Copilot Controller — HTTP Layer Only
// Includes voice (STT) and TTS endpoints
// ──────────────────────────────────────────────

import type { Request, Response, NextFunction } from 'express';
import type { AuthRequest } from '../../shared/middleware/auth.middleware.js';
import * as copilotService from './copilot.service.js';
import { speechToText, textToSpeech } from './sarvam.service.js';
import { aiSummarize, aiAnalyzeIssue, aiRewrite } from './copilot.service.js';

export const copilotController = {
  /** POST /chat — Send a message to the copilot */
  chat: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { message } = req.body as { message: string };

      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        res.status(400).json({ success: false, error: 'message is required and must be a non-empty string' });
        return;
      }

      const result = await copilotService.chat(req.user!.id, message.trim());
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  /** GET /session — Get conversation history */
  getSession: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const session = await copilotService.getSession(req.user!.id);
      res.json({ success: true, data: session });
    } catch (error) {
      next(error);
    }
  },

  /** POST /proactive — Fetch deterministic proactive alerts (no Grok) */
  getProactiveAlerts: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const alerts = await copilotService.getProactiveAlerts(req.user!.id);
      res.json({ success: true, data: alerts });
    } catch (error) {
      next(error);
    }
  },

  /** GET /languages — List supported languages */
  getLanguages: async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const languages = copilotService.getSupportedLanguages();
      res.json({ success: true, data: languages });
    } catch (error) {
      next(error);
    }
  },

  /** POST /voice — Voice input: STT via Sarvam → Grok chat → response */
  voice: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const file = (req as any).file;
      const language = (req.body?.language as string) || 'en';

      if (!file) {
        res.status(400).json({ success: false, error: 'Audio file required (field: "file")' });
        return;
      }

      // 1. STT: Audio → Text via Sarvam
      let transcript: string;
      try {
        transcript = await speechToText(file.buffer, language);
      } catch (sttErr) {
        console.error('Sarvam STT error:', sttErr instanceof Error ? sttErr.message : '');
        // Fallback: return an error so the frontend can handle it
        res.status(502).json({ success: false, error: 'Failed to transcribe audio' });
        return;
      }

      if (!transcript || !transcript.trim()) {
        res.json({ success: true, data: { transcript: '', reply: 'I could not understand the audio. Please try again.' } });
        return;
      }

      // 2. Send transcript to Grok chat
      const chatResult = await copilotService.chat(req.user!.id, transcript);

      res.json({
        success: true,
        data: {
          transcript,
          reply: chatResult.reply,
          translatedReply: chatResult.translatedReply,
          sessionId: chatResult.sessionId,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /** POST /tts — Text-to-Speech via Sarvam */
  tts: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { text, language } = req.body as { text: string; language?: string };

      if (!text || !text.trim()) {
        res.status(400).json({ success: false, error: 'text is required' });
        return;
      }

      try {
        const audioBuffer = await textToSpeech(text, language || 'en');
        res.setHeader('Content-Type', 'audio/wav');
        res.setHeader('Content-Length', audioBuffer.length.toString());
        res.send(audioBuffer);
      } catch (ttsErr) {
        console.error('Sarvam TTS error:', ttsErr instanceof Error ? ttsErr.message : '');
        res.status(502).json({ success: false, error: 'Failed to synthesize speech' });
      }
    } catch (error) {
      next(error);
    }
  },

  /** POST /ai-summarize — Grok-powered text insight */
  summarize: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { text, context } = req.body as { text: string; context?: string };
      if (!text) { res.status(400).json({ success: false, error: 'text is required' }); return; }
      const result = await aiSummarize(text, context || 'campus');
      res.json({ success: true, data: { insight: result } });
    } catch (error) { next(error); }
  },

  /** POST /ai-analyze-issue — Grok auto-classifies issue */
  analyzeIssue: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { description } = req.body as { description: string };
      if (!description) { res.status(400).json({ success: false, error: 'description is required' }); return; }
      const result = await aiAnalyzeIssue(description);
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  },

  /** POST /ai-rewrite — Grok rewrites notice text */
  rewrite: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { text } = req.body as { text: string };
      if (!text) { res.status(400).json({ success: false, error: 'text is required' }); return; }
      const result = await aiRewrite(text);
      res.json({ success: true, data: { rewritten: result } });
    } catch (error) { next(error); }
  },
};
