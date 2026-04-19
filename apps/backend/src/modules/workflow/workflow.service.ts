// ──────────────────────────────────────────────
// Workflow Service — Business Logic
// ──────────────────────────────────────────────
// Handles creation, querying, approval/rejection of workflow requests.
// All state mutations emit WebSocket events for real-time UI updates.

import { db } from '../../shared/db/neon.client.js';
import { workflowRequests, approvalStages, users } from '../../shared/db/schema.js';
import { eq, and, desc, sql } from 'drizzle-orm';
import { resolveApprovalChain } from './approver-resolver.js';
import { emitToUser, emitToRoom } from '../../shared/websocket/ws.server.js';
import { createError } from '../../shared/middleware/error.middleware.js';
import { sendApprovalEmail } from '../../shared/email/resend.service.js';
// Local type mirror — avoids rootDir cross-package TS resolution issue
type WorkflowType = 'room_booking' | 'certificate' | 'leave';

// ── Create Request ─────────────────────────────

export async function createRequest(
  requesterId: string,
  type: WorkflowType,
  metadata: Record<string, unknown>
) {
  // Look up requester's department for approval chain resolution
  const [requester] = await db
    .select({ department: users.department })
    .from(users)
    .where(eq(users.id, requesterId))
    .limit(1);

  if (!requester) {
    throw createError('Requester not found', 404);
  }

  const department = requester.department || 'general';

  // Resolve the approval chain
  const chain = await resolveApprovalChain(type, department);

  if (chain.length === 0) {
    throw createError('No approvers found for this request type and department', 400);
  }

  // Create the workflow request
  const [request] = await db
    .insert(workflowRequests)
    .values({
      requesterId,
      type,
      status: 'pending',
      currentStage: 1,
      totalStages: chain.length,
      metadata,
    })
    .returning();

  // Create all approval stages
  const stageRows = chain.map((approver) => ({
    requestId: request.id,
    stageNumber: approver.stageNumber,
    approverId: approver.approverId,
    approverRole: approver.approverRole,
    status: 'pending',
  }));

  await db.insert(approvalStages).values(stageRows);

  // Notify the first approver
  const firstApprover = chain[0];
  emitToUser(firstApprover.approverId, 'approval:pending', {
    requestId: request.id,
    type,
    stage: 1,
    totalStages: chain.length,
  });

  return request;
}

// ── Query Requests ─────────────────────────────

export async function getRequestsByUser(userId: string) {
  const requests = await db
    .select()
    .from(workflowRequests)
    .where(eq(workflowRequests.requesterId, userId))
    .orderBy(desc(workflowRequests.createdAt));

  // Attach stages to each request
  const enriched = await Promise.all(
    requests.map(async (req) => {
      const stages = await db
        .select()
        .from(approvalStages)
        .where(eq(approvalStages.requestId, req.id))
        .orderBy(approvalStages.stageNumber);
      return { ...req, stages };
    })
  );

  return enriched;
}

export async function getRequestById(requestId: string) {
  const [request] = await db
    .select()
    .from(workflowRequests)
    .where(eq(workflowRequests.id, requestId))
    .limit(1);

  if (!request) {
    throw createError('Request not found', 404);
  }

  const stages = await db
    .select()
    .from(approvalStages)
    .where(eq(approvalStages.requestId, requestId))
    .orderBy(approvalStages.stageNumber);

  return { ...request, stages };
}

export async function getPendingForApprover(approverId: string) {
  // Find all approval stages assigned to this approver that are still pending
  const pendingStages = await db
    .select()
    .from(approvalStages)
    .where(
      and(
        eq(approvalStages.approverId, approverId),
        eq(approvalStages.status, 'pending')
      )
    );

  // Only return stages whose request's currentStage matches the stage number
  // (i.e., it's actually their turn to approve)
  const results = await Promise.all(
    pendingStages.map(async (stage) => {
      const [request] = await db
        .select()
        .from(workflowRequests)
        .where(
          and(
            eq(workflowRequests.id, stage.requestId!),
            eq(workflowRequests.currentStage, stage.stageNumber),
            eq(workflowRequests.status, 'pending')
          )
        )
        .limit(1);

      if (!request) return null;

      return { ...request, currentApprovalStage: stage };
    })
  );

  return results.filter(Boolean);
}

// ── Approve / Reject ───────────────────────────

