import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useLeads } from '../hooks/useLeads';
import { supabase } from '../lib/supabaseClient';
import type { Lead, LeadStatus } from '../types/lead';
import { SearchInput } from '../components/ui/SearchInput';
import { StatusFilterDropdown } from '../components/leads/StatusFilterDropdown';
import { LeadTable } from '../components/leads/LeadTable';
import { LeadCard } from '../components/leads/LeadCard';
import { EmptyLeadsState } from '../components/leads/EmptyLeadsState';
import { DeleteLeadDialog } from '../components/leads/DeleteLeadDialog';
import { SkeletonRow, SkeletonCard } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';

export function LeadsListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') ?? '';
  const status = (searchParams.get('status') as LeadStatus | '') ?? '';

  const { leads, loading, error, refetch } = useLeads(q, status);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [deleting, setDeleting] = useState(false);

  const setQuery = (value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set('q', value);
      else next.delete('q');
      return next;
    });
  };

  const setStatusFilter = (value: LeadStatus | '') => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set('status', value);
      else next.delete('status');
      return next;
    });
  };

  const handleStatusChange = async (id: string, newStatus: LeadStatus) => {
    const { error } = await supabase.from('leads').update({ status: newStatus }).eq('id', id);
    if (error) {
      toast.error('עדכון הסטטוס נכשל');
      return;
    }
    toast.success('הסטטוס עודכן');
    refetch();
  };

  const handleDeleteConfirm = async () => {
    if (!leadToDelete) return;
    setDeleting(true);
    const { error } = await supabase.from('leads').delete().eq('id', leadToDelete.id);
    setDeleting(false);
    if (error) {
      toast.error('מחיקת הליד נכשלה');
      return;
    }
    toast.success('הליד נמחק בהצלחה');
    setLeadToDelete(null);
    refetch();
  };

  const isFiltered = Boolean(q || status);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput value={q} onChange={setQuery} />
          <StatusFilterDropdown value={status} onChange={setStatusFilter} />
        </div>
        <Link to="/leads/new">
          <Button className="w-full sm:w-auto">+ ליד חדש</Button>
        </Link>
      </div>

      {error && <p className="text-sm text-red-600">שגיאה בטעינת הלידים: {error}</p>}

      {loading ? (
        <>
          <table className="hidden w-full text-sm md:table">
            <tbody>
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </tbody>
          </table>
          <div className="flex flex-col gap-3 md:hidden">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </>
      ) : leads.length === 0 ? (
        <EmptyLeadsState isFiltered={isFiltered} />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <LeadTable leads={leads} onStatusChange={handleStatusChange} onDeleteRequest={setLeadToDelete} />
          </div>
          <div className="flex flex-col gap-3 md:hidden">
            {leads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} onDeleteRequest={setLeadToDelete} />
            ))}
          </div>
        </>
      )}

      {leadToDelete && (
        <DeleteLeadDialog
          leadName={leadToDelete.name}
          deleting={deleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setLeadToDelete(null)}
        />
      )}
    </div>
  );
}
