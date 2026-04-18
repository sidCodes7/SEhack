export interface ApprovalRequest {
  id: string;
  type: 'room_booking' | 'leave' | 'certificate';
  status: 'pending' | 'in_progress' | 'approved' | 'rejected';
  submittedAt: string;
  details: Record<string, unknown>;
  stages: ApprovalStage[];
  notes?: ApprovalNote[];
}

export interface ApprovalStage {
  name: string;
  status: 'approved' | 'pending' | 'waiting' | 'rejected';
  date?: string;
  avgTime?: string;
  approver?: string;
}

export interface ApprovalNote {
  author: string;
  initials: string;
  text: string;
  time: string;
}
