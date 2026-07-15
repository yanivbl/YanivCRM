import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { ActivityLogEntry } from '../types/activity';

export interface OrgActivityLogEntry extends ActivityLogEntry {
  lead_name: string | null;
  actor_name: string | null;
  target_name: string | null;
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

    const actorIds = (rows ?? []).map((r) => r.actor_id).filter((id): id is string => Boolean(id));
    const targetIds = (rows ?? [])
      .map((r) => r.details?.target_user_id as string | undefined)
      .filter((id): id is string => Boolean(id));
    const profileIds = [...new Set([...actorIds, ...targetIds])];
    const { data: profiles } =
      profileIds.length > 0
        ? await supabase.from('profiles').select('id, full_name').in('id', profileIds)
        : { data: [] };
    const nameById = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));

    setEntries(
      (rows ?? []).map((row: any) => ({
        ...row,
        lead_name: row.leads?.name ?? null,
        actor_name: row.actor_id ? nameById.get(row.actor_id) ?? null : null,
        target_name: row.details?.target_user_id ? nameById.get(row.details.target_user_id) ?? null : null,
      }))
    );
    setLoading(false);
  }, [orgId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { entries, loading, refetch };
}
