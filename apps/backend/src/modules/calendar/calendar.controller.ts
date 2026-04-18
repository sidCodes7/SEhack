// ──────────────────────────────────────────────
// Calendar Controller — HTTP Layer Only
// ──────────────────────────────────────────────

import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../../shared/middleware/auth.middleware.js';
import * as calendarService from './calendar.service.js';

export const calendarController = {
  /** GET /events — List events for the authenticated user */
  getEvents: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate } = req.query as {
        startDate?: string;
        endDate?: string;
      };

      const events = await calendarService.getEvents(req.user!.id, startDate, endDate);
      res.json({ success: true, data: events });
    } catch (error) {
      next(error);
    }
  },

  /** GET /rooms — List rooms with availability */
  getRooms: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { room } = req.query as { room?: string };

      if (room) {
        const availability = await calendarService.getRoomAvailability(room);
        res.json({ success: true, data: availability });
      } else {
        const rooms = await calendarService.listRooms();
        res.json({ success: true, data: rooms });
      }
    } catch (error) {
      next(error);
    }
  },

  /** POST /book — Book a room (with clash detection) */
  bookRoom: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { title, room, startTime, endTime } = req.body as {
        title: string;
        room: string;
        startTime: string;
        endTime: string;
      };

      if (!title || !room || !startTime || !endTime) {
        res.status(400).json({ success: false, error: 'title, room, startTime, and endTime are required' });
        return;
      }

      const result = await calendarService.bookRoom(
        req.user!.id,
        title,
        room,
        startTime,
        endTime
      );

      if (result.booked) {
        res.status(201).json({ success: true, data: result });
      } else {
        // Clash detected — return 409 Conflict with suggestions
        res.status(409).json({ success: false, error: 'Time slot conflict', data: result });
      }
    } catch (error) {
      next(error);
    }
  },

  /** GET /clash-check — Check for clashes without booking */
  checkClash: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { room, startTime, endTime } = req.query as {
        room: string;
        startTime: string;
        endTime: string;
      };

      if (!room || !startTime || !endTime) {
        res.status(400).json({ success: false, error: 'room, startTime, and endTime query params are required' });
        return;
      }

      const result = await calendarService.checkClash(room, startTime, endTime);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  /** GET /suggestions — Get smart slot suggestions */
  getSuggestions: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { room, date } = req.query as { room: string; date: string };

      if (!room || !date) {
        res.status(400).json({ success: false, error: 'room and date query params are required' });
        return;
      }

      const suggestions = await calendarService.getSmartSuggestions(room, date, req.user!.id);
      res.json({ success: true, data: suggestions });
    } catch (error) {
      next(error);
    }
  },
};
