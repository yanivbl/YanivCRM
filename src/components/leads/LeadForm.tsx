import { useState, type FormEvent } from 'react';
import { TextField } from '../ui/TextField';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { validateLeadForm, type LeadFormErrors } from '../../utils/validators';
import { STATUS_LABELS, STATUS_OPTIONS, type LeadFormValues } from '../../types/lead';

interface LeadFormProps {
  initialValues?: LeadFormValues;
  submitLabel: string;
  onSubmit: (values: LeadFormValues) => Promise<void>;
  onCancel: () => void;
}

const EMPTY_VALUES: LeadFormValues = {
  name: '',
  phone: '',
  email: '',
  city: '',
  company: '',
  website_url: '',
  price: '',
  status: 'new',
  notes: '',
};

export function LeadForm({ initialValues, submitLabel, onSubmit, onCancel }: LeadFormProps) {
  const [values, setValues] = useState<LeadFormValues>(initialValues ?? EMPTY_VALUES);
  const [errors, setErrors] = useState<LeadFormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const setField = <K extends keyof LeadFormValues>(field: K, value: LeadFormValues[K]) => {
    setValues((v) => ({ ...v, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationErrors = validateLeadForm(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

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
        label="שם ליד"
        name="name"
        value={values.name}
        onChange={(e) => setField('name', e.target.value)}
        error={errors.name}
      />
      <TextField
        label="טלפון ליד"
        name="phone"
        dir="ltr"
        value={values.phone}
        onChange={(e) => setField('phone', e.target.value)}
        error={errors.phone}
      />
      <TextField
        label="אימייל ליד"
        name="email"
        type="email"
        dir="ltr"
        value={values.email}
        onChange={(e) => setField('email', e.target.value)}
        error={errors.email}
      />
      <TextField
        label="עיר ליד"
        name="city"
        value={values.city}
        onChange={(e) => setField('city', e.target.value)}
      />
      <TextField
        label="חברת הליד"
        name="company"
        value={values.company}
        onChange={(e) => setField('company', e.target.value)}
      />
      <TextField
        label="אתר הליד"
        name="website_url"
        type="url"
        dir="ltr"
        placeholder="https://example.com"
        value={values.website_url}
        onChange={(e) => setField('website_url', e.target.value)}
        error={errors.website_url}
      />
      <TextField
        label="מחיר ליד"
        name="price"
        type="number"
        dir="ltr"
        min="0"
        step="0.01"
        value={values.price}
        onChange={(e) => setField('price', e.target.value)}
        error={errors.price}
      />
      <Select
        label="סטטוס ליד"
        name="status"
        value={values.status}
        onChange={(e) => setField('status', e.target.value as LeadFormValues['status'])}
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </Select>
      <div className="flex flex-col gap-1">
        <label htmlFor="notes" className="text-sm font-medium text-gray-700">
          הערות
        </label>
        <textarea
          id="notes"
          name="notes"
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
