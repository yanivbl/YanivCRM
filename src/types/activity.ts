export type ActivityAction =
  | 'lead_created'
  | 'status_changed'
  | 'member_invited'
  | 'member_joined'
  | 'member_role_changed'
  | 'member_removed';

export interface ActivityLogEntry {
  id: string;
  org_id: string;
  lead_id: string | null;
  actor_id: string | null;
  action: ActivityAction;
  details: Record<string, string> | null;
  created_at: string;
}
