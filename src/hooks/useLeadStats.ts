import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Lead } from '../types/lead';

interface LeadStats {
  total: number;
  newCount: number;
  meetingScheduled: number;
  dealClosed: number;
}

export function useLeadStats() {
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const [totalRes, newRes, meetingRes, closedRes, recentRes] = await Promise.all([
        supabase.from('leads').select('*', { count: 'exact', head: true }),
        supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'new'),
        supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'contact_scheduled'),
        supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'closed'),
        supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(5),
      ]);

      if (cancelled) return;

      setStats({
        total: totalRes.count ?? 0,
        newCount: newRes.count ?? 0,
        meetingScheduled: meetingRes.count ?? 0,
        dealClosed: closedRes.count ?? 0,
      });
      setRecentLeads(recentRes.data ?? []);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { stats, recentLeads, loading };
}
