// ──────────────────────────────────────────────
// Approver Resolver — Determines approval chain
// ──────────────────────────────────────────────
// Given a request type and requester's department,
// returns the ordered approval chain with real approver IDs from DB.

import { db } from '../../shared/db/neon.client.js';
import { users } from '../../shared/db/schema.js';
import { eq, and } from 'drizzle-orm';
// Local type mirror — avoids rootDir cross-package TS resolution issue
type WorkflowType = 'room_booking' | 'certificate' | 'leave';

export interface ApproverInfo {
  approverId: string;
  approverRole: string;
  stageNumber: number;
}

/**
 * Approval chains per request type.
 * Each entry is an ordered list of roles that must approve sequentially.
 *   - 'hod'   → Head of Department (department-scoped)
 *   - 'admin' → Stucco/admin coordinator (global)
 *   - 'dean'  → Dean (global)
 */
const APPROVAL_CHAINS: Record<WorkflowType, string[]> = {
  room_booking: ['hod', 'admin', 'dean'],
  certificate: ['hod', 'dean'],
  leave: ['hod', 'dean'],
};

/**
 * Resolve the full approval chain for a given workflow type + department.
 * Queries the users table to find the actual approver for each role.
 */
export async function resolveApprovalChain(
  type: WorkflowType,
  department: string
): Promise<ApproverInfo[]> {
  const chain = APPROVAL_CHAINS[type];
  if (!chain) {
    throw new Error(`Unknown workflow type: ${type}`);
  }

  const approvers: ApproverInfo[] = [];

  for (let i = 0; i < chain.length; i++) {
    const role = chain[i];

    // HoD is department-scoped; admin and dean are global roles
    const isDepartmentScoped = role === 'hod';

    const whereClause = isDepartmentScoped && department
      ? and(eq(users.role, role), eq(users.department, department))
      : eq(users.role, role);

    const [approver] = await db
      .select({ id: users.id, role: users.role })
      .from(users)
      .where(whereClause)
      .limit(1);

    if (approver) {
      approvers.push({
        approverId: approver.id,
        approverRole: approver.role,
        stageNumber: i + 1,
      });
    }
  }

  return approvers;
}

/**
 * Get the expected number of stages for a workflow type.
 */
export function getChainLength(type: WorkflowType): number {
  return APPROVAL_CHAINS[type]?.length ?? 0;
}
