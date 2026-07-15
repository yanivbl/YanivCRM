import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { ActivityLogEntry } from '../types/activity';

export interface OrgActivityLogEntry extends ActivityLogEntry {
  lead_name: string | null;
  actor_name: string | null;
}

const PAGE_SIZE = 50;

export function useOrgActivityLog(orgId: string | null) {
  const [entries, setEntries] = useState<OrgActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!orgId) {
      setEntries([]);
      setLoading(false);
      return;
    }
    setLoading(true);

    const { data: rows } = await supabase
      .from('activity_log')
      .select('*, leads(name)')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
      .limit(PAGE_SIZE);

    const actorIds = [...new Set((rows ?? []).map((r) => r.actor_id).filter((id): id is string => Boolean(id)))];
    const { data: profiles } =
      actorIds.length > 0
        ? await supabase.from('profiles').select('id, full_name').in('id', actorIds)
        : { data: [] };
    const nameByActorId = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));

    setEntries(
      (rows ?? []).map((row: any) => ({
        ...row,
        lead_name: row.leads?.name ?? null,
        actor_name: row.actor_id ? nameByActorId.get(row.actor_id) ?? null : null,
      }))
    );
    setLoading(false);
  }, [orgId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { entries, loading, refetch };
}