export async function approveStage(
  requestId: string,
  approverId: string,
  note?: string
) {
  const [request] = await db
    .select()
    .from(workflowRequests)
    .where(eq(workflowRequests.id, requestId))
    .limit(1);

  if (!request) {
    throw createError('Request not found', 404);
  }

  if (request.status !== 'pending') {
    throw createError('Request is no longer pending', 400);
  }

  // Find the current stage assigned to this approver
  const [stage] = await db
    .select()
    .from(approvalStages)
    .where(
      and(
        eq(approvalStages.requestId, requestId),
        eq(approvalStages.stageNumber, request.currentStage!),
        eq(approvalStages.approverId, approverId),
        eq(approvalStages.status, 'pending')
      )
    )
    .limit(1);

  if (!stage) {
    throw createError('You are not the current approver for this request', 403);
  }

  // Mark stage as approved
  await db
    .update(approvalStages)
    .set({
      status: 'approved',
      note: note || null,
      decidedAt: sql`NOW()`,
    })
    .where(eq(approvalStages.id, stage.id));

  const isLastStage = request.currentStage! >= request.totalStages;

  if (isLastStage) {
    // Final approval — mark request as approved
    await db
      .update(workflowRequests)
      .set({
        status: 'approved',
        updatedAt: sql`NOW()`,
      })
      .where(eq(workflowRequests.id, requestId));

    // Notify requester
    emitToUser(request.requesterId!, 'approval:updated', {
      requestId,
      status: 'approved',
      stage: request.currentStage,
      totalStages: request.totalStages,
    });

    emitToUser(request.requesterId!, 'notification:push', {
      title: 'Request Approved!',
      body: `Your ${request.type} request has been fully approved.`,
      requestId,
    });

    // Send email notification to requester
    try {
      const [requester] = await db.select().from(users).where(eq(users.id, request.requesterId!)).limit(1);
      if (requester?.email) {
        sendApprovalEmail(requester.email, requester.name, request.type!, 'approved').catch(() => {});
      }
    } catch {}
  } else {
    // Advance to next stage
    const nextStage = request.currentStage! + 1;

    await db
      .update(workflowRequests)
      .set({
        currentStage: nextStage,
        updatedAt: sql`NOW()`,
      })
      .where(eq(workflowRequests.id, requestId));

    // Notify next approver
    const [nextApprovalStage] = await db
      .select()
      .from(approvalStages)
      .where(
        and(
          eq(approvalStages.requestId, requestId),
          eq(approvalStages.stageNumber, nextStage)
        )
      )
      .limit(1);

    if (nextApprovalStage?.approverId) {
      emitToUser(nextApprovalStage.approverId, 'approval:pending', {
        requestId,
        type: request.type,
        stage: nextStage,
        totalStages: request.totalStages,
      });
    }

    // Notify requester of progress
    emitToUser(request.requesterId!, 'approval:updated', {
      requestId,
      status: 'pending',
      stage: nextStage,
      totalStages: request.totalStages,
    });
  }

  // Emit to request room for anyone tracking this request
  emitToRoom(`request:${requestId}`, 'approval:updated', {
    requestId,
    status: isLastStage ? 'approved' : 'pending',
    stage: isLastStage ? request.currentStage : request.currentStage! + 1,
    totalStages: request.totalStages,
    approvedBy: approverId,
  });

  return getRequestById(requestId);
}

export async function rejectStage(
  requestId: string,
  approverId: string,
  note: string
) {
  const [request] = await db
    .select()
    .from(workflowRequests)
    .where(eq(workflowRequests.id, requestId))
    .limit(1);

  if (!request) {
    throw createError('Request not found', 404);
  }

  if (request.status !== 'pending') {
    throw createError('Request is no longer pending', 400);
  }

  // Find the current stage assigned to this approver
  const [stage] = await db
    .select()
    .from(approvalStages)
    .where(
      and(
        eq(approvalStages.requestId, requestId),
        eq(approvalStages.stageNumber, request.currentStage!),
        eq(approvalStages.approverId, approverId),
        eq(approvalStages.status, 'pending')
      )
    )
    .limit(1);

  if (!stage) {
    throw createError('You are not the current approver for this request', 403);
  }

  // Mark stage as rejected
  await db
    .update(approvalStages)
    .set({
      status: 'rejected',
      note,
      decidedAt: sql`NOW()`,
    })
    .where(eq(approvalStages.id, stage.id));

  // Mark entire request as rejected (rejection at any stage kills the request)
  await db
    .update(workflowRequests)
    .set({
      status: 'rejected',
      updatedAt: sql`NOW()`,
    })
    .where(eq(workflowRequests.id, requestId));

  // Notify requester
  emitToUser(request.requesterId!, 'approval:updated', {
    requestId,
    status: 'rejected',
    stage: request.currentStage,
    totalStages: request.totalStages,
    rejectedBy: approverId,
    note,
  });

  emitToUser(request.requesterId!, 'notification:push', {
    title: 'Request Rejected',
    body: `Your ${request.type} request was rejected at stage ${request.currentStage}. Reason: ${note}`,
    requestId,
  });

  // Emit to request room
  emitToRoom(`request:${requestId}`, 'approval:updated', {
    requestId,
    status: 'rejected',
    stage: request.currentStage,
    rejectedBy: approverId,
    note,
  });

  return getRequestById(requestId);
}
