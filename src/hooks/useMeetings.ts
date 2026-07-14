import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useCurrentOrg } from './useCurrentOrg';
import type { Meeting, MeetingFormValues } from '../types/meeting';

const DEFAULT_DURATION_MINUTES = 30;

export function useMeetings(leadId: string | undefined) {
  const { orgId } = useCurrentOrg();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    if (!leadId) return;
    let cancelled = false;
    setLoading(true);

    supabase
      .from('meetings')
      .select('*')
      .eq('lead_id', leadId)
      .order('starts_at', { ascending: false })
      .then(({ data }) => {
        if (cancelled) return;
        setMeetings(data ?? []);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [leadId, reloadKey]);

  const createMeeting = async (values: MeetingFormValues) => {
    if (!leadId || !orgId) return { error: 'missing lead or organization' };
    const startsAt = new Date(values.starts_at);
    const endsAt = new Date(startsAt.getTime() + DEFAULT_DURATION_MINUTES * 60 * 1000);

    const { error } = await supabase.from('meetings').insert({
      lead_id: leadId,
      org_id: orgId,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      status: values.status,
      notes: values.notes.trim() || null,
    });

    if (!error) refetch();
    return { error: error?.message ?? null };
  };

  const updateMeeting = async (id: string, values: MeetingFormValues) => {
    const startsAt = new Date(values.starts_at);
    const endsAt = new Date(startsAt.getTime() + DEFAULT_DURATION_MINUTES * 60 * 1000);

    const { error } = await supabase
      .from('meetings')
      .update({
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        status: values.status,
        notes: values.notes.trim() || null,
      })
      .eq('id', id);

    if (!error) refetch();
    return { error: error?.message ?? null };
  };

  const deleteMeeting = async (id: string) => {
    const { error } = await supabase.from('meetings').delete().eq('id', id);
    if (!error) refetch();
    return { error: error?.message ?? null };
  };

  return { meetings, loading, createMeeting, updateMeeting, deleteMeeting };
}
