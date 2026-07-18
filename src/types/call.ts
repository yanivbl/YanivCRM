export type CallDirection = 'incoming' | 'outgoing';

export type TranscriptionStatus = 'processing' | 'done' | 'failed';

export type CallSentiment = 'positive' | 'neutral' | 'negative';

export interface CallAnalysis {
  sentiment: CallSentiment;
  key_points: string[];
  objections: string[];
  action_items: string[];
  buying_signals: string[];
  recommended_next_steps: string[];
}

export interface Call {
  id: string;
  org_id: string;
  lead_id: string;
  direction: CallDirection;
  duration_minutes: number | null;
  summary: string | null;
  transcript: string | null;
  audio_url: string | null;
  transcription_status: TranscriptionStatus | null;
  ai_analysis: CallAnalysis | null;
  called_at: string;
  created_by: string | null;
  created_at: string;
}

export const SENTIMENT_LABELS: Record<CallSentiment, string> = {
  positive: 'חיובי',
  neutral: 'נייטרלי',
  negative: 'שלילי',
};

export type CallFormValues = {
  direction: CallDirection;
  called_at: string;
  duration_minutes: string;
  summary: string;
  transcript: string;
};

export const DIRECTION_LABELS: Record<CallDirection, string> = {
  incoming: 'שיחה נכנסת',
  outgoing: 'שיחה יוצאת',
};

export const DIRECTION_OPTIONS: CallDirection[] = ['incoming', 'outgoing'];
