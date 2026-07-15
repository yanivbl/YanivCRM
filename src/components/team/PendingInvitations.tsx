import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabaseClient';
import { formatDate } from '../../utils/formatters';
import { ROLE_LABELS, type Invitation } from '../../types/organization';

interface PendingInvitationsProps {
  invitations: Invitation[];
  canManage: boolean;
  onChanged: () => void;
}

export function PendingInvitations({ invitations, canManage, onChanged }: PendingInvitationsProps) {
  if (invitations.length === 0) return null;

  const handleCancel = async (invitation: Invitation) => {
    const { error } = await supabase.from('invitations').delete().eq('id', invitation.id);
    if (error) {
      toast.error('ביטול ההזמנה נכשל');
      return;
    }
    toast.success('ההזמנה בוטלה');
    onChanged();
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">הזמנות ממתינות</h3>
      <ul className="flex flex-col gap-3">
        {invitations.map((invitation) => (
          <li key={invitation.id} className="flex items-center justify-between gap-3 text-sm">
            <div>
              <span className="font-medium text-gray-900" dir="ltr">
                {invitation.email}
              </span>
              <span className="ms-2 text-xs text-gray-400">
                {ROLE_LABELS[invitation.role]} · נשלח ב-{formatDate(invitation.created_at)}
              </span>
            </div>
            {canManage && (
              <button
                type="button"
                onClick={() => handleCancel(invitation)}
                className="shrink-0 text-xs font-medium text-red-600 hover:text-red-700"
              >
                ביטול
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
