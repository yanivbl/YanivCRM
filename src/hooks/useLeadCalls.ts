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
      transcript: values.transcript.trim() || null,
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

  // Uploads to Storage, then invokes transcribe-call (Whisper + Claude
  // analysis) and waits for it to finish — both steps report their own error
  // separately, since a caller needs to know which one actually failed.
  const uploadRecording = async (call: Call, file: File) => {
    // Storage keys must stay ASCII-safe — embedding the original filename
    // breaks when it contains Hebrew or other non-ASCII characters (Supabase
    // Storage rejected it as "Invalid key"), so only the extension survives.
    const extMatch = /\.([a-zA-Z0-9]+)$/.exec(file.name);
    const ext = extMatch ? extMatch[1].toLowerCase() : 'dat';
    const path = `${orgId}/${call.id}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from('call-recordings').upload(path, file, {
      contentType: file.type || 'audio/mpeg',
    });
    if (uploadError) return { error: uploadError.message };

    const { error: updateError } = await supabase.from('calls').update({ audio_url: path }).eq('id', call.id);
    if (updateError) return { error: updateError.message };
    refetch();

    return retryTranscription(call.id);
  };

  // Re-invokes transcription for a call that already has audio uploaded —
  // used both right after upload and for the "retry" action on a failed one.
  const retryTranscription = async (callId: string) => {
    const { data, error: invokeError } = await supabase.functions.invoke('transcribe-call', {
      body: { call_id: callId },
    });
    refetch();
    if (invokeError || data?.error) return { error: data?.error ?? invokeError?.message ?? 'Transcription failed' };
    return { error: null };
  };

  return { calls, loading, logCall, deleteCall, uploadRecording, retryTranscription };
}
