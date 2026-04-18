// ──────────────────────────────────────────────
// Analytics Service — Aggregated Campus Metrics
// ──────────────────────────────────────────────
// Real DB queries against seeded data. Admin-facing metrics.

import { db } from '../../shared/db/neon.client.js';
import {
  attendanceRecords,
  approvalStages,
  workflowRequests,
  issues,
  users,
} from '../../shared/db/schema.js';
import { eq, and, sql, count, avg, desc } from 'drizzle-orm';

// ── Attendance Trends ──────────────────────────

/**
 * Aggregate attendance by class/subject.
 * Returns present count, total count, and percentage per class.
 */
export async function getAttendanceTrends() {
  const trends = await db
    .select({
      classId: attendanceRecords.classId,
      subject: attendanceRecords.subject,
      date: attendanceRecords.date,
      totalCount: count(),
      presentCount: sql<number>`SUM(CASE WHEN ${attendanceRecords.isPresent} = true THEN 1 ELSE 0 END)`,
    })
    .from(attendanceRecords)
    .groupBy(
      attendanceRecords.classId,
      attendanceRecords.subject,
      attendanceRecords.date
    )
    .orderBy(desc(attendanceRecords.date));

  return trends.map((t) => ({
    classId: t.classId,
    subject: t.subject,
    date: t.date,
    totalCount: Number(t.totalCount),
    presentCount: Number(t.presentCount),
    percentage: t.totalCount > 0
      ? Math.round((Number(t.presentCount) / Number(t.totalCount)) * 100)
      : 0,
  }));
}

// ── Approval Bottlenecks ───────────────────────

/**
 * Identify the slowest approval stages.
 * Calculates average time between stage creation and decision per approver.
 */
export async function getApprovalBottlenecks() {
  const bottlenecks = await db
    .select({
      approverId: approvalStages.approverId,
      approverRole: approvalStages.approverRole,
      pendingCount: sql<number>`SUM(CASE WHEN ${approvalStages.status} = 'pending' THEN 1 ELSE 0 END)`,
      avgDelayHours: sql<number>`
        AVG(
          CASE WHEN ${approvalStages.decidedAt} IS NOT NULL
          THEN EXTRACT(EPOCH FROM (${approvalStages.decidedAt} - ${approvalStages.createdAt})) / 3600
          ELSE NULL END
        )
      `,
    })
    .from(approvalStages)
    .groupBy(approvalStages.approverId, approvalStages.approverRole);

  // Enrich with approver names
  const enriched = await Promise.all(
    bottlenecks.map(async (b) => {
      let approverName = 'Unknown';
      if (b.approverId) {
        const [user] = await db
          .select({ name: users.name })
          .from(users)
          .where(eq(users.id, b.approverId))
          .limit(1);
        if (user) approverName = user.name;
      }

      return {
        approverId: b.approverId,
        approverRole: b.approverRole,
        approverName,
        pendingCount: Number(b.pendingCount),
        averageDelayHours: b.avgDelayHours ? Math.round(Number(b.avgDelayHours) * 10) / 10 : 0,
      };
    })
  );

  // Sort by pending count descending
  return enriched.sort((a, b) => b.pendingCount - a.pendingCount);
}

// ── Issue Stats ────────────────────────────────

/**
 * Issue statistics: open/closed counts, category breakdown, resolution rates.
 */
export async function getIssueStats() {
  const stats = await db
    .select({
      category: issues.category,
      total: count(),
      open: sql<number>`SUM(CASE WHEN ${issues.status} = 'open' THEN 1 ELSE 0 END)`,
      resolved: sql<number>`SUM(CASE WHEN ${issues.status} IN ('resolved', 'closed') THEN 1 ELSE 0 END)`,
      avgResolutionHours: sql<number>`
        AVG(
          CASE WHEN ${issues.status} IN ('resolved', 'closed') AND ${issues.updatedAt} IS NOT NULL
          THEN EXTRACT(EPOCH FROM (${issues.updatedAt} - ${issues.createdAt})) / 3600
          ELSE NULL END
        )
      `,
    })
    .from(issues)
    .groupBy(issues.category);

  return stats.map((s) => ({
    category: s.category ?? 'uncategorized',
    total: Number(s.total),
    open: Number(s.open),
    resolved: Number(s.resolved),
    averageResolutionHours: s.avgResolutionHours ? Math.round(Number(s.avgResolutionHours) * 10) / 10 : 0,
  }));
}
