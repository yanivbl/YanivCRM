import { useState, type FormEvent } from 'react';
import { TextField } from '../ui/TextField';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { toDateTimeLocal } from '../../utils/formatters';
import { DIRECTION_LABELS, DIRECTION_OPTIONS, type CallDirection, type CallFormValues } from '../../types/call';

interface CallFormProps {
  onSubmit: (values: CallFormValues) => Promise<void>;
  onCancel: () => void;
}

export function CallForm({ onSubmit, onCancel }: CallFormProps) {
  // Defaults to "now" — a call gets logged right after it happens, unlike a
  // meeting which is scheduled ahead of time. Date and time are independent
  // state from the start (not derived by splitting a combined string each
  // render) — see MeetingForm for why that shape is a real bug: each field's
  // onChange would need to read the OTHER field out of a render closure that
  // can go stale between two fast form fills.
  const [nowDate, nowTime] = toDateTimeLocal(new Date().toISOString()).split('T');
  const [direction, setDirection] = useState<CallDirection>('outgoing');
  const [date, setDate] = useState(nowDate);
  const [time, setTime] = useState(nowTime);
  const [durationMinutes, setDurationMinutes] = useState('');
  const [summary, setSummary] = useState('');
  const [nextSteps, setNextSteps] = useState('');
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
      await onSubmit({
        direction,
        called_at: `${date}T${time}`,
        duration_minutes: durationMinutes,
        summary,
        next_steps: nextSteps,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <Select label="כיוון השיחה" name="direction" value={direction} onChange={(e) => setDirection(e.target.value as CallDirection)}>
        {DIRECTION_OPTIONS.map((d) => (
          <option key={d} value={d}>
            {DIRECTION_LABELS[d]}
          </option>
        ))}
      </Select>
      <div className="flex gap-3">
        <div className="flex-1">
          <TextField
            label="תאריך"
            name="called_at_date"
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
            name="called_at_time"
            type="time"
            dir="ltr"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
        <div className="w-28">
          <TextField
            label="משך (דק')"
            name="durationMinutes"
            type="number"
            min="0"
            dir="ltr"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
          />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="call-summary" className="text-sm font-medium text-gray-700">
          תוכן השיחה
        </label>
        <textarea
          id="call-summary"
          rows={3}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
      </div>
      <TextField
        label="שלב הבא"
        name="nextSteps"
        value={nextSteps}
        onChange={(e) => setNextSteps(e.target.value)}
      />

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'שומר...' : 'תיעוד שיחה'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          ביטול
        </Button>
      </div>
    </form>
  );
}
