import { useState, type FormEvent } from 'react';
import { TextField } from '../ui/TextField';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { MEETING_STATUS_LABELS, MEETING_STATUS_OPTIONS, type MeetingFormValues, type MeetingStatus } from '../../types/meeting';

interface MeetingFormProps {
  initialValues?: MeetingFormValues;
  submitLabel: string;
  onSubmit: (values: MeetingFormValues) => Promise<void>;
  onCancel: () => void;
}

export function MeetingForm({ initialValues, submitLabel, onSubmit, onCancel }: MeetingFormProps) {
  const [initialDate = '', initialTime = ''] = initialValues?.starts_at ? initialValues.starts_at.split('T') : [];
  // Date and time are independent state, not derived by splitting a combined
  // string each render — deriving them meant each field's onChange had to
  // read the OTHER field's value out of that render's closure to recombine
  // them, which goes stale if React hasn't re-rendered between the two
  // fields being filled (a real, CI-only failure: a fast local run never hit
  // it, but a busier/slower runner did, silently dropping one part and
  // failing this form's own "both required" check).
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState(initialTime);
  const [status, setStatus] = useState<MeetingStatus>(initialValues?.status ?? 'scheduled');
  const [notes, setNotes] = useState(initialValues?.notes ?? '');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!date || !time) {
      setError('יש לבחור תאריך ושעה');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({ starts_at: `${date}T${time}`, status, notes });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="flex gap-3">
        <div className="flex-1">
          <TextField
            label="תאריך"
            name="starts_at_date"
            type="date"
            dir="ltr"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            error={error ?? undefined}
          />
        </div>
        <div className="w-32">
          <TextField
            label="שעה"
            name="starts_at_time"
            type="time"
            dir="ltr"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
      </div>
      <Select
        label="סטטוס פגישה"
        name="status"
        value={status}
        onChange={(e) => setStatus(e.target.value as MeetingStatus)}
      >
        {MEETING_STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {MEETING_STATUS_LABELS[s]}
          </option>
        ))}
      </Select>
      <div className="flex flex-col gap-1">
        <label htmlFor="meeting-notes" className="text-sm font-medium text-gray-700">
          הערות לפגישה
        </label>
        <textarea
          id="meeting-notes"
          rows={3}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'שומר...' : submitLabel}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          ביטול
        </Button>
      </div>
    </form>
  );
}
