import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Task } from '../types/task';

export function useLeadTasks(leadId: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    if (!leadId) return;
    let cancelled = false;
    setLoading(true);

    supabase
      .from('tasks')
      .select('*')
      .eq('lead_id', leadId)
      .order('status', { ascending: true })
      .order('due_at', { ascending: true, nullsFirst: false })
      .then(({ data }) => {
        if (cancelled) return;
        setTasks(data ?? []);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [leadId, reloadKey]);

  const toggleDone = async (task: Task) => {
    const nextStatus = task.status === 'open' ? 'done' : 'open';
    const nextCompletedAt = nextStatus === 'done' ? new Date().toISOString() : null;

    // Optimistic update: this checkbox is a controlled input driven by this
    // state, so waiting for the round-trip before updating it makes every
    // click visually flicker back to its old value first. Roll back on failure.
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus, completed_at: nextCompletedAt } : t)));

    const { error } = await supabase
      .from('tasks')
      .update({ status: nextStatus, completed_at: nextCompletedAt })
      .eq('id', task.id);
    if (error) {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
    }
    return { error: error?.message ?? null };
  };

  const deleteTask = async (taskId: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', taskId);
    if (!error) refetch();
    return { error: error?.message ?? null };
  };

  return { tasks, loading, refetch, toggleDone, deleteTask };
}
