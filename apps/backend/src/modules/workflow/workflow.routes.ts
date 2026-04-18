// ──────────────────────────────────────────────
// Workflow Routes — Express Router
// ──────────────────────────────────────────────

import { Router } from 'express';
import { workflowController } from './workflow.controller.js';

const router = Router();

// Submit a new workflow request (room booking, certificate, leave)
router.post('/request', workflowController.submitRequest);

// List all requests for the authenticated user
router.get('/requests', workflowController.getMyRequests);

// Get requests pending the current user's approval
router.get('/pending', workflowController.getPending);

// Get a single request with full approval chain
router.get('/requests/:id', workflowController.getRequestById);

// Approve the current stage of a request
router.post('/requests/:id/approve', workflowController.approve);

// Reject the current stage of a request
router.post('/requests/:id/reject', workflowController.reject);

export default router;
