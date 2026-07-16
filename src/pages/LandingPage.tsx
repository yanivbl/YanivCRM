import { Link } from 'react-router-dom';
import { Zap, Sparkles, CalendarClock, Users } from 'lucide-react';
import { Logo } from '../components/branding/Logo';
import { Button } from '../components/ui/Button';

const FEATURES = [
  {
    icon: Zap,
    title: 'אוטומציה עם Cal.com',
    description: 'פגישה שנקבעת ב-Cal.com יוצרת ליד אוטומטית ומעדכנת את הסטטוס.',
  },
  {
    icon: Sparkles,
    title: 'ניתוח אתר עם AI',
    description: 'הזינו URL וקבלו ניתוח מקיף — נקודות חולשה, הזדמנויות ושירותים מומלצים.',
  },
  {
    icon: CalendarClock,
    title: 'פגישות',
    description: 'חיבור פגישות לכל ליד, תזמון וסטטוסים וסיכומי פגישה.',
  },
  {
    icon: Users,
    title: 'ניהול לידים וצוות',
    description: 'יצירה, עריכה וחיפוש של לידים עם היסטוריית פעילות מלאה, ושיתוף הצוות שלכם באותו חשבון.',
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5 sm:px-6">
        <Logo withWordmark />
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            התחברות
          </Link>
          <Link to="/register">
            <Button>הרשמה</Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-20 pt-8 sm:px-6 sm:pt-16">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
            <Sparkles size={13} />
            ניהול לידים מתקדם עם בינה מלאכותית
          </span>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl" style={{ textWrap: 'balance' }}>
            CRM פשוט. חכם.
            <br />
            <span className="text-blue-600">ובעברית מלאה.</span>
          </h1>
          <p className="mt-5 text-base text-gray-500 sm:text-lg">
            נהלו לידים, פגישות וניתוחי אתר במקום אחד — עם אינטגרציה ל-Cal.com ויכולות AI מתקדמות.
          </p>
          <div className="mt-8 flex flex-col-reverse items-center justify-center gap-3 sm:flex-row">
            <Link to="/login">
              <Button variant="secondary" className="w-full sm:w-auto">
                יש לי כבר חשבון
              </Button>
            </Link>
            <Link to="/register">
              <Button className="w-full sm:w-auto">התחילו בחינם</Button>
            </Link>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <Icon size={18} />
              </div>
              <h3 className="mb-1 text-sm font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500">{description}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-400">
        YanivCRM {new Date().getFullYear()} ©
      </footer>
    </div>
  );
}
