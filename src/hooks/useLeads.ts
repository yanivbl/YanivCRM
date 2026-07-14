import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Lead, LeadStatus } from '../types/lead';

export function useLeads(q: string, status: LeadStatus | '') {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    let query = supabase.from('leads').select('*').order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (q.trim()) {
      const like = `%${q.trim()}%`;
      query = query.or(
        `name.ilike.${like},phone.ilike.${like},email.ilike.${like},city.ilike.${like},company.ilike.${like}`
      );
    }

    query.then(({ data, error }) => {
      if (cancelled) return;
      if (error) {
        setError(error.message);
      } else {
        setLeads(data ?? []);
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [q, status, reloadKey]);

  return { leads, loading, error, refetch };
}
