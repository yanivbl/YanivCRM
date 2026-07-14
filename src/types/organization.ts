export type Role = 'owner' | 'admin' | 'member';

export interface Organization {
  id: string;
  name: string;
  created_at: string;
}

export interface Membership {
  id: string;
  org_id: string;
  user_id: string;
  role: Role;
  created_at: string;
}
