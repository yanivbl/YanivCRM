import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Organization } from '../types/organization';

export function useOrgSettings(orgId: string | null) {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!orgId) {
      setOrganization(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase.from('organizations').select('*').eq('id', orgId).single();
    setOrganization(data);
    setLoading(false);
  }, [orgId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { organization, loading, refetch };
}
