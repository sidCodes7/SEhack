// ──────────────────────────────────────────────
// Karma Score Types — @aether/shared-types
// ──────────────────────────────────────────────

export type KarmaEventType =
  | 'issue_reported'
  | 'class_attended'
  | 'room_returned_early'
  | 'due_paid_on_time'
  | 'peer_endorsed';

export interface KarmaEvent {
  id: string;
  userId: string;
  eventType: KarmaEventType;
  points: number;
  createdAt: string;
}

export interface KarmaScore {
  userId: string;
  totalScore: number;
  breakdown: {
    eventType: KarmaEventType;
    totalPoints: number;
    count: number;
  }[];
  rank?: number;
}
