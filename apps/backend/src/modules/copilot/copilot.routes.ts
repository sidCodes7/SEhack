// ──────────────────────────────────────────────
// Copilot Routes — Express Router
// Includes voice STT + TTS endpoints
// ──────────────────────────────────────────────

import { Router } from 'express';
import multer from 'multer';
import { copilotController } from './copilot.controller.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Send a message to the AI copilot
router.post('/chat', copilotController.chat);

// Get conversation history for the authenticated user
router.get('/session', copilotController.getSession);

// Fetch proactive alerts (deterministic DB queries, no Grok call)
router.post('/proactive', copilotController.getProactiveAlerts);

// List supported languages for translation
router.get('/languages', copilotController.getLanguages);

// Voice input: audio → Sarvam STT → Grok → response
router.post('/voice', upload.single('file'), copilotController.voice);

// Text-to-Speech: text → Sarvam TTS → audio
router.post('/tts', copilotController.tts);

// Grok AI: summarize any text for insights
router.post('/ai-summarize', copilotController.summarize);

// Grok AI: auto-classify campus issue
router.post('/ai-analyze-issue', copilotController.analyzeIssue);

// Grok AI: rewrite notice text
router.post('/ai-rewrite', copilotController.rewrite);

export default router;
