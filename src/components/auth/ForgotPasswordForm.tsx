import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { TextField } from '../ui/TextField';
import { Button } from '../ui/Button';

export function ForgotPasswordForm() {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error } = await sendPasswordReset(email);
    setSubmitting(false);

    // Always show success, even on failure: don't let this endpoint reveal
    // whether an email address has an account.
    if (error) console.error(error);
    setSent(true);
  };

  if (sent) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p className="text-sm text-gray-600">
          אם קיים חשבון עבור <span dir="ltr">{email}</span>, נשלח אליו קישור לאיפוס הסיסמה.
        </p>
        <Link to="/login" className="text-sm font-medium text-blue-600 hover:underline">
          חזרה להתחברות
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <TextField
        label="אימייל"
        type="email"
        name="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      {error && <p className="text-sm text-red-600">שליחת הקישור נכשלה, נסה שוב</p>}
      <Button type="submit" disabled={submitting}>
        {submitting ? 'שולח...' : 'שליחת קישור לאיפוס'}
      </Button>
    </form>
  );
}
