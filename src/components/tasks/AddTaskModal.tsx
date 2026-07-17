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
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (Boolean(dueDate) !== Boolean(dueTime)) {
      setError('יש לבחור גם תאריך וגם שעה, או להשאיר את שניהם ריקים');
      return;
    }

    setError('');
    setSubmitting(true);

    const dueAt = dueDate && dueTime ? new Date(`${dueDate}T${dueTime}`).toISOString() : null;

    const { error: insertError } = await supabase.from('tasks').insert({
      org_id: lead.org_id,
      lead_id: lead.id,
      title: title.trim(),
      description: description.trim() || null,
      priority,
      due_at: dueAt,
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
    <Modal title={`משימה חדשה עבור ${lead.name}`} onClose={onClose} size="md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextField
          label="כותרת *"
          name="title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="flex flex-col gap-1">
          <label htmlFor="task-description" className="text-sm font-medium text-gray-700">
            תיאור
          </label>
          <textarea
            id="task-description"
            rows={3}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <Select label="עדיפות" name="priority" value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
          {PRIORITY_OPTIONS.map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABELS[p]}
            </option>
          ))}
        </Select>
        <div className="flex gap-3">
          <div className="flex-1">
            <TextField
              label="תאריך יעד"
              name="dueDate"
              type="date"
              dir="ltr"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div className="w-32">
            <TextField
              label="שעה"
              name="dueTime"
              type="time"
              dir="ltr"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
            />
          </div>
        </div>
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
