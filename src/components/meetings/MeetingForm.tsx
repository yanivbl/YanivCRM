import { useState, type FormEvent } from 'react';
import { TextField } from '../ui/TextField';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { MEETING_STATUS_LABELS, MEETING_STATUS_OPTIONS, type MeetingFormValues } from '../../types/meeting';

interface MeetingFormProps {
  initialValues?: MeetingFormValues;
  submitLabel: string;
  onSubmit: (values: MeetingFormValues) => Promise<void>;
  onCancel: () => void;
}

const EMPTY_VALUES: MeetingFormValues = {
  starts_at: '',
  status: 'scheduled',
  notes: '',
};

export function MeetingForm({ initialValues, submitLabel, onSubmit, onCancel }: MeetingFormProps) {
  const [values, setValues] = useState<MeetingFormValues>(initialValues ?? EMPTY_VALUES);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const setField = <K extends keyof MeetingFormValues>(field: K, value: MeetingFormValues[K]) => {
    setValues((v) => ({ ...v, [field]: value }));
  };

  // A native <input type="datetime-local"> only fires onChange once BOTH the
  // date and the time are set — its picker has no explicit "confirm" step, so
  // picking just a date (without also scrolling to a time) silently does
  // nothing, which reads as "there's no way to confirm". Two plain date/time
  // inputs each commit on their own and are far less ambiguous.
  const [datePart, timePart] = values.starts_at ? values.starts_at.split('T') : ['', ''];

  const setDatePart = (date: string) => setField('starts_at', date ? `${date}T${timePart || '09:00'}` : '');
  const setTimePart = (time: string) => setField('starts_at', datePart ? `${datePart}T${time}` : '');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!values.starts_at || !datePart || !timePart) {
      setError('יש לבחור תאריך ושעה');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(values);
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
            value={datePart}
            onChange={(e) => setDatePart(e.target.value)}
            error={error ?? undefined}
          />
        </div>
        <div className="w-32">
          <TextField
            label="שעה"
            name="starts_at_time"
            type="time"
            dir="ltr"
            value={timePart}
            onChange={(e) => setTimePart(e.target.value)}
          />
        </div>
      </div>
      <Select
        label="סטטוס פגישה"
        name="status"
        value={values.status}
        onChange={(e) => setField('status', e.target.value as MeetingFormValues['status'])}
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
          value={values.notes}
          onChange={(e) => setField('notes', e.target.value)}
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
