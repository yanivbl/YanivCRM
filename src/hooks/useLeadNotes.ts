import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './useAuth';
import type { LeadNote } from '../types/note';

export function useLeadNotes(leadId: string | undefined) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<LeadNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    if (!leadId) return;
    let cancelled = false;
    setLoading(true);

    supabase
      .from('lead_notes')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (cancelled) return;
        setNotes(data ?? []);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [leadId, reloadKey]);

  const addNote = async (body: string) => {
    if (!leadId || !user) return { error: 'missing lead or user' };
    setSubmitting(true);
    const { error } = await supabase
      .from('lead_notes')
      .insert({ lead_id: leadId, author_id: user.id, body });
    setSubmitting(false);
    if (!error) refetch();
    return { error: error?.message ?? null };
  };

  return { notes, loading, submitting, addNote };
}
