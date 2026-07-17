import { Link } from 'react-router-dom';
import { CheckCircle2, CalendarClock, Sparkles, Briefcase, Inbox, AlertTriangle, ListTodo, Phone } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLeadStats } from '../hooks/useLeadStats';
import { useTaskStats } from '../hooks/useTaskStats';
import { useCallStats } from '../hooks/useCallStats';
import { StatCard } from '../components/dashboard/StatCard';
import { StatusBadge } from '../components/leads/StatusBadge';
import { PriorityBadge } from '../components/tasks/PriorityBadge';
import { formatDate } from '../utils/formatters';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';

export function DashboardPage() {
  const { user } = useAuth();
  const { stats, recentLeads, loading } = useLeadStats();
  const { stats: taskStats, overdueTasks, loading: taskStatsLoading } = useTaskStats();
  const { callsThisMonth, loading: callStatsLoading } = useCallStats();
  const fullName = (user?.user_metadata?.full_name as string | undefined)?.trim() || user?.email || '';

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">שלום, {fullName} 👋</h1>
        <p className="mt-1 text-sm text-gray-500">הנה תמונת מצב מהירה של הלידים שלך.</p>
      </div>

      {loading || !stats ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard label="עסקאות שנסגרו" value={stats.dealClosed} icon={CheckCircle2} tint="green" />
          <StatCard label="פגישות שנקבעו" value={stats.meetingScheduled} icon={CalendarClock} tint="amber" />
          <StatCard label="לידים חדשים" value={stats.newCount} icon={Sparkles} tint="violet" />
          <StatCard label="סך הלידים" value={stats.total} icon={Briefcase} tint="blue" />
          <StatCard
            label="שיחות החודש"
            value={callStatsLoading ? 0 : (callsThisMonth ?? 0)}
            icon={Phone}
            tint="violet"
          />
        </div>
      )}

      <div>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">לידים אחרונים</h2>
        <div className="rounded-xl border border-gray-200 bg-white">
          {!loading && recentLeads.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <Inbox className="text-gray-300" size={32} />
              <div>
                <p className="font-medium text-gray-700">אין עדיין לידים</p>
                <p className="text-sm text-gray-400">הוסיפו את הליד הראשון כדי להתחיל.</p>
              </div>
              <Link to="/leads/new">
                <Button>+ הוסף ליד</Button>
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {recentLeads.map((lead) => (
                <li key={lead.id}>
                  <Link
                    to={`/leads/${lead.id}`}
                    className="flex items-center justify-between px-5 py-3 text-sm hover:bg-gray-50"
                  >
                    <span className="font-medium text-gray-900">{lead.name}</span>
                    <StatusBadge status={lead.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">משימות</h2>

        {taskStatsLoading || !taskStats ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : (
          <>
            <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <StatCard label="משימות באיחור" value={taskStats.overdueCount} icon={AlertTriangle} tint="amber" />
              <StatCard label="משימות שאמורות היום" value={taskStats.dueTodayCount} icon={ListTodo} tint="blue" />
            </div>

            {overdueTasks.length > 0 && (
              <div className="rounded-xl border border-gray-200 bg-white">
                <ul className="divide-y divide-gray-100">
                  {overdueTasks.map((task) => (
                    <li key={task.id}>
                      <Link
                        to={`/leads/${task.lead_id}`}
                        className="flex items-center justify-between gap-3 px-5 py-3 text-sm hover:bg-gray-50"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium text-gray-900">{task.title}</p>
                          <p className="truncate text-xs text-gray-400">
                            {task.lead_name} · באיחור מ־{task.due_at && formatDate(task.due_at)}
                          </p>
                        </div>
                        <PriorityBadge priority={task.priority} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
