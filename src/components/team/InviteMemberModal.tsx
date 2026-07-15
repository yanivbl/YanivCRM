import { useState } from 'react';
import toast from 'react-hot-toast';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { TextField } from '../ui/TextField';
import { Select } from '../ui/Select';
import { supabase } from '../../lib/supabaseClient';
import { INVITABLE_ROLES, ROLE_LABELS, type Role } from '../../types/organization';

interface InviteMemberModalProps {
  onClose: () => void;
  onInvited: () => void;
}

export function InviteMemberModal({ onClose, onInvited }: InviteMemberModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('member');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const { data, error: invokeError } = await supabase.functions.invoke('invite-member', {
      body: { email, role },
    });

    setSubmitting(false);

    if (invokeError || data?.error) {
      setError(data?.error ?? 'שליחת ההזמנה נכשלה');
      return;
    }

    toast.success('ההזמנה נשלחה בהצלחה');
    onInvited();
    onClose();
  };

  return (
    <Modal title="הזמנת חבר צוות" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextField
          label="כתובת אימייל"
          type="email"
          dir="ltr"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Select label="תפקיד" value={role} onChange={(e) => setRole(e.target.value as Role)}>
          {INVITABLE_ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </Select>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-3">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'שולח...' : 'שלח הזמנה'}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            ביטול
          </Button>
        </div>
      </form>
    </Modal>
  );
}
