// ──────────────────────────────────────────────
// Karma Routes — Express Router
// ──────────────────────────────────────────────

import { Router } from 'express';
import { karmaController } from './karma.controller.js';

const router = Router();

// Get karma score + breakdown for the authenticated user
router.get('/score', karmaController.getScore);

// Top 10 leaderboard
router.get('/leaderboard', karmaController.getLeaderboard);

export default router;
