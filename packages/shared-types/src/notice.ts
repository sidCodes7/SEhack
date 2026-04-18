// ──────────────────────────────────────────────
// Notice Types — @aether/shared-types
// ──────────────────────────────────────────────

export interface Notice {
  id: string;
  authorId: string;
  title: string;
  content: string;
  targetRole: string;
  department?: string;
  isIndexed: boolean;
  createdAt: string;
}

export interface CreateNoticePayload {
  title: string;
  content: string;
  targetRole?: string;
  department?: string;
}
