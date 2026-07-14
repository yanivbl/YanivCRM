export type AnalysisStatus = 'queued' | 'running' | 'done' | 'failed';

export interface WebsiteAnalysis {
  id: string;
  lead_id: string | null;
  org_id: string;
  url: string;
  status: AnalysisStatus;
  business_summary: string | null;
  issues: string[] | null;
  opportunities: string[] | null;
  recommended_services: string[] | null;
  next_steps: string[] | null;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}
