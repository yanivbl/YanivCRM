import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { TaskWithLead } from '../types/task';

interface TaskStats {
  overdueCount: number;
  dueTodayCount: number;
}

function todayBounds() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTomorrow = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
  return { startOfToday: startOfToday.toISOString(), startOfTomorrow: startOfTomorrow.toISOString() };
}

export function useTaskStats() {
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [overdueTasks, setOverdueTasks] = useState<TaskWithLead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const { startOfToday, startOfTomorrow } = todayBounds();

      const [overdueRes, dueTodayRes] = await Promise.all([
        supabase
          .from('tasks')
          .select('*, leads(name)', { count: 'exact' })
          .eq('status', 'open')
          .lt('due_at', startOfToday)
          .order('due_at', { ascending: true })
          .limit(5),
        supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'open')
          .gte('due_at', startOfToday)
          .lt('due_at', startOfTomorrow),
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
