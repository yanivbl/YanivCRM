import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, ListTodo, UserPlus, Activity, Settings, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { Logo } from '../branding/Logo';

const NAV_ITEMS = [
  { to: '/', label: 'לוח בקרה', icon: LayoutDashboard, end: true },
  { to: '/leads', label: 'לידים', icon: Users, end: false },
  { to: '/tasks', label: 'משימות', icon: ListTodo, end: false },
  { to: '/team', label: 'צוות', icon: UserPlus, end: false },
  { to: '/activity', label: 'פעילות', icon: Activity, end: false },
  { to: '/settings', label: 'הגדרות', icon: Settings, end: false },
];

function initialsOf(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return '?';
  return trimmed[0].toUpperCase();
}

export function Sidebar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const fullName = (user?.user_metadata?.full_name as string | undefined)?.trim() || user?.email || '';

  const handleLogout = async () => {
    await signOut();
    toast.success('התנתקת בהצלחה');
    navigate('/login', { replace: true });
  };

  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col border-e border-gray-200 bg-white md:flex">
      <div className="flex items-center px-5 py-5">
        <Logo withWordmark />
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-gray-100 px-3 py-4">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
            {initialsOf(fullName)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900">{fullName}</p>
            <p className="truncate text-xs text-gray-400" dir="ltr">
              {user?.email}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-2 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900"
        >
          <LogOut size={16} />
          התנתקות
        </button>
      </div>
    </aside>
  );
}
