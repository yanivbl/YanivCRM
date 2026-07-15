import { useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabaseClient';
import { formatDate } from '../../utils/formatters';
import { ROLE_LABELS, INVITABLE_ROLES, type Role, type TeamMember } from '../../types/organization';
import { Select } from '../ui/Select';
import { ConfirmDialog } from '../ui/ConfirmDialog';

interface TeamMembersListProps {
  members: TeamMember[];
  currentUserId: string;
  canManage: boolean;
  onChanged: () => void;
}

export function TeamMembersList({ members, currentUserId, canManage, onChanged }: TeamMembersListProps) {
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);
  const [removing, setRemoving] = useState(false);

  const handleRoleChange = async (member: TeamMember, newRole: Role) => {
    const { error } = await supabase.from('memberships').update({ role: newRole }).eq('id', member.id);
    if (error) {
      toast.error(error.message || 'עדכון התפקיד נכשל');
      return;
    }
    toast.success('התפקיד עודכן');
    onChanged();
  };

  const handleRemoveConfirm = async () => {
    if (!memberToRemove) return;
    setRemoving(true);
    const { error } = await supabase.from('memberships').delete().eq('id', memberToRemove.id);
    setRemoving(false);
    if (error) {
      toast.error(error.message || 'הסרת החבר נכשלה');
      setMemberToRemove(null);
      return;
    }
    toast.success('חבר הצוות הוסר');
    setMemberToRemove(null);
    onChanged();
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-start text-xs font-medium text-gray-500">
            <th className="px-4 py-3 text-start">שם</th>
            <th className="px-4 py-3 text-start">אימייל</th>
            <th className="px-4 py-3 text-start">תפקיד</th>
            <th className="px-4 py-3 text-start">הצטרפות</th>
            {canManage && <th className="px-4 py-3 text-start">פעולות</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {members.map((member) => {
            const isSelf = member.user_id === currentUserId;
            const canEditThisRow = canManage && member.role !== 'owner' && !isSelf;
            return (
              <tr key={member.id}>
                <td className="px-4 py-3 font-medium text-gray-900">
                  {member.full_name || '—'}
                  {isSelf && <span className="ms-2 text-xs text-gray-400">(את/ה)</span>}
                </td>
                <td className="px-4 py-3 text-gray-600" dir="ltr">
                  {member.email}
                </td>
                <td className="px-4 py-3">
                  {canEditThisRow ? (
                    <Select
                      aria-label="שינוי תפקיד"
                      value={member.role}
                      onChange={(e) => handleRoleChange(member, e.target.value as Role)}
                      className="py-1 text-xs"
                    >
                      {INVITABLE_ROLES.map((r) => (
                        <option key={r} value={r}>
                          {ROLE_LABELS[r]}
                        </option>
                      ))}
                    </Select>
                  ) : (
                    <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                      {ROLE_LABELS[member.role]}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-400">{formatDate(member.created_at)}</td>
                {canManage && (
                  <td className="px-4 py-3">
                    {member.role !== 'owner' && !isSelf && (
                      <button
                        type="button"
                        onClick={() => setMemberToRemove(member)}
                        className="text-xs font-medium text-red-600 hover:text-red-700"
                      >
                        הסרה
                      </button>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>

      {memberToRemove && (
        <ConfirmDialog
          title="הסרת חבר צוות"
          message={`האם להסיר את ${memberToRemove.full_name || memberToRemove.email} מהארגון?`}
          confirmLabel="כן, הסר"
          loading={removing}
          onConfirm={handleRemoveConfirm}
          onCancel={() => setMemberToRemove(null)}
        />
      )}
    </div>
  );
}
