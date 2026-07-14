import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { WebsiteAnalysis } from '../types/analysis';

export function useWebsiteAnalyses(leadId: string | undefined) {
  const [analyses, setAnalyses] = useState<WebsiteAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    if (!leadId) return;
    let cancelled = false;
    setLoading(true);

    supabase
      .from('website_analyses')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (cancelled) return;
        setAnalyses(data ?? []);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [leadId, reloadKey]);

  const runAnalysis = async (url: string) => {
    setRunning(true);
    const { data, error } = await supabase.functions.invoke('ai-analyze', {
      body: { url, lead_id: leadId },
    });
    setRunning(false);
    refetch();

    if (error) return { error: error.message };
    if (data?.ok === false) return { error: data.error as string };
    return { error: null };
  };

  return { analyses, loading, running, runAnalysis };
}
