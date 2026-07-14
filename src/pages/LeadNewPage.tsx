import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import { useCurrentOrg } from '../hooks/useCurrentOrg';
import { LeadForm } from '../components/leads/LeadForm';
import { Spinner } from '../components/ui/Spinner';
import type { LeadFormValues } from '../types/lead';

export function LeadNewPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { orgId, loading } = useCurrentOrg();

  const handleSubmit = async (values: LeadFormValues) => {
    const { error } = await supabase.from('leads').insert({
      owner_id: user!.id,
      org_id: orgId,
      name: values.name.trim(),
      phone: values.phone.trim() || null,
      email: values.email.trim() || null,
      city: values.city.trim() || null,
      company: values.company.trim() || null,
      website_url: values.website_url.trim() || null,
      price: values.price.trim() ? Number(values.price) : null,
      status: values.status,
      notes: values.notes.trim() || null,
    });

    if (error) {
      toast.error('יצירת הליד נכשלה');
      return;
    }

    toast.success('הליד נוצר בהצלחה');
    navigate('/leads');
  };

  return (
    <div className="mx-auto max-w-lg rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">ליד חדש</h2>
      {loading ? (
        <Spinner />
      ) : (
        <LeadForm submitLabel="יצירה" onSubmit={handleSubmit} onCancel={() => navigate('/leads')} />
      )}
    </div>
  );
}
