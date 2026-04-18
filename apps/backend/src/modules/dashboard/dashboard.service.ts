// ──────────────────────────────────────────────
// Dashboard Service — Aggregate Widget Data
// ──────────────────────────────────────────────
// Composes dashboard data for each role by querying
// relevant tables and returning pre-formatted widget payloads.

import { db } from '../../shared/db/neon.client.js';
import {
  users,
  notices,
  workflowRequests,
  financeDues,
  attendanceRecords,
  issues,
  calendarEvents,
  karmaEvents,
} from '../../shared/db/schema.js';
import { eq, and, desc, sql, count } from 'drizzle-orm';

/**
 * Student dashboard — shows upcoming classes, pending dues,
 * recent notices, workflow request statuses, and karma score.
 */
export async function getStudentDashboard(userId: string) {
  // Parallel data fetching for performance
  const [
    userProfile,
    pendingDues,
    recentNotices,
    myRequests,
    upcomingEvents,
    karmaTotal,
  ] = await Promise.all([
    // User profile
    db
      .select({
        id: users.id,
        name: users.name,
        role: users.role,
        department: users.department,
        karmaScore: users.karmaScore,
      })
      .from(users)
      .where(eq(users.id, userId))
      .then((rows) => rows[0]),

    // Pending finance dues
    db
      .select()
      .from(financeDues)
      .where(and(eq(financeDues.studentId, userId), eq(financeDues.status, 'pending'))),

    // Recent notices (last 5)
    db
      .select({
        id: notices.id,
        title: notices.title,
        department: notices.department,
        createdAt: notices.createdAt,
      })
      .from(notices)
      .orderBy(desc(notices.createdAt))
      .limit(5),

    // My workflow requests (last 5)
    db
      .select()
      .from(workflowRequests)
      .where(eq(workflowRequests.requesterId, userId))
      .orderBy(desc(workflowRequests.createdAt))
      .limit(5),

    // Upcoming calendar events (next 3)
    db
      .select()
      .from(calendarEvents)
      .where(sql`${calendarEvents.startTime} > NOW()`)
      .orderBy(calendarEvents.startTime)
      .limit(3),

    // Total karma score
    db
      .select({ total: sql<number>`COALESCE(SUM(${karmaEvents.points}), 0)` })
      .from(karmaEvents)
      .where(eq(karmaEvents.userId, userId))
      .then((rows) => rows[0]?.total ?? 0),
  ]);

  return {
    user: userProfile,
    widgets: {
      financeDues: {
        pending: pendingDues.length,
        totalAmount: pendingDues.reduce((sum, d) => sum + Number(d.amount), 0),
        dues: pendingDues,
      },
      recentNotices,
      myRequests,
      upcomingEvents,
      karmaScore: karmaTotal,
    },
  };
}

/**
 * Professor dashboard — shows classes today, pending approvals,
 * attendance trends, and recent notices.
 */
export async function getProfessorDashboard(userId: string) {
  const [
    userProfile,
    pendingApprovals,
    recentAttendance,
    recentNotices,
    myNotices,
  ] = await Promise.all([
    // User profile
    db
      .select({
        id: users.id,
        name: users.name,
        role: users.role,
        department: users.department,
      })
      .from(users)
      .where(eq(users.id, userId))
      .then((rows) => rows[0]),

    // Workflow requests pending my approval (approximation: in_progress requests)
    db
      .select()
      .from(workflowRequests)
      .where(eq(workflowRequests.status, 'in_progress'))
      .orderBy(desc(workflowRequests.createdAt))
      .limit(10),

    // Recent attendance records I've marked
    db
      .select()
      .from(attendanceRecords)
      .where(eq(attendanceRecords.professorId, userId))
      .orderBy(desc(attendanceRecords.date))
      .limit(20),

    // Recent notices (last 5)
    db
      .select({
        id: notices.id,
        title: notices.title,
        department: notices.department,
        createdAt: notices.createdAt,
      })
      .from(notices)
      .orderBy(desc(notices.createdAt))
      .limit(5),

    // Notices I've authored
    db
      .select({
        id: notices.id,
        title: notices.title,
        createdAt: notices.createdAt,
      })
      .from(notices)
      .where(eq(notices.authorId, userId))
      .orderBy(desc(notices.createdAt))
      .limit(5),
  ]);

  return {
    user: userProfile,
    widgets: {
      pendingApprovals: {
        count: pendingApprovals.length,
        requests: pendingApprovals,
      },
      recentAttendance: {
        totalRecords: recentAttendance.length,
        records: recentAttendance,
      },
      recentNotices,
      myNotices,
    },
  };
}

/**
 * Admin dashboard — shows system-wide analytics overview:
 * total users, active issues, pending approvals, attendance stats.
 */
export async function getAdminDashboard() {
  const [
    totalUsers,
    usersByRole,
    activeIssues,
    pendingApprovals,
    recentIssues,
  ] = await Promise.all([
    // Total user count
    db
      .select({ count: count() })
      .from(users)
      .then((rows) => rows[0]?.count ?? 0),

    // Users grouped by role
    db
      .select({
        role: users.role,
        count: count(),
      })
      .from(users)
      .groupBy(users.role),

    // Active (open) issues count
    db
      .select({ count: count() })
      .from(issues)
      .where(eq(issues.status, 'open'))
      .then((rows) => rows[0]?.count ?? 0),

    // Pending workflow requests count
    db
      .select({ count: count() })
      .from(workflowRequests)
      .where(eq(workflowRequests.status, 'pending'))
      .then((rows) => rows[0]?.count ?? 0),

    // Recent issues (last 10)
    db
      .select({
        id: issues.id,
        title: issues.title,
        category: issues.category,
        priority: issues.priority,
        status: issues.status,
        createdAt: issues.createdAt,
      })
      .from(issues)
      .orderBy(desc(issues.createdAt))
      .limit(10),
  ]);

  return {
    overview: {
      totalUsers,
      usersByRole,
      activeIssues,
      pendingApprovals,
    },
    recentIssues,
  };
}
