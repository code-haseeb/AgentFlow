export enum WorkflowStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  ARCHIVED = 'ARCHIVED',
}

export enum RunStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  WAITING_FOR_APPROVAL = 'WAITING_FOR_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export interface WorkflowSummary {
  id: string;
  organizationId: string;
  name: string;
  description?: string | null;
  status: WorkflowStatus;
  createdAt: string;
  updatedAt: string;
  runCount?: number;
}
