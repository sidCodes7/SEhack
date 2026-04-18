// ──────────────────────────────────────────────
// Attendance Service — Business Logic
// ──────────────────────────────────────────────
// Handles bulk attendance marking, class/student queries,
// and trend aggregation for professors.

import { db } from '../../shared/db/neon.client.js';
import { attendanceRecords } from '../../shared/db/schema.js';
import { eq, and, sql, count } from 'drizzle-orm';
import { createError } from '../../shared/middleware/error.middleware.js';
import { emitToRoom } from '../../shared/websocket/ws.server.js';

// ── Types ──────────────────────────────────────

interface StudentAttendance {
  studentId: string;
  isPresent: boolean;
}

interface MarkAttendanceInput {
  classId: string;
  subject: string;
  date: string;
  students: StudentAttendance[];
}

// ── Service Functions ──────────────────────────

/**
 * Mark attendance for a class — bulk insert for all students.
 */
export async function markAttendance(professorId: string, input: MarkAttendanceInput) {
  const { classId, subject, date, students } = input;

  if (!students || students.length === 0) {
    throw createError('Students array is required and cannot be empty', 400);
  }

  // Build bulk insert values
  const values = students.map((s) => ({
    professorId,
    studentId: s.studentId,
    classId,
    subject,
    isPresent: s.isPresent,
    date,
  }));

  const inserted = await db
    .insert(attendanceRecords)
    .values(values)
    .returning();

  // Emit WebSocket event for real-time updates
  try {
    emitToRoom(`class:${classId}`, 'attendance:updated', {
      classId,
      subject,
      date,
      totalStudents: students.length,
      presentCount: students.filter((s) => s.isPresent).length,
    });
  } catch {
    // best-effort
  }

  return {
    classId,
    subject,
    date,
    totalStudents: students.length,
    presentCount: students.filter((s) => s.isPresent).length,
    records: inserted,
  };
}

/**
 * Get attendance records for a class.
 */
export async function getClassAttendance(classId: string) {
  const records = await db
    .select()
    .from(attendanceRecords)
    .where(eq(attendanceRecords.classId, classId))
    .orderBy(attendanceRecords.date);

  return records;
}

/**
 * Get attendance summary for a student.
 * Returns total classes, present count, and percentage.
 */
export async function getStudentSummary(studentId: string) {
  const records = await db
    .select()
    .from(attendanceRecords)
    .where(eq(attendanceRecords.studentId, studentId));

  const total = records.length;
  const present = records.filter((r) => r.isPresent).length;
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

  // Group by subject for per-subject breakdown
  const subjectMap: Record<string, { total: number; present: number }> = {};
  for (const record of records) {
    const subj = record.subject || 'Unknown';
    if (!subjectMap[subj]) {
      subjectMap[subj] = { total: 0, present: 0 };
    }
    subjectMap[subj].total++;
    if (record.isPresent) {
      subjectMap[subj].present++;
    }
  }

  const subjects = Object.entries(subjectMap).map(([subject, data]) => ({
    subject,
    total: data.total,
    present: data.present,
    percentage: Math.round((data.present / data.total) * 100),
  }));

  return {
    studentId,
    totalClasses: total,
    presentCount: present,
    percentage,
    subjects,
  };
}

/**
 * Get attendance trends for a professor's classes.
 * Aggregates attendance data across all classes the professor teaches.
 */
export async function getTrends(professorId: string) {
  const records = await db
    .select()
    .from(attendanceRecords)
    .where(eq(attendanceRecords.professorId, professorId))
    .orderBy(attendanceRecords.date);

  // Group by date for daily trends
  const dateMap: Record<string, { total: number; present: number }> = {};
  const classMap: Record<string, { total: number; present: number; subject: string | null }> = {};

  for (const record of records) {
    // Daily trends
    const dateKey = record.date;
    if (!dateMap[dateKey]) {
      dateMap[dateKey] = { total: 0, present: 0 };
    }
    dateMap[dateKey].total++;
    if (record.isPresent) {
      dateMap[dateKey].present++;
    }

    // Class-wise trends
    const classKey = record.classId;
    if (!classMap[classKey]) {
      classMap[classKey] = { total: 0, present: 0, subject: record.subject };
    }
    classMap[classKey].total++;
    if (record.isPresent) {
      classMap[classKey].present++;
    }
  }

  const dailyTrends = Object.entries(dateMap).map(([date, data]) => ({
    date,
    total: data.total,
    present: data.present,
    percentage: Math.round((data.present / data.total) * 100),
  }));

  const classTrends = Object.entries(classMap).map(([classId, data]) => ({
    classId,
    subject: data.subject,
    total: data.total,
    present: data.present,
    percentage: Math.round((data.present / data.total) * 100),
  }));

  return {
    professorId,
    dailyTrends,
    classTrends,
    overallAttendance: records.length > 0
      ? Math.round((records.filter((r) => r.isPresent).length / records.length) * 100)
      : 0,
  };
}
