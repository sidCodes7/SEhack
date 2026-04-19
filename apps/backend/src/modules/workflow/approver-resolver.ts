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

  // Fallback role map: if the primary role isn't found, try fallbacks
  const ROLE_FALLBACKS: Record<string, string[]> = {
    hod: ['hod', 'professor'],   // Fall back to any professor in the department
    admin: ['admin'],
    dean: ['dean', 'admin'],     // Fall back to admin if no dean exists
  };

  for (let i = 0; i < chain.length; i++) {
    const role = chain[i];
    const rolesToTry = ROLE_FALLBACKS[role] || [role];

    // HoD/professor is department-scoped; admin and dean are global
    const isDepartmentScoped = role === 'hod';

    let approver: { id: string; role: string } | null = null;

    for (const tryRole of rolesToTry) {
      const whereClause = isDepartmentScoped && department
        ? and(eq(users.role, tryRole), eq(users.department, department))
        : eq(users.role, tryRole);

      const [found] = await db
        .select({ id: users.id, role: users.role })
        .from(users)
        .where(whereClause)
        .limit(1);

      if (found) {
        approver = found;
        break;
      }
    }

    if (approver) {
      // Avoid duplicate approvers (e.g., admin used as both 'admin' and 'dean' fallback)
      if (!approvers.some(a => a.approverId === approver!.id)) {
        approvers.push({
          approverId: approver.id,
          approverRole: role,  // Use the original role name for display
          stageNumber: approvers.length + 1,
        });
      }
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
