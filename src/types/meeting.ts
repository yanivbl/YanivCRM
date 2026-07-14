export type MeetingStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show';

export interface Meeting {
  id: string;
  lead_id: string;
  org_id: string;
  starts_at: string;
  ends_at: string;
  status: MeetingStatus;
  notes: string | null;
  cal_com_booking_uid: string | null;
  created_at: string;
  updated_at: string;
}

export type MeetingFormValues = {
  starts_at: string;
  status: MeetingStatus;
  notes: string;
};

export const MEETING_STATUS_LABELS: Record<MeetingStatus, string> = {
  scheduled: 'מתוכננת',
  completed: 'התקיימה',
  cancelled: 'בוטלה',
  no_show: 'לא הגיע',
};

export const MEETING_STATUS_OPTIONS: MeetingStatus[] = ['scheduled', 'completed', 'cancelled', 'no_show'];
