export type Role = 'owner' | 'admin' | 'member';

export interface Organization {
  id: string;
  name: string;
  cal_com_organizer_email: string | null;
  created_at: string;
}

export interface Membership {
  id: string;
  org_id: string;
  user_id: string;
  role: Role;
  created_at: string;
}

export interface TeamMember extends Membership {
  full_name: string | null;
  email: string;
}

export interface Invitation {
  id: string;
  org_id: string;
  email: string;
  role: Exclude<Role, 'owner'>;
  invited_by: string | null;
  created_at: string;
  accepted_at: string | null;
}

export const ROLE_LABELS: Record<Role, string> = {
  owner: 'בעלים',
  admin: 'מנהל',
  member: 'חבר צוות',
};

export const INVITABLE_ROLES: Exclude<Role, 'owner'>[] = ['admin', 'member'];
