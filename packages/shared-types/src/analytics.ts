// ──────────────────────────────────────────────
// Analytics Types — @aether/shared-types
// ──────────────────────────────────────────────

export interface AnalyticsSummary {
  totalStudents: number;
  totalProfessors: number;
  activeIssues: number;
  pendingApprovals: number;
  averageAttendance: number;
  totalDuesCollected: number;
}

export interface ApprovalBottleneck {
  approverRole: string;
  approverId: string;
  approverName: string;
  averageDelayHours: number;
  pendingCount: number;
}

export interface IssueStat {
  category: string;
  total: number;
  open: number;
  resolved: number;
  averageResolutionHours: number;
}

export interface AttendanceTrend {
  date: string;
  classId: string;
  subject: string;
  presentCount: number;
  totalCount: number;
  percentage: number;
}
