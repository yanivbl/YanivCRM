export type CallDirection = 'incoming' | 'outgoing';

export interface Call {
  id: string;
  org_id: string;
  lead_id: string;
  direction: CallDirection;
  duration_minutes: number | null;
  summary: string | null;
  transcript: string | null;
  called_at: string;
  created_by: string | null;
  created_at: string;
}

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
