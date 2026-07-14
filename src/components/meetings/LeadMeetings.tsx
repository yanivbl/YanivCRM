import { useState } from 'react';
import toast from 'react-hot-toast';
import { useMeetings } from '../../hooks/useMeetings';
import { formatDate, toDateTimeLocal } from '../../utils/formatters';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { Modal } from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { MeetingStatusBadge } from './MeetingStatusBadge';
import { MeetingForm } from './MeetingForm';
import type { Meeting, MeetingFormValues } from '../../types/meeting';

export function LeadMeetings({ leadId }: { leadId: string }) {
  const { meetings, loading, createMeeting, updateMeeting, deleteMeeting } = useMeetings(leadId);
  const [showCreate, setShowCreate] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [deletingMeeting, setDeletingMeeting] = useState<Meeting | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleCreate = async (values: MeetingFormValues) => {
    const { error } = await createMeeting(values);
    if (error) {
      toast.error('יצירת הפגישה נכשלה');
      return;
    }
    toast.success('הפגישה נוצרה בהצלחה');
    setShowCreate(false);
  };

  const handleUpdate = async (values: MeetingFormValues) => {
    if (!editingMeeting) return;
    const { error } = await updateMeeting(editingMeeting.id, values);
    if (error) {
      toast.error('עדכון הפגישה נכשל');
      return;
    }
    toast.success('הפגישה עודכנה בהצלחה');
    setEditingMeeting(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingMeeting) return;
    setDeleting(true);
    const { error } = await deleteMeeting(deletingMeeting.id);
    setDeleting(false);
    if (error) {
      toast.error('מחיקת הפגישה נכשלה');
      return;
    }
    toast.success('הפגישה נמחקה');
    setDeletingMeeting(null);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">פגישות</h3>
        <Button onClick={() => setShowCreate(true)}>+ פגישה חדשה</Button>
      </div>

      {loading ? (
        <Spinner />
      ) : meetings.length === 0 ? (
        <p className="text-sm text-gray-400">אין עדיין פגישות עבור הליד הזה.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {meetings.map((meeting) => (
            <li
              key={meeting.id}
              className="flex flex-col gap-2 rounded-lg border border-gray-100 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">{formatDate(meeting.starts_at)}</p>
                {meeting.notes && <p className="mt-1 text-sm text-gray-500">{meeting.notes}</p>}
                {meeting.cal_com_booking_uid && (
                  <p className="mt-1 text-xs text-gray-400">נקבעה דרך Cal.com</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <MeetingStatusBadge status={meeting.status} />
                <button
                  type="button"
                  onClick={() => setEditingMeeting(meeting)}
                  className="text-xs text-gray-600 hover:underline"
                >
                  עריכה
                </button>
                <button
                  type="button"
                  onClick={() => setDeletingMeeting(meeting)}
                  className="text-xs text-red-600 hover:underline"
                >
                  מחיקה
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showCreate && (
        <Modal title="פגישה חדשה" onClose={() => setShowCreate(false)}>
          <MeetingForm submitLabel="יצירה" onSubmit={handleCreate} onCancel={() => setShowCreate(false)} />
        </Modal>
      )}

      {editingMeeting && (
        <Modal title="עריכת פגישה" onClose={() => setEditingMeeting(null)}>
          <MeetingForm
            initialValues={{
              starts_at: toDateTimeLocal(editingMeeting.starts_at),
              status: editingMeeting.status,
              notes: editingMeeting.notes ?? '',
            }}
            submitLabel="שמירה"
            onSubmit={handleUpdate}
            onCancel={() => setEditingMeeting(null)}
          />
        </Modal>
      )}

      {deletingMeeting && (
        <ConfirmDialog
          title="מחיקת פגישה"
          message="האם אתה בטוח שברצונך למחוק את הפגישה? פעולה זו אינה הפיכה."
          confirmLabel="כן, מחק"
          loading={deleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingMeeting(null)}
        />
      )}
    </div>
  );
}
