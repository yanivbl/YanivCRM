import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './useAuth';
import type { Role } from '../types/organization';

export function useCurrentOrg() {
  const { user } = useAuth();
  const [orgId, setOrgId] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(() => {
    if (!user) {
      setOrgId(null);
      setRole(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    return supabase
      .from('memberships')
      .select('org_id, role')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        setOrgId(data?.org_id ?? null);
        setRole((data?.role as Role | undefined) ?? null);
        setLoading(false);
      });
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!user) {
        if (!cancelled) {
          setOrgId(null);
          setRole(null);
          setLoading(false);
        }
        return;
      }
      setLoading(true);
      const { data } = await supabase
        .from('memberships')
        .select('org_id, role')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();
      if (cancelled) return;
      setOrgId(data?.org_id ?? null);
      setRole((data?.role as Role | undefined) ?? null);
      setLoading(false);
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const isAdmin = role === 'owner' || role === 'admin';

  return { orgId, role, isAdmin, loading, refetch };
}
