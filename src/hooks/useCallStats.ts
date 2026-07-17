import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './useAuth';

function startOfMonthIso() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

// Calls this month, for the current user specifically (not org-wide) — matches
// how a sales rep would want to see their own call volume, not the team's.
export function useCallStats() {
  const { user } = useAuth();
  const [callsThisMonth, setCallsThisMonth] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!user) {
        setCallsThisMonth(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      const { count } = await supabase
        .from('calls')
        .select('id', { count: 'exact', head: true })
        .eq('created_by', user.id)
        .gte('called_at', startOfMonthIso());

      if (cancelled) return;
      setCallsThisMonth(count ?? 0);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return { callsThisMonth, loading };
}
