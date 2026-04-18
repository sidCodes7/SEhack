// ──────────────────────────────────────────────
// Workflow & Approval Types — @aether/shared-types
// ──────────────────────────────────────────────

export type WorkflowType = 'room_booking' | 'certificate' | 'leave';

export type WorkflowStatus = 'pending' | 'in_progress' | 'approved' | 'rejected';

export type ApprovalStageStatus = 'pending' | 'approved' | 'rejected';

export interface ApprovalStage {
  id: string;
  requestId: string;
  stageNumber: number;
  approverId: string;
  approverRole: string;
  status: ApprovalStageStatus;
  note?: string;
  decidedAt?: string;
  createdAt: string;
}

export interface WorkflowRequest {
  id: string;
  requesterId: string;
  type: WorkflowType;
  status: WorkflowStatus;
  currentStage: number;
  totalStages: number;
  metadata?: Record<string, unknown>;
  stages?: ApprovalStage[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkflowPayload {
  type: WorkflowType;
  metadata: Record<string, unknown>;
}

export interface ApproveStagePayload {
  note?: string;
}
