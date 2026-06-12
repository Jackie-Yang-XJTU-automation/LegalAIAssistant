// Core types for Legal AI Assistant

export type CaseStatus = "active" | "closed" | "archived";
export type RiskLevel = "low" | "medium" | "high";
export type Confidence = "high" | "medium" | "low";
export type AIResultStatus = "pending" | "confirmed" | "modified" | "rejected";
export type SourceType = "text" | "image" | "pdf" | "audio";
export type SourceStatus = "pending" | "processing" | "completed" | "failed";
export type TaskPriority = "high" | "medium" | "low";
export type TaskStatus = "pending" | "in_progress" | "completed";
export type PartyRole = "plaintiff" | "defendant" | "third_party" | "other";
export type CaseType = "lending" | "labor" | "family" | "other";

export interface CaseSummary {
  id: string;
  name: string;
  clientName: string;
  caseType: CaseType;
  status: CaseStatus;
  riskLevel: RiskLevel;
  stage: string;
  summary: string;
  taskCount: number;
  pendingDeadlineCount: number;
  updatedAt: string;
}

export interface CaseDetail extends CaseSummary {
  parties: PartyInfo[];
  events: EventItem[];
  tasks: TaskItem[];
  deadlines: DeadlineItem[];
  evidences: EvidenceItem[];
}

export interface PartyInfo {
  id: string;
  name: string;
  role: PartyRole;
  phone: string;
  idNumber: string;
  address: string;
}

export interface EventItem {
  id: string;
  date: string;
  description: string;
  amount: string;
  persons: string;
  sourceIds: string;
  confidence: Confidence;
  isConfirmed: boolean;
  tags: string[];
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  isAIGenerated: boolean;
}

export interface DeadlineItem {
  id: string;
  title: string;
  date: string;
  type: string;
  isAIGenerated: boolean;
  isConfirmed: boolean;
}

export interface EvidenceItem {
  id: string;
  name: string;
  type: string;
  purpose: string;
  source: string;
  isAIGenerated: boolean;
  isConfirmed: boolean;
}

export interface AIResultItem {
  id: string;
  caseId: string;
  sourceId: string;
  type: string;
  title: string;
  content: string;
  confidence: Confidence;
  status: AIResultStatus;
}

export interface DashboardData {
  todayMeetings: DeadlineItem[];
  todayDeadlines: DeadlineItem[];
  newAIResults: AIResultItem[];
  pendingConfirmations: AIResultItem[];
  recentCases: CaseSummary[];
}
