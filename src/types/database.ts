// src/types/database.ts
export type UserRole = 'team_lead' | 'specialist';

export type AuditFlag = 
  | 'flawless'
  | 'wrong_tone'
  | 'no_order_history_check'
  | 'wrong_question'
  | 'too_slow'
  | 'technically_correct_poor_retention';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at?: string;
}

export interface Brand {
  id: string;
  name: string;
  tone_guidelines: string;
  created_at?: string;
}

export interface AuditReview {
  id: string;
  reply_id: string;
  auditor_id: string;
  score: number;
  flag: AuditFlag;
  feedback: string;
  reviewed_at: string;
  auditor?: User;
}

export interface SupportReply {
  id: string;
  brand_id: string;
  specialist_id: string;
  customer_query: string;
  specialist_reply: string;
  ticket_context?: string;
  sent_at: string;
  brands?: Brand;
  users?: User;
  audit_reviews?: AuditReview | null;
}

export interface BrandTrendMetrics {
  brandId: string;
  brandName: string;
  totalReplies: number;
  auditedCount: number;
  averageScore: number;
  flagDistribution: Record<AuditFlag, number>;
  topIssue: string;
  exemplaryCount: number;
}