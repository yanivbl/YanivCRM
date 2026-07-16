export type TaskStatus = 'open' | 'done';

export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  org_id: string;
  lead_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_at: string | null;
  assignee_id: string | null;
  created_by: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskWithLead extends Task {
  lead_name: string;
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  open: 'פתוחה',
  done: 'הושלמה',
};

export const STATUS_OPTIONS: TaskStatus[] = ['open', 'done'];

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'נמוכה',
  medium: 'בינונית',
  high: 'גבוהה',
};

export const PRIORITY_OPTIONS: TaskPriority[] = ['low', 'medium', 'high'];
