export type LeadStatus = 'new' | 'contact_scheduled' | 'follow_up' | 'closed' | 'lost';

export type LeadSource = 'manual' | 'cal_com' | 'website_form';

export interface Lead {
  id: string;
  owner_id: string;
  org_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  city: string | null;
  company: string | null;
  website_url: string | null;
  price: number | null;
  status: LeadStatus;
  source: LeadSource;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type LeadFormValues = {
  name: string;
  phone: string;
  email: string;
  city: string;
  company: string;
  website_url: string;
  price: string;
  status: LeadStatus;
  notes: string;
};

export const STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'ליד חדש',
  contact_scheduled: 'נקבעה שיחת היכרות',
  follow_up: 'נקבעה פגישת המשך',
  closed: 'עסקה נסגרה',
  lost: 'עסקה אבודה',
};

export const STATUS_OPTIONS: LeadStatus[] = ['new', 'contact_scheduled', 'follow_up', 'closed', 'lost'];

export const SOURCE_LABELS: Record<LeadSource, string> = {
  manual: 'יצירה ידנית',
  cal_com: 'Cal.com',
  website_form: 'טופס באתר',
};
