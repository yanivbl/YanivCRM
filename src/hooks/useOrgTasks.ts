import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { TaskPriority, TaskStatus, TaskWithLead } from '../types/task';

export function useOrgTasks(status: TaskStatus | '', priority: TaskPriority | '') {
  const [tasks, setTasks] = useState<TaskWithLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    // tasks.lead_id is a real FK to leads(id), unlike memberships/profiles,
    // so PostgREST can embed the lead name directly in one query.
    let query = supabase
      .from('tasks')
      .select('*, leads(name)')
      .order('status', { ascending: true })
      .order('due_at', { ascending: true, nullsFirst: false });

    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);

    query.then(({ data, error }) => {
      if (cancelled) return;
      if (error) {
        setError(error.message);
      } else {
        setTasks(
          (data ?? []).map((row: any) => ({
            ...row,
            lead_name: row.leads?.name ?? '—',
          }))
        );
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [status, priority, reloadKey]);

  const toggleDone = async (task: TaskWithLead) => {
    const nextStatus: TaskStatus = task.status === 'open' ? 'done' : 'open';
    const nextCompletedAt = nextStatus === 'done' ? new Date().toISOString() : null;

    // Optimistic update — see useLeadTasks.toggleDone for why: the checkbox is
    // a controlled input, so waiting for the round-trip first causes a
    // visible flicker back to the old checked state on every click. If a
    // status filter is active and the new status no longer matches it, drop
    // the row entirely rather than leaving a "done" task under "open".
    const applyOptimistic = (list: TaskWithLead[]) =>
      status && nextStatus !== status
        ? list.filter((t) => t.id !== task.id)
        : list.map((t) => (t.id === task.id ? { ...t, status: nextStatus, completed_at: nextCompletedAt } : t));
    setTasks(applyOptimistic);

    const { error } = await supabase
      .from('tasks')
      .update({ status: nextStatus, completed_at: nextCompletedAt })
      .eq('id', task.id);
    if (error) {
      setTasks((prev) => (prev.some((t) => t.id === task.id) ? prev.map((t) => (t.id === task.id ? task : t)) : [...prev, task]));
    }
    return { error: error?.message ?? null };
  };

  return { tasks, loading, error, refetch, toggleDone };
}
