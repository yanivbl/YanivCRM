import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { TaskWithLead } from '../types/task';

interface TaskStats {
  overdueCount: number;
  dueTodayCount: number;
}

function todayRange() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startIso = startOfDay.toISOString().slice(0, 10);
  return startIso;
}

export function useTaskStats() {
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [overdueTasks, setOverdueTasks] = useState<TaskWithLead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const today = todayRange();

      const [overdueRes, dueTodayRes] = await Promise.all([
        supabase
          .from('tasks')
          .select('*, leads(name)', { count: 'exact' })
          .eq('status', 'open')
          .lt('due_date', today)
          .order('due_date', { ascending: true })
          .limit(5),
        supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'open')
          .eq('due_date', today),
      ]);

      if (cancelled) return;

      setStats({
        overdueCount: overdueRes.count ?? 0,
        dueTodayCount: dueTodayRes.count ?? 0,
      });
      setOverdueTasks(
        (overdueRes.data ?? []).map((row: any) => ({
          ...row,
          lead_name: row.leads?.name ?? '—',
        }))
      );
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { stats, overdueTasks, loading };
}
