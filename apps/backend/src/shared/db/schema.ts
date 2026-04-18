// ──────────────────────────────────────────────
// Drizzle Schema — ALL Tables for Aether
// ──────────────────────────────────────────────
// This is the single source of truth for the database schema.
// Only Sid edits this file. Other devs reference it read-only.

import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  decimal,
  date,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// ── Users & Roles ──────────────────────────────
export const users = pgTable('users', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(), // 'student' | 'professor' | 'admin' | 'hod' | 'principal' | 'dean'
  department: varchar('department', { length: 100 }),
  karmaScore: integer('karma_score').default(0),
  preferredLanguage: varchar('preferred_language', { length: 10 }).default('en'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ── Notices ────────────────────────────────────
export const notices = pgTable('notices', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  authorId: uuid('author_id').references(() => users.id),
  title: varchar('title', { length: 500 }).notNull(),
  content: text('content').notNull(),
  targetRole: varchar('target_role', { length: 50 }).default('student'),
  department: varchar('department', { length: 100 }),
  isIndexed: boolean('is_indexed').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ── Workflow Requests ──────────────────────────
export const workflowRequests = pgTable('workflow_requests', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  requesterId: uuid('requester_id').references(() => users.id),
  type: varchar('type', { length: 100 }).notNull(), // 'room_booking' | 'certificate' | 'leave'
  status: varchar('status', { length: 50 }).default('pending'),
  currentStage: integer('current_stage').default(1),
  totalStages: integer('total_stages').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ── Approval Chain Stages ──────────────────────
export const approvalStages = pgTable('approval_stages', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  requestId: uuid('request_id').references(() => workflowRequests.id, { onDelete: 'cascade' }),
  stageNumber: integer('stage_number').notNull(),
  approverId: uuid('approver_id').references(() => users.id),
  approverRole: varchar('approver_role', { length: 50 }).notNull(),
  status: varchar('status', { length: 50 }).default('pending'),
  note: text('note'),
  decidedAt: timestamp('decided_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ── Issues ─────────────────────────────────────
export const issues = pgTable('issues', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  reporterId: uuid('reporter_id').references(() => users.id),
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 100 }), // 'it' | 'facility' | 'academic' | 'other'
  priority: varchar('priority', { length: 50 }).default('medium'),
  status: varchar('status', { length: 50 }).default('open'),
  locationX: decimal('location_x', { precision: 10, scale: 6 }),
  locationY: decimal('location_y', { precision: 10, scale: 6 }),
  building: varchar('building', { length: 100 }),
  imageUrl: varchar('image_url', { length: 500 }),
  assignedTeam: varchar('assigned_team', { length: 100 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ── Attendance Records ─────────────────────────
export const attendanceRecords = pgTable('attendance_records', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  professorId: uuid('professor_id').references(() => users.id),
  studentId: uuid('student_id').references(() => users.id),
  classId: varchar('class_id', { length: 100 }).notNull(),
  subject: varchar('subject', { length: 200 }),
  isPresent: boolean('is_present').notNull(),
  date: date('date').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ── Calendar Events ────────────────────────────
export const calendarEvents = pgTable('calendar_events', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  organizerId: uuid('organizer_id').references(() => users.id),
  title: varchar('title', { length: 500 }).notNull(),
  type: varchar('type', { length: 50 }), // 'class' | 'event' | 'room_booking'
  room: varchar('room', { length: 100 }),
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true }).notNull(),
  isLocked: boolean('is_locked').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ── Finance Dues ───────────────────────────────
export const financeDues = pgTable('finance_dues', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  studentId: uuid('student_id').references(() => users.id),
  type: varchar('type', { length: 100 }).notNull(), // 'library' | 'canteen' | 'lab'
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  status: varchar('status', { length: 50 }).default('pending'),
  razorpayOrderId: varchar('razorpay_order_id', { length: 200 }),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ── Karma Events ───────────────────────────────
export const karmaEvents = pgTable('karma_events', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').references(() => users.id),
  eventType: varchar('event_type', { length: 100 }).notNull(),
  points: integer('points').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ── Plugin Registry ────────────────────────────
export const plugins = pgTable('plugins', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  name: varchar('name', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 100 }).unique().notNull(),
  description: text('description'),
  deploymentUrl: varchar('deployment_url', { length: 500 }),
  apiEndpoint: varchar('api_endpoint', { length: 500 }),
  iconUrl: varchar('icon_url', { length: 500 }),
  category: varchar('category', { length: 100 }),
  status: varchar('status', { length: 50 }).default('pending'), // 'pending' | 'approved' | 'rejected'
  grokAuditReport: jsonb('grok_audit_report'),
  isActive: boolean('is_active').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ── Copilot Sessions ───────────────────────────
export const copilotSessions = pgTable('copilot_sessions', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').references(() => users.id),
  messages: jsonb('messages').default(sql`'[]'::jsonb`),
  contextSummary: text('context_summary'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});
