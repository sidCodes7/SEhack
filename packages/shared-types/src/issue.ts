// ──────────────────────────────────────────────
// Issue & Heatmap Types — @aether/shared-types
// ──────────────────────────────────────────────

export type IssueCategory = 'it' | 'facility' | 'academic' | 'other';

export type IssuePriority = 'low' | 'medium' | 'high' | 'critical';

export type IssueStatus = 'open' | 'in_progress' | 'resolved';

export interface Issue {
  id: string;
  reporterId: string;
  title: string;
  description?: string;
  category?: IssueCategory;
  priority: IssuePriority;
  status: IssueStatus;
  locationX?: number;
  locationY?: number;
  building?: string;
  imageUrl?: string;
  assignedTeam?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HeatmapPoint {
  x: number;
  y: number;
  count: number;
  category?: IssueCategory;
}

export interface CreateIssuePayload {
  title: string;
  description?: string;
  category?: IssueCategory;
  priority?: IssuePriority;
  locationX?: number;
  locationY?: number;
  building?: string;
}
