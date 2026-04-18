// ──────────────────────────────────────────────
// Calendar Routes — Express Router
// ──────────────────────────────────────────────

import { Router } from 'express';
import { calendarController } from './calendar.controller.js';

const router = Router();

// List events for the authenticated user
router.get('/events', calendarController.getEvents);

// List rooms / get room availability
router.get('/rooms', calendarController.getRooms);

// Book a room (runs clash detection first)
router.post('/book', calendarController.bookRoom);

// Check for clashes without booking
router.get('/clash-check', calendarController.checkClash);

// Get smart slot suggestions for a room on a given date
router.get('/suggestions', calendarController.getSuggestions);

export default router;
