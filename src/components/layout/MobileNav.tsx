import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, ListTodo, UserPlus, Activity, Settings, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

const NAV_ITEMS = [
  { to: '/', label: 'לוח בקרה', icon: LayoutDashboard, end: true },
  { to: '/leads', label: 'לידים', icon: Users, end: false },
  { to: '/tasks', label: 'משימות', icon: ListTodo, end: false },
  { to: '/team', label: 'צוות', icon: UserPlus, end: false },
  { to: '/activity', label: 'פעילות', icon: Activity, end: false },
  { to: '/settings', label: 'הגדרות', icon: Settings, end: false },
];

export function MobileNav() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    toast.success('התנתקת בהצלחה');
    navigate('/login', { replace: true });
  };

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2 md:hidden">
      <div className="flex items-center gap-1 overflow-x-auto">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium ${
                isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600'
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </div>
      <button
        type="button"
        onClick={handleLogout}
        aria-label="התנתקות"
        className="rounded-lg p-2 text-gray-500 hover:bg-gray-50"
      >
        <LogOut size={18} />
      </button>
    </header>
  );
}
