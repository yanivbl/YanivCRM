import { useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { TextField } from '../ui/TextField';
import { Select } from '../ui/Select';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../hooks/useAuth';
import { PRIORITY_LABELS, PRIORITY_OPTIONS, type TaskPriority } from '../../types/task';
import type { Lead } from '../../types/lead';

interface AddTaskModalProps {
  lead: Lead;
  onClose: () => void;
  onCreated: () => void;
}

export function AddTaskModal({ lead, onClose, onCreated }: AddTaskModalProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError('');
    setSubmitting(true);

    const { error: insertError } = await supabase.from('tasks').insert({
      org_id: lead.org_id,
      lead_id: lead.id,
      title: title.trim(),
      priority,
      due_date: dueDate || null,
      created_by: user.id,
      assignee_id: user.id,
    });

    setSubmitting(false);

    if (insertError) {
      setError('הוספת המשימה נכשלה');
      return;
    }

    toast.success('המשימה נוספה');
    onCreated();
    onClose();
  };

  return (
    <Modal title={`משימה חדשה עבור ${lead.name}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextField
          label="כותרת המשימה"
          name="title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Select label="עדיפות" name="priority" value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
          {PRIORITY_OPTIONS.map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABELS[p]}
            </option>
          ))}
        </Select>
        <TextField
          label="תאריך יעד"
          name="dueDate"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-3">
          <Button type="submit" disabled={submitting || !title.trim()}>
            {submitting ? 'מוסיף...' : 'הוספת משימה'}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            ביטול
          </Button>
        </div>
      </form>
    </Modal>
  );
}
