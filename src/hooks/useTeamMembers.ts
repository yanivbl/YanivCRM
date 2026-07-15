import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { TeamMember } from '../types/organization';

export function useTeamMembers(orgId: string | null) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!orgId) {
      setMembers([]);
      setLoading(false);
      return;
    }
    setLoading(true);

    const { data: memberships } = await supabase
      .from('memberships')
      .select('id, org_id, user_id, role, created_at')
      .eq('org_id', orgId)
      .order('created_at', { ascending: true });

    if (!memberships || memberships.length === 0) {
      setMembers([]);
      setLoading(false);
      return;
    }

    // memberships and profiles both reference auth.users independently (no direct FK
    // between them), so PostgREST can't embed one through the other — merge client-side.
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in(
        'id',
        memberships.map((m) => m.user_id)
      );

    const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));
    setMembers(
      memberships.map((m) => ({
        ...m,
        full_name: profileById.get(m.user_id)?.full_name ?? null,
        email: profileById.get(m.user_id)?.email ?? '',
      }))
    );
    setLoading(false);
  }, [orgId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { members, loading, refetch };
}
