import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './useAuth';
import type { Call, CallFormValues } from '../types/call';

// Takes orgId directly from the already-loaded lead, same as useMeetings —
// see that hook for why: a separate useCurrentOrg() fetch here would be a
// real race against fast form submission (confirmed bug, already hit once).
export function useLeadCalls(leadId: string, orgId: string) {
  const { user } = useAuth();
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    if (!leadId) return;
    let cancelled = false;
    setLoading(true);

    supabase
      .from('calls')
      .select('*')
      .eq('lead_id', leadId)
      .order('called_at', { ascending: false })
      .then(({ data }) => {
        if (cancelled) return;
        setCalls(data ?? []);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [leadId, reloadKey]);

  const logCall = async (values: CallFormValues) => {
    if (!user) return { error: 'missing user' };
    const { error } = await supabase.from('calls').insert({
      org_id: orgId,
      lead_id: leadId,
      direction: values.direction,
      called_at: new Date(values.called_at).toISOString(),
      duration_minutes: values.duration_minutes.trim() ? Number(values.duration_minutes) : null,
      summary: values.summary.trim() || null,
      next_steps: values.next_steps.trim() || null,
      created_by: user.id,
    });
    if (!error) refetch();
    return { error: error?.message ?? null };
  };

  const deleteCall = async (id: string) => {
    const { error } = await supabase.from('calls').delete().eq('id', id);
    if (!error) refetch();
    return { error: error?.message ?? null };
  };

  return { calls, loading, logCall, deleteCall };
}
