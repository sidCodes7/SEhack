// ──────────────────────────────────────────────
// Seed Data Script — Aether Campus OS
// ──────────────────────────────────────────────
// Run: npm run seed (from apps/backend)
// Creates demo users, notices, workflow requests,
// issues, attendance, calendar events, finance dues,
// karma events, and a pre-registered plugin.

import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { db } from './neon.client.js';
import {
  users,
  notices,
  workflowRequests,
  approvalStages,
  issues,
  attendanceRecords,
  calendarEvents,
  financeDues,
  karmaEvents,
  plugins,
  copilotSessions,
} from './schema.js';
import { sql } from 'drizzle-orm';

const SALT_ROUNDS = 10;
const DEFAULT_PASSWORD = 'aether123'; // Demo password for all seed users

async function seed() {
  console.log('🌱 Starting seed...\n');

  // ── Clear existing data (reverse dependency order) ──
  console.log('🗑️  Clearing existing data...');
  await db.delete(copilotSessions);
  await db.delete(karmaEvents);
  await db.delete(approvalStages);
  await db.delete(workflowRequests);
  await db.delete(attendanceRecords);
  await db.delete(calendarEvents);
  await db.delete(financeDues);
  await db.delete(issues);
  await db.delete(notices);
  await db.delete(plugins);
  await db.delete(users);

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);

  // ────────────────────────────────────────────
  // 1. USERS
  // ────────────────────────────────────────────
  console.log('👤 Creating users...');

  const [priyank, rahul, sneha, aisha, vikram] = await db
    .insert(users)
    .values([
      {
        name: 'Priyank Sharma',
        email: 'priyank@aether.edu',
        passwordHash,
        role: 'student',
        department: 'Computer Science',
        karmaScore: 85,
        preferredLanguage: 'en',
      },
      {
        name: 'Rahul Mehta',
        email: 'rahul@aether.edu',
        passwordHash,
        role: 'student',
        department: 'Computer Science',
        karmaScore: 72,
        preferredLanguage: 'hi',
      },
      {
        name: 'Sneha Patel',
        email: 'sneha@aether.edu',
        passwordHash,
        role: 'student',
        department: 'Electronics',
        karmaScore: 91,
        preferredLanguage: 'en',
      },
      {
        name: 'Aisha Khan',
        email: 'aisha@aether.edu',
        passwordHash,
        role: 'student',
        department: 'Mechanical',
        karmaScore: 65,
        preferredLanguage: 'en',
      },
      {
        name: 'Vikram Singh',
        email: 'vikram@aether.edu',
        passwordHash,
        role: 'student',
        department: 'Computer Science',
        karmaScore: 78,
        preferredLanguage: 'mr',
      },
    ])
    .returning();

  const [harshav, drPriya, profAnand] = await db
    .insert(users)
    .values([
      {
        name: 'Prof. Harshav Kumar',
        email: 'harshav@aether.edu',
        passwordHash,
        role: 'professor',
        department: 'Computer Science',
        karmaScore: 0,
        preferredLanguage: 'en',
      },
      {
        name: 'Dr. Priya Desai',
        email: 'priya.desai@aether.edu',
        passwordHash,
        role: 'professor',
        department: 'Electronics',
        karmaScore: 0,
        preferredLanguage: 'en',
      },
      {
        name: 'Prof. Anand Rao',
        email: 'anand.rao@aether.edu',
        passwordHash,
        role: 'hod',
        department: 'Computer Science',
        karmaScore: 0,
        preferredLanguage: 'en',
      },
    ])
    .returning();

  const [adminUser] = await db
    .insert(users)
    .values([
      {
        name: 'Admin Aether',
        email: 'admin@aether.edu',
        passwordHash,
        role: 'admin',
        department: null,
        karmaScore: 0,
        preferredLanguage: 'en',
      },
    ])
    .returning();

  console.log(`   ✅ Created ${5 + 3 + 1} users`);

  // ────────────────────────────────────────────
  // 2. NOTICES
  // ────────────────────────────────────────────
  console.log('📢 Creating notices...');

  await db.insert(notices).values([
    {
      authorId: harshav.id,
      title: 'Mid-Semester Exam Schedule Released',
      content:
        'The mid-semester examination schedule for all CS courses has been published. Please check the academic calendar for your specific exam dates and timings. Report any clashes to the department office within 48 hours.',
      targetRole: 'student',
      department: 'Computer Science',
      isIndexed: false,
    },
    {
      authorId: drPriya.id,
      title: 'Electronics Lab — Safety Training Mandatory',
      content:
        'All Electronics students must complete the updated safety training module before accessing labs starting next week. Training slots are available on the booking portal. Non-compliance will result in restricted lab access.',
      targetRole: 'student',
      department: 'Electronics',
      isIndexed: false,
    },
    {
      authorId: profAnand.id,
      title: 'Hackathon 2026 Registration Open',
      content:
        'Aether Hackathon 2026 is now accepting registrations! Teams of 2-4 students can register through the student portal. Theme: "Campus Intelligence". Prizes worth ₹50,000 to be won. Last date: April 30, 2026.',
      targetRole: 'student',
      department: null,
      isIndexed: false,
    },
    {
      authorId: harshav.id,
      title: 'Guest Lecture — AI in Healthcare',
      content:
        'Dr. Ramesh Gupta from AIIMS will be delivering a guest lecture on "Applications of AI in Healthcare" on April 25, 2026 at 3:00 PM in Auditorium A. All students are welcome. Attendance will earn +5 Karma points.',
      targetRole: 'student',
      department: 'Computer Science',
      isIndexed: false,
    },
    {
      authorId: adminUser.id,
      title: 'Campus Maintenance — Water Supply Disruption',
      content:
        'Due to scheduled maintenance of the campus water supply system, there will be no water from 10 PM tonight to 6 AM tomorrow in Hostels A, B, and C. Please store water in advance. We apologize for the inconvenience.',
      targetRole: 'student',
      department: null,
      isIndexed: false,
    },
    {
      authorId: drPriya.id,
      title: 'Research Paper Submission Deadline Extended',
      content:
        'The deadline for submitting research papers to the IEEE Student Conference has been extended to May 15, 2026. Students who wish to participate should contact their faculty advisor for guidance.',
      targetRole: 'student',
      department: 'Electronics',
      isIndexed: false,
    },
  ]);

  console.log('   ✅ Created 6 notices');

  // ────────────────────────────────────────────
  // 3. WORKFLOW REQUESTS + APPROVAL STAGES
  // ────────────────────────────────────────────
  console.log('📋 Creating workflow requests...');

  // Request 1: Room booking — approved
  const [roomBooking] = await db
    .insert(workflowRequests)
    .values({
      requesterId: priyank.id,
      type: 'room_booking',
      status: 'approved',
      currentStage: 2,
      totalStages: 2,
      metadata: {
        room: 'CS-Lab-3',
        date: '2026-04-22',
        timeSlot: '14:00-16:00',
        purpose: 'Hackathon team practice session',
      },
    })
    .returning();

  await db.insert(approvalStages).values([
    {
      requestId: roomBooking.id,
      stageNumber: 1,
      approverId: harshav.id,
      approverRole: 'professor',
      status: 'approved',
      note: 'Approved. Good luck with the hackathon!',
      decidedAt: new Date('2026-04-17T10:00:00Z'),
    },
    {
      requestId: roomBooking.id,
      stageNumber: 2,
      approverId: profAnand.id,
      approverRole: 'hod',
      status: 'approved',
      note: 'Approved.',
      decidedAt: new Date('2026-04-17T14:30:00Z'),
    },
  ]);

  // Request 2: Leave — in progress (stage 1 approved, stage 2 pending)
  const [leaveReq] = await db
    .insert(workflowRequests)
    .values({
      requesterId: rahul.id,
      type: 'leave',
      status: 'in_progress',
      currentStage: 2,
      totalStages: 3,
      metadata: {
        startDate: '2026-04-25',
        endDate: '2026-04-28',
        reason: 'Family function — sister\'s wedding',
      },
    })
    .returning();

  await db.insert(approvalStages).values([
    {
      requestId: leaveReq.id,
      stageNumber: 1,
      approverId: harshav.id,
      approverRole: 'professor',
      status: 'approved',
      note: 'Approved. Submit assignments before leaving.',
      decidedAt: new Date('2026-04-18T09:00:00Z'),
    },
    {
      requestId: leaveReq.id,
      stageNumber: 2,
      approverId: profAnand.id,
      approverRole: 'hod',
      status: 'pending',
    },
    {
      requestId: leaveReq.id,
      stageNumber: 3,
      approverId: adminUser.id,
      approverRole: 'admin',
      status: 'pending',
    },
  ]);

  // Request 3: Certificate — pending (not started)
  const [certReq] = await db
    .insert(workflowRequests)
    .values({
      requesterId: sneha.id,
      type: 'certificate',
      status: 'pending',
      currentStage: 1,
      totalStages: 2,
      metadata: {
        certificateType: 'Bonafide Certificate',
        purpose: 'Internship application at Infosys',
      },
    })
    .returning();

  await db.insert(approvalStages).values([
    {
      requestId: certReq.id,
      stageNumber: 1,
      approverId: drPriya.id,
      approverRole: 'professor',
      status: 'pending',
    },
    {
      requestId: certReq.id,
      stageNumber: 2,
      approverId: adminUser.id,
      approverRole: 'admin',
      status: 'pending',
    },
  ]);

  // Request 4: Room booking — rejected
  const [rejectedReq] = await db
    .insert(workflowRequests)
    .values({
      requesterId: vikram.id,
      type: 'room_booking',
      status: 'rejected',
      currentStage: 1,
      totalStages: 2,
      metadata: {
        room: 'Auditorium-A',
        date: '2026-04-20',
        timeSlot: '10:00-17:00',
        purpose: 'Birthday party',
      },
    })
    .returning();

  await db.insert(approvalStages).values([
    {
      requestId: rejectedReq.id,
      stageNumber: 1,
      approverId: harshav.id,
      approverRole: 'professor',
      status: 'rejected',
      note: 'Auditorium cannot be booked for personal events.',
      decidedAt: new Date('2026-04-16T11:00:00Z'),
    },
    {
      requestId: rejectedReq.id,
      stageNumber: 2,
      approverId: profAnand.id,
      approverRole: 'hod',
      status: 'pending',
    },
  ]);

  console.log('   ✅ Created 4 workflow requests with approval stages');

  // ────────────────────────────────────────────
  // 4. ISSUES
  // ────────────────────────────────────────────
  console.log('🐛 Creating issues...');

  await db.insert(issues).values([
    {
      reporterId: priyank.id,
      title: 'Wi-Fi not working in CS Building 2nd Floor',
      description: 'The Wi-Fi has been down for the past 3 hours on the 2nd floor of CS building. Multiple students affected. Router seems to be blinking red.',
      category: 'it',
      priority: 'high',
      status: 'open',
      locationX: '23.123456',
      locationY: '72.654321',
      building: 'CS Building',
      assignedTeam: 'IT Support',
    },
    {
      reporterId: sneha.id,
      title: 'Broken chair in Electronics Lab',
      description: 'Chair at workstation #7 in Electronics Lab has a broken wheel. Risk of injury.',
      category: 'facility',
      priority: 'medium',
      status: 'in_progress',
      locationX: '23.124000',
      locationY: '72.655000',
      building: 'Electronics Block',
      assignedTeam: 'Maintenance',
    },
    {
      reporterId: rahul.id,
      title: 'Projector malfunction in Lecture Hall 3',
      description: 'The projector in LH-3 shows a yellow tint on all slides. HDMI cable might be loose.',
      category: 'it',
      priority: 'medium',
      status: 'open',
      locationX: '23.122500',
      locationY: '72.653800',
      building: 'Main Block',
      assignedTeam: 'IT Support',
    },
    {
      reporterId: aisha.id,
      title: 'Water leakage in Hostel B washroom',
      description: 'Persistent water leakage from the pipe in the 3rd floor washroom, Room B-312. Has been going on for 2 days.',
      category: 'facility',
      priority: 'critical',
      status: 'open',
      locationX: '23.125200',
      locationY: '72.656100',
      building: 'Hostel B',
      assignedTeam: 'Plumbing',
    },
    {
      reporterId: vikram.id,
      title: 'Unclear grading criteria for DSA assignment',
      description: 'The grading rubric for Assignment 3 in DSA course was not shared. Multiple students are confused about evaluation criteria.',
      category: 'academic',
      priority: 'low',
      status: 'resolved',
      locationX: '23.123000',
      locationY: '72.654000',
      building: 'CS Building',
      assignedTeam: 'CS Department',
    },
    {
      reporterId: priyank.id,
      title: 'Streetlight not working near parking lot',
      description: 'The streetlight near the main parking lot entrance has been off for a week. Safety concern at night.',
      category: 'facility',
      priority: 'high',
      status: 'open',
      locationX: '23.121800',
      locationY: '72.652500',
      building: 'Parking Area',
      assignedTeam: 'Electrical',
    },
    {
      reporterId: sneha.id,
      title: 'Library AC not functioning',
      description: 'The central AC in the library reading hall has stopped working. Temperature is uncomfortable for studying.',
      category: 'facility',
      priority: 'medium',
      status: 'in_progress',
      locationX: '23.123800',
      locationY: '72.654800',
      building: 'Library',
      assignedTeam: 'HVAC',
    },
  ]);

  console.log('   ✅ Created 7 issues');

  // ────────────────────────────────────────────
  // 5. ATTENDANCE RECORDS
  // ────────────────────────────────────────────
  console.log('📋 Creating attendance records...');

  const csStudents = [priyank, rahul, vikram];
  const attendanceData = [];

  // Generate attendance for 4 dates × 3 students × 1 class
  const dates = ['2026-04-14', '2026-04-15', '2026-04-16', '2026-04-17'];
  for (const dateStr of dates) {
    for (const student of csStudents) {
      attendanceData.push({
        professorId: harshav.id,
        studentId: student.id,
        classId: 'CS301-A',
        subject: 'Data Structures & Algorithms',
        isPresent: Math.random() > 0.2, // 80% attendance rate
        date: dateStr,
      });
    }
  }

  // Add Electronics attendance
  attendanceData.push(
    {
      professorId: drPriya.id,
      studentId: sneha.id,
      classId: 'EC201-B',
      subject: 'Digital Electronics',
      isPresent: true,
      date: '2026-04-14',
    },
    {
      professorId: drPriya.id,
      studentId: sneha.id,
      classId: 'EC201-B',
      subject: 'Digital Electronics',
      isPresent: true,
      date: '2026-04-15',
    },
    {
      professorId: drPriya.id,
      studentId: sneha.id,
      classId: 'EC201-B',
      subject: 'Digital Electronics',
      isPresent: false,
      date: '2026-04-16',
    },
  );

  await db.insert(attendanceRecords).values(attendanceData);

  console.log(`   ✅ Created ${attendanceData.length} attendance records`);

  // ────────────────────────────────────────────
  // 6. CALENDAR EVENTS
  // ────────────────────────────────────────────
  console.log('📅 Creating calendar events...');

  await db.insert(calendarEvents).values([
    {
      organizerId: harshav.id,
      title: 'DSA Lecture — CS301',
      type: 'class',
      room: 'LH-1',
      startTime: new Date('2026-04-21T09:00:00Z'),
      endTime: new Date('2026-04-21T10:00:00Z'),
      isLocked: true,
    },
    {
      organizerId: harshav.id,
      title: 'Operating Systems Lab — CS302',
      type: 'class',
      room: 'CS-Lab-2',
      startTime: new Date('2026-04-21T14:00:00Z'),
      endTime: new Date('2026-04-21T16:00:00Z'),
      isLocked: true,
    },
    {
      organizerId: drPriya.id,
      title: 'Digital Electronics Lecture',
      type: 'class',
      room: 'EC-Hall-1',
      startTime: new Date('2026-04-21T11:00:00Z'),
      endTime: new Date('2026-04-21T12:00:00Z'),
      isLocked: true,
    },
    {
      organizerId: priyank.id,
      title: 'Hackathon Team Meeting',
      type: 'room_booking',
      room: 'CS-Lab-3',
      startTime: new Date('2026-04-22T14:00:00Z'),
      endTime: new Date('2026-04-22T16:00:00Z'),
      isLocked: false,
    },
    {
      organizerId: profAnand.id,
      title: 'Guest Lecture — AI in Healthcare',
      type: 'event',
      room: 'Auditorium-A',
      startTime: new Date('2026-04-25T09:30:00Z'),
      endTime: new Date('2026-04-25T11:00:00Z'),
      isLocked: true,
    },
    {
      organizerId: adminUser.id,
      title: 'Campus Cultural Fest Planning',
      type: 'event',
      room: 'Conference-Room-1',
      startTime: new Date('2026-04-23T10:00:00Z'),
      endTime: new Date('2026-04-23T12:00:00Z'),
      isLocked: false,
    },
  ]);

  console.log('   ✅ Created 6 calendar events');

  // ────────────────────────────────────────────
  // 7. FINANCE DUES
  // ────────────────────────────────────────────
  console.log('💰 Creating finance dues...');

  await db.insert(financeDues).values([
    // Priyank — 3 dues
    { studentId: priyank.id, type: 'library', amount: '250.00', status: 'pending' },
    { studentId: priyank.id, type: 'canteen', amount: '1500.00', status: 'pending' },
    { studentId: priyank.id, type: 'lab', amount: '500.00', status: 'paid', paidAt: new Date('2026-04-10T08:00:00Z') },
    // Rahul — 3 dues
    { studentId: rahul.id, type: 'library', amount: '150.00', status: 'pending' },
    { studentId: rahul.id, type: 'canteen', amount: '2200.00', status: 'pending' },
    { studentId: rahul.id, type: 'lab', amount: '500.00', status: 'pending' },
    // Sneha — 3 dues
    { studentId: sneha.id, type: 'library', amount: '0.00', status: 'paid', paidAt: new Date('2026-04-05T12:00:00Z') },
    { studentId: sneha.id, type: 'canteen', amount: '800.00', status: 'pending' },
    { studentId: sneha.id, type: 'lab', amount: '750.00', status: 'pending' },
    // Aisha — 3 dues
    { studentId: aisha.id, type: 'library', amount: '300.00', status: 'pending' },
    { studentId: aisha.id, type: 'canteen', amount: '1100.00', status: 'pending' },
    { studentId: aisha.id, type: 'lab', amount: '500.00', status: 'paid', paidAt: new Date('2026-04-12T14:00:00Z') },
    // Vikram — 3 dues
    { studentId: vikram.id, type: 'library', amount: '200.00', status: 'pending' },
    { studentId: vikram.id, type: 'canteen', amount: '950.00', status: 'pending' },
    { studentId: vikram.id, type: 'lab', amount: '500.00', status: 'pending' },
  ]);

  console.log('   ✅ Created 15 finance dues (3 per student)');

  // ────────────────────────────────────────────
  // 8. KARMA EVENTS
  // ────────────────────────────────────────────
  console.log('⭐ Creating karma events...');

  await db.insert(karmaEvents).values([
    // Priyank — active reporter
    { userId: priyank.id, eventType: 'issue_reported', points: 10 },
    { userId: priyank.id, eventType: 'issue_reported', points: 10 },
    { userId: priyank.id, eventType: 'class_attended', points: 5 },
    { userId: priyank.id, eventType: 'class_attended', points: 5 },
    { userId: priyank.id, eventType: 'class_attended', points: 5 },
    { userId: priyank.id, eventType: 'due_paid_on_time', points: 15 },
    { userId: priyank.id, eventType: 'room_returned_early', points: 20 },
    // Rahul
    { userId: rahul.id, eventType: 'class_attended', points: 5 },
    { userId: rahul.id, eventType: 'class_attended', points: 5 },
    { userId: rahul.id, eventType: 'issue_reported', points: 10 },
    // Sneha — top performer
    { userId: sneha.id, eventType: 'class_attended', points: 5 },
    { userId: sneha.id, eventType: 'class_attended', points: 5 },
    { userId: sneha.id, eventType: 'class_attended', points: 5 },
    { userId: sneha.id, eventType: 'class_attended', points: 5 },
    { userId: sneha.id, eventType: 'issue_reported', points: 10 },
    { userId: sneha.id, eventType: 'issue_reported', points: 10 },
    { userId: sneha.id, eventType: 'due_paid_on_time', points: 15 },
    { userId: sneha.id, eventType: 'peer_endorsed', points: 20 },
    // Aisha
    { userId: aisha.id, eventType: 'class_attended', points: 5 },
    { userId: aisha.id, eventType: 'issue_reported', points: 10 },
    { userId: aisha.id, eventType: 'due_paid_on_time', points: 15 },
    // Vikram
    { userId: vikram.id, eventType: 'class_attended', points: 5 },
    { userId: vikram.id, eventType: 'class_attended', points: 5 },
    { userId: vikram.id, eventType: 'issue_reported', points: 10 },
    { userId: vikram.id, eventType: 'room_returned_early', points: 20 },
  ]);

  console.log('   ✅ Created 25 karma events');

  // ────────────────────────────────────────────
  // 9. PLUGIN — Canteen Tracker (pre-approved)
  // ────────────────────────────────────────────
  console.log('🧩 Creating Canteen Tracker plugin...');

  await db.insert(plugins).values({
    name: 'Canteen Tracker',
    slug: 'canteen-tracker',
    description:
      'Track daily canteen menu, pre-order meals, and view nutritional information. Built with aether-bridge.js for seamless integration.',
    deploymentUrl: 'https://canteen-tracker.vercel.app',
    apiEndpoint: 'https://canteen-tracker.vercel.app/api',
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png',
    category: 'lifestyle',
    status: 'approved',
    grokAuditReport: {
      riskLevel: 'LOW',
      findings: ['No external API calls detected', 'Uses only postMessage for communication', 'No localStorage access'],
      recommendation: 'APPROVE',
      compliance: 'Data Privacy OK — no user data stored externally',
    },
    isActive: true,
  });

  console.log('   ✅ Created 1 pre-approved plugin');

  // ────────────────────────────────────────────
  // DONE
  // ────────────────────────────────────────────
  console.log('\n✅ Seed completed successfully!');
  console.log('   📧 All users have password: "aether123"');
  console.log('   📧 Login emails:');
  console.log('      Student:   priyank@aether.edu');
  console.log('      Student:   rahul@aether.edu');
  console.log('      Professor: harshav@aether.edu');
  console.log('      HoD:       anand.rao@aether.edu');
  console.log('      Admin:     admin@aether.edu');
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  });
