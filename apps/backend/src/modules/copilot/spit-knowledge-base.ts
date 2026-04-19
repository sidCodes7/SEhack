// ──────────────────────────────────────────────
// SPIT Knowledge Base — Static RAG Context
// ──────────────────────────────────────────────
// This file provides structured SPIT-specific knowledge
// that is injected into the Grok system prompt.
// Simulates a RAG pipeline backed by institutional documents.

export const SPIT_KNOWLEDGE_BASE = `
=== SPIT INSTITUTIONAL KNOWLEDGE BASE ===
(Source: Academic Handbook 2024-25, Exam Cell Guidelines, ERP Portal)

📅 ACADEMIC CALENDAR (Even Semester 2024-25):
- Semester Start: 20th January 2025
- OCULUS Cultural Fest: 21st–23rd March 2025
- Convocation Day: 5th April 2025
- SPIT Annual Day: 25th April 2025
- BE Technical Paper/Project Presentations: 28th–30th April, 2nd May 2025

📝 EXAM SYSTEM (SPIT-Unique):
- Only 2 attempts per academic year: Regular + Re-exam (July). No special exams.
- If you miss the July re-exam, you must wait until next May/July (next academic year).
- Backlog exams can be given along with regular exams, but ERP registration is compulsory.
- Re-exam dates: 3rd week of July (tentatively).
- Who can appear for re-exam: Failed students, absent students, low attendance students.

📊 ATTENDANCE RULES:
- 75% attendance mandatory for ESE eligibility.
- Below 50% → NOT allowed in regular exam.
- 65–74% → Must attend a 15-day Academic Improvement Program after exams.
- 50–64% → Pay ₹2000 fine + attend improvement program.
- SPIT expects 100% attendance, but allows up to 25% relaxation with approval.

💰 FEES & PENALTIES:
- Late ERP registration fee: ₹2000/semester.
- Re-exam fee (normal): ₹1000.
- Re-exam fee (attendance <50%): ₹5000.
- Re-exam fee (malpractice): ₹10000.

🧠 EVALUATION SYSTEM:
- ISE: Assignments, quizzes, etc.
- MSE: 30 marks, 1 hour exam. No re-exam for MSE. Absent students get pro-rata marks (if valid reason).
- ESE: 100 marks, 3 hours.

📈 GRADING:
- Hybrid grading (absolute + relative).
- "SA" is a department-decided cutoff score above which students get AA grade.
- Grades are based on class performance distribution, not fixed marks.

🔁 PROMOTION RULES:
- FY to SY: Minimum 50% credits.
- SY to TY: Minimum 70% total credits (FY + SY).
- No restriction from odd to even semester at SPIT.

🎓 DEGREE REQUIREMENTS:
- B.Tech requires minimum 160 credits.
- Minimum CGPA: 4.0.
- Maximum duration: 6 years.

⚠️ MALPRACTICE:
- First offense: Grade reduced + ₹10000 fine + extra summer term required.
- Second offense: Year down (repeat year) + re-admission required.

🎯 SPECIAL POLICIES:
- Academic Improvement Program: A 15-day compulsory program for students with low attendance.
- Unlimited attempts to pass a subject within valid registration period.
- Only 2 attempts per year, but no total limit within degree duration.
`;

/**
 * RAG-style document chunks for retrieval simulation.
 * In production, these would be stored in a vector DB (Pinecone/Weaviate).
 */
export const KNOWLEDGE_CHUNKS = [
  { id: 'cal-001', topic: 'academic_calendar', content: 'Even Semester starts 20th Jan 2025. OCULUS fest 21-23 March. Convocation 5 April. Annual Day 25 April.' },
  { id: 'exam-001', topic: 'exam_rules', content: 'Only 2 attempts per year (Regular + Re-exam). No special exams. Miss July re-exam → wait till next year.' },
  { id: 'exam-002', topic: 'backlog', content: 'Backlogs can be given with regular exams. ERP registration is compulsory. Only 2 attempts per year but no total limit.' },
  { id: 'att-001', topic: 'attendance', content: '75% mandatory for ESE. Below 50% = blocked from exam. 65-74% = 15-day improvement program. 50-64% = ₹2000 fine + program.' },
  { id: 'fee-001', topic: 'fees', content: 'Late ERP: ₹2000. Re-exam: ₹1000 normal, ₹5000 low attendance, ₹10000 malpractice.' },
  { id: 'eval-001', topic: 'evaluation', content: 'ISE (assignments), MSE (30 marks, 1hr, no re-exam), ESE (100 marks, 3hrs). MSE absence → pro-rata marks.' },
  { id: 'grade-001', topic: 'grading', content: 'Hybrid grading. SA cutoff for AA grade. Grades based on class distribution, not fixed marks.' },
  { id: 'promo-001', topic: 'promotion', content: 'FY→SY: 50% credits. SY→TY: 70% total credits. No odd→even semester restriction.' },
  { id: 'degree-001', topic: 'degree', content: 'B.Tech: 160 credits min, 4.0 CGPA min, 6 years max duration.' },
  { id: 'mal-001', topic: 'malpractice', content: 'First: grade reduced + ₹10000 + summer term. Second: year down + re-admission.' },
  { id: 'aip-001', topic: 'improvement', content: 'Academic Improvement Program: 15-day compulsory for low attendance students.' },
];

/**
 * Simple keyword-based retrieval (simulates vector similarity search).
 * Returns most relevant chunks for a given query.
 */
export function retrieveRelevantChunks(query: string, topK: number = 3): string[] {
  const q = query.toLowerCase();
  const scored = KNOWLEDGE_CHUNKS.map(chunk => {
    const words = chunk.content.toLowerCase().split(/\s+/);
    const queryWords = q.split(/\s+/);
    let score = 0;
    for (const qw of queryWords) {
      if (words.some(w => w.includes(qw) || qw.includes(w))) score++;
    }
    // Boost topic matches
    if (q.includes(chunk.topic.replace('_', ' '))) score += 5;
    if (q.includes('exam') && chunk.topic.includes('exam')) score += 3;
    if (q.includes('attendance') && chunk.topic.includes('att')) score += 3;
    if (q.includes('fee') && chunk.topic.includes('fee')) score += 3;
    if (q.includes('grade') && chunk.topic.includes('grade')) score += 3;
    if (q.includes('calendar') && chunk.topic.includes('cal')) score += 3;
    if (q.includes('oculus') && chunk.topic.includes('cal')) score += 5;
    if (q.includes('convocation') && chunk.topic.includes('cal')) score += 5;
    if (q.includes('promotion') && chunk.topic.includes('promo')) score += 3;
    if (q.includes('degree') && chunk.topic.includes('degree')) score += 3;
    if (q.includes('backlog') && chunk.topic.includes('backlog')) score += 5;
    if (q.includes('malpractice') && chunk.topic.includes('mal')) score += 5;
    return { ...chunk, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .filter(c => c.score > 0)
    .map(c => c.content);
}
