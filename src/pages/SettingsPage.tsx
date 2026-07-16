import { useEffect, useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { useCurrentOrg } from '../hooks/useCurrentOrg';
import { useOrgSettings } from '../hooks/useOrgSettings';
import { supabase } from '../lib/supabaseClient';
import { TextField } from '../components/ui/TextField';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { EMAIL_RE } from '../utils/validators';

export function SettingsPage() {
  const { user } = useAuth();
  const { orgId, isAdmin, loading: orgLoading } = useCurrentOrg();
  const { organization, loading: settingsLoading, refetch } = useOrgSettings(orgId);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [organizerEmail, setOrganizerEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; organizerEmail?: string }>({});

  useEffect(() => {
    setFullName((user?.user_metadata?.full_name as string | undefined) ?? '');
    setEmail(user?.email ?? '');
  }, [user]);

  useEffect(() => {
    setOrganizerEmail(organization?.cal_com_organizer_email ?? '');
  }, [organization]);

  const loading = orgLoading || settingsLoading;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const nextErrors: typeof errors = {};
    if (email.trim() && !EMAIL_RE.test(email.trim())) nextErrors.email = 'כתובת אימייל לא תקינה';
    if (organizerEmail.trim() && !EMAIL_RE.test(organizerEmail.trim())) {
      nextErrors.organizerEmail = 'כתובת אימייל לא תקינה';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);

    // Full name is duplicated in both auth user_metadata (what the sidebar
    // reads) and the profiles table (what team/activity pages read) — no
    // trigger keeps them in sync on update, only at signup, so both need
    // updating here.
    const { error: metaError } = await supabase.auth.updateUser({ data: { full_name: fullName.trim() } });
    const { error: profileError } = user
      ? await supabase.from('profiles').update({ full_name: fullName.trim() }).eq('id', user.id)
      : { error: null };

    let emailChangeRequested = false;
    if (email.trim() && email.trim() !== user?.email) {
      const { error: emailError } = await supabase.auth.updateUser({ email: email.trim() });
      if (emailError) {
        setSubmitting(false);
        toast.error('עדכון האימייל נכשל: ' + emailError.message);
        return;
      }
      emailChangeRequested = true;
    }

    if (isAdmin && organization) {
      const { error: orgError } = await supabase
        .from('organizations')
        .update({ cal_com_organizer_email: organizerEmail.trim() || null })
        .eq('id', organization.id);
      if (orgError) {
        setSubmitting(false);
        toast.error('עדכון פרטי האינטגרציה נכשל');
        return;
      }
      refetch();
    }

    setSubmitting(false);

    if (metaError || profileError) {
      toast.error('עדכון הפרופיל נכשל');
      return;
    }

    toast.success(
      emailChangeRequested ? 'הפרטים נשמרו. נשלח אימייל אישור לכתובת החדשה' : 'הפרטים נשמרו בהצלחה'
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-gray-900">הגדרות</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">פרטי משתמש</h2>
          <div className="flex flex-col gap-4">
            <TextField
              label="אימייל"
              type="email"
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
            />
            <TextField
              label="שם מלא"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-1 text-sm font-semibold text-gray-900">אינטגרציות</h2>
          <p className="mb-4 text-sm text-gray-500">
            כתובת האימייל שהוגדרה כמארגן בפגישות שלכם ב-Cal.com. נשתמש בה כדי לשייך פגישות נכנסות לחשבון
            שלכם.
          </p>
          <TextField
            label="אימייל Cal.com (מארגן הפגישה)"
            type="email"
            dir="ltr"
            placeholder="organizer@example.com"
            value={organizerEmail}
            onChange={(e) => setOrganizerEmail(e.target.value)}
            error={errors.organizerEmail}
            disabled={!isAdmin}
          />
          {!isAdmin && <p className="mt-1 text-xs text-gray-400">רק מנהלים ובעלים יכולים לשנות הגדרה זו</p>}
        </div>

        <div>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'שומר...' : 'שמירה'}
          </Button>
        </div>
      </form>
    </div>
  );
}
