import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';
import { useLead } from '../hooks/useLead';
import { LeadForm } from '../components/leads/LeadForm';
import { Spinner } from '../components/ui/Spinner';
import type { LeadFormValues } from '../types/lead';

export function LeadEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { lead, loading } = useLead(id);

  if (loading) return <Spinner />;

  if (!lead) {
    return <p className="text-gray-500">הליד לא נמצא.</p>;
  }

  const initialValues: LeadFormValues = {
    name: lead.name,
    phone: lead.phone ?? '',
    email: lead.email ?? '',
    city: lead.city ?? '',
    company: lead.company ?? '',
    website_url: lead.website_url ?? '',
    price: lead.price !== null ? String(lead.price) : '',
    status: lead.status,
    notes: lead.notes ?? '',
  };

  const handleSubmit = async (values: LeadFormValues) => {
    const { error } = await supabase
      .from('leads')
      .update({
        name: values.name.trim(),
        phone: values.phone.trim() || null,
        email: values.email.trim() || null,
        city: values.city.trim() || null,
        company: values.company.trim() || null,
        website_url: values.website_url.trim() || null,
        price: values.price.trim() ? Number(values.price) : null,
        status: values.status,
        notes: values.notes.trim() || null,
      })
      .eq('id', lead.id);

    if (error) {
      toast.error('עדכון הליד נכשל');
      return;
    }

    toast.success('הליד עודכן בהצלחה');
    navigate(`/leads/${lead.id}`);
  };

  return (
    <div className="mx-auto max-w-lg rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">עריכת ליד</h2>
      <LeadForm
        initialValues={initialValues}
        submitLabel="שמירה"
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/leads/${lead.id}`)}
      />
    </div>
  );
}
