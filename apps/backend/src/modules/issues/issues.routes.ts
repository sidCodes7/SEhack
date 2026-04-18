// ──────────────────────────────────────────────
// Issues Routes
// ──────────────────────────────────────────────

import { Router } from 'express';
import multer from 'multer';
import { issuesController } from './issues.controller.js';

const router = Router();

// Multer config — memory storage, 10MB limit for image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// POST /api/issues — report a new issue (multipart: image + JSON fields)
router.post('/', upload.single('image'), issuesController.create);

// GET /api/issues — list issues (query: ?category=&status=&building=)
router.get('/', issuesController.list);

// GET /api/issues/heatmap — aggregated heatmap data
router.get('/heatmap', issuesController.heatmap);

// PATCH /api/issues/:id/status — update issue status
router.patch('/:id/status', issuesController.updateStatus);

export default router;
