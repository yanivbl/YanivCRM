import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { TextField } from '../ui/TextField';
import { Button } from '../ui/Button';
import { isPasswordPwned } from '../../utils/pwnedPassword';

export function ResetPasswordForm() {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('הסיסמה חייבת להכיל לפחות 6 תווים');
      return;
    }
    if (password !== confirmPassword) {
      setError('הסיסמאות אינן תואמות');
      return;
    }

    setSubmitting(true);

    try {
      if (await isPasswordPwned(password)) {
        setSubmitting(false);
        setError('הסיסמה הזו נחשפה בעבר בדליפות מידע. בחר/י סיסמה אחרת.');
        return;
      }
    } catch {
      // ignore — proceed with the reset
    }

    const { error } = await updatePassword(password);
    setSubmitting(false);

    if (error) {
      setError('עדכון הסיסמה נכשל. ייתכן שהקישור פג תוקף — נסה/י לבקש קישור חדש.');
      return;
    }

    toast.success('הסיסמה עודכנה בהצלחה');
    navigate('/', { replace: true });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <TextField
        label="סיסמה חדשה"
        type="password"
        name="password"
        autoComplete="new-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <TextField
        label="אימות סיסמה"
        type="password"
        name="confirmPassword"
        autoComplete="new-password"
        required
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={submitting}>
        {submitting ? 'מעדכן...' : 'עדכון סיסמה'}
      </Button>
    </form>
  );
}
