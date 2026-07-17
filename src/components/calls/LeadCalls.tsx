import { useState } from 'react';
import { FileText, PhoneIncoming, PhoneOutgoing, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLeadCalls } from '../../hooks/useLeadCalls';
import { formatDate } from '../../utils/formatters';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { Modal } from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { CallForm } from './CallForm';
import { DIRECTION_LABELS } from '../../types/call';
import type { Call, CallFormValues } from '../../types/call';
import type { Lead } from '../../types/lead';

export function LeadCalls({ lead }: { lead: Lead }) {
  const { calls, loading, logCall, deleteCall } = useLeadCalls(lead.id, lead.org_id);
  const [showCreate, setShowCreate] = useState(false);
  const [deletingCall, setDeletingCall] = useState<Call | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleLogCall = async (values: CallFormValues) => {
    const { error } = await logCall(values);
    if (error) {
      toast.error('תיעוד השיחה נכשל');
      return;
    }
    toast.success('השיחה תועדה בהצלחה');
    setShowCreate(false);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCall) return;
    setDeleting(true);
    const { error } = await deleteCall(deletingCall.id);
    setDeleting(false);
    if (error) {
      toast.error('מחיקת השיחה נכשלה');
      return;
    }
    toast.success('השיחה נמחקה');
    setDeletingCall(null);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">שיחות</h3>
        <Button onClick={() => setShowCreate(true)}>+ תיעוד שיחה</Button>
      </div>

      {loading ? (
        <Spinner />
      ) : calls.length === 0 ? (
        <p className="text-sm text-gray-400">אין עדיין שיחות מתועדות עבור הליד הזה.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {calls.map((call) => {
            const Icon = call.direction === 'incoming' ? PhoneIncoming : PhoneOutgoing;
            return (
              <li key={call.id} className="rounded-lg border border-gray-100 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                    <Icon size={16} className="text-gray-400" />
                    {DIRECTION_LABELS[call.direction]}
                    <span className="font-normal text-gray-400">· {formatDate(call.called_at)}</span>
                    {call.duration_minutes !== null && (
                      <span className="font-normal text-gray-400">· {call.duration_minutes} דק'</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setDeletingCall(call)}
                    aria-label="מחיקת שיחה"
                    className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                {call.summary && <p className="mt-2 text-sm text-gray-600">{call.summary}</p>}
                {call.transcript && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                    <FileText size={12} />
                    כולל תמלול מלא
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {showCreate && (
        <Modal title="תיעוד שיחה" onClose={() => setShowCreate(false)} size="md">
          <CallForm onSubmit={handleLogCall} onCancel={() => setShowCreate(false)} />
        </Modal>
      )}

      {deletingCall && (
        <ConfirmDialog
          title="מחיקת שיחה"
          message="האם אתה בטוח שברצונך למחוק את תיעוד השיחה? פעולה זו אינה הפיכה."
          confirmLabel="כן, מחק"
          loading={deleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingCall(null)}
        />
      )}
    </div>
  );
}
