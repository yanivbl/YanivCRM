import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Invitation } from '../types/organization';

export function useInvitations(orgId: string | null) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!orgId) {
      setInvitations([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from('invitations')
      .select('*')
      .eq('org_id', orgId)
      .is('accepted_at', null)
      .order('created_at', { ascending: false });
    setInvitations(data ?? []);
    setLoading(false);
  }, [orgId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { invitations, loading, refetch };
}
