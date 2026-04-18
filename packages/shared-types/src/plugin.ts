// ──────────────────────────────────────────────
// Plugin / Super App Types — @aether/shared-types
// ──────────────────────────────────────────────

export type PluginStatus = 'pending' | 'approved' | 'rejected';

export interface Plugin {
  id: string;
  name: string;
  slug: string;
  description?: string;
  deploymentUrl?: string;
  apiEndpoint?: string;
  iconUrl?: string;
  category?: string;
  status: PluginStatus;
  grokAuditReport?: SecurityClearanceCertificate;
  isActive: boolean;
  createdAt: string;
}

export interface PluginSubmission {
  name: string;
  slug: string;
  description: string;
  deploymentUrl: string;
  category: string;
  permissions: string[];
}

export interface SecurityClearanceCertificate {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  findings: string[];
  recommendation: 'APPROVE' | 'REJECT' | 'MANUAL_REVIEW';
  compliance: string;
}
