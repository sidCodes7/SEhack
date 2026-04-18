// ──────────────────────────────────────────────
// Copilot Routes — Express Router
// ──────────────────────────────────────────────

import { Router } from 'express';
import { copilotController } from './copilot.controller.js';

const router = Router();

// Send a message to the AI copilot
router.post('/chat', copilotController.chat);

// Get conversation history for the authenticated user
router.get('/session', copilotController.getSession);

// Fetch proactive alerts (deterministic DB queries, no Grok call)
router.post('/proactive', copilotController.getProactiveAlerts);

// List supported languages for translation
router.get('/languages', copilotController.getLanguages);

export default router;
