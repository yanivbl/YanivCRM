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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!values.starts_at) {
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
      <TextField
        label="תאריך ושעה"
        name="starts_at"
        type="datetime-local"
        dir="ltr"
        value={values.starts_at}
        onChange={(e) => setField('starts_at', e.target.value)}
        error={error ?? undefined}
      />
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
