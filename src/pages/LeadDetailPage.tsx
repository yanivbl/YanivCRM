import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';
import { useLead } from '../hooks/useLead';
import { LeadDetailCard } from '../components/leads/LeadDetailCard';
import { LeadTasks } from '../components/tasks/LeadTasks';
import { LeadNotes } from '../components/leads/LeadNotes';
import { LeadMeetings } from '../components/meetings/LeadMeetings';
import { LeadWebsiteAnalysis } from '../components/analysis/LeadWebsiteAnalysis';
import { LeadActivityLog } from '../components/activity/LeadActivityLog';
import { DeleteLeadDialog } from '../components/leads/DeleteLeadDialog';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';

export function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { lead, loading } = useLead(id);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (loading) return <Spinner />;

  if (!lead) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-gray-500">הליד לא נמצא.</p>
        <Link to="/leads" className="text-blue-600 hover:underline">
          חזרה לרשימת הלידים
        </Link>
      </div>
    );
  }

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    const { error } = await supabase.from('leads').delete().eq('id', lead.id);
    setDeleting(false);
    if (error) {
      toast.error('מחיקת הליד נכשלה');
      return;
    }
    toast.success('הליד נמחק בהצלחה');
    navigate('/leads');
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <LeadDetailCard lead={lead} />
      <div className="flex gap-3">
        <Link to={`/leads/${lead.id}/edit`}>
          <Button variant="secondary">עריכה</Button>
        </Link>
        <Button variant="danger" onClick={() => setShowDelete(true)}>
          מחיקה
        </Button>
        <Link to="/leads" className="ms-auto self-center text-sm text-gray-500 hover:underline">
          חזרה לרשימה
        </Link>
      </div>

      <LeadWebsiteAnalysis leadId={lead.id} defaultUrl={lead.website_url} />
      <LeadTasks lead={lead} />
      <LeadMeetings leadId={lead.id} />
      <LeadNotes leadId={lead.id} />
      <LeadActivityLog leadId={lead.id} />

      {showDelete && (
        <DeleteLeadDialog
          leadName={lead.name}
          deleting={deleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDelete(false)}
        />
      )}
    </div>
  );
}
