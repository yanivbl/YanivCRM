import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { TextField } from '../ui/TextField';
import { Button } from '../ui/Button';
import { isPasswordPwned } from '../../utils/pwnedPassword';

export function RegisterForm() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('הסיסמה חייבת להכיל לפחות 6 תווים');
      return;
    }

    setSubmitting(true);

    // Supabase's built-in leaked-password check requires a Pro plan; this
    // replicates it client-side against the free HaveIBeenPwned API. Fail
    // open on network errors — an HIBP outage shouldn't block registration.
    try {
      if (await isPasswordPwned(password)) {
        setSubmitting(false);
        setError('הסיסמה הזו נחשפה בעבר בדליפות מידע. בחר/י סיסמה אחרת.');
        return;
      }
    } catch {
      // ignore — proceed with registration
    }

    const { error } = await signUp(email, password, fullName);
    setSubmitting(false);

    if (error) {
      setError(
        error.toLowerCase().includes('already registered')
          ? 'כתובת האימייל כבר רשומה במערכת'
          : 'ההרשמה נכשלה, נסה שוב'
      );
      return;
    }

    toast.success('נרשמת בהצלחה');
    navigate('/', { replace: true });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <TextField
        label="שם מלא"
        type="text"
        name="fullName"
        autoComplete="name"
        required
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
      />
      <TextField
        label="אימייל"
        type="email"
        name="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        label="סיסמה"
        type="password"
        name="password"
        autoComplete="new-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={submitting}>
        {submitting ? 'נרשם...' : 'הרשמה'}
      </Button>
    </form>
  );
}
