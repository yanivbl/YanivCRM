import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLeadTasks } from '../../hooks/useLeadTasks';
import { formatDateOnly, isPastDateOnly } from '../../utils/formatters';
import { PriorityBadge } from './PriorityBadge';
import { AddTaskModal } from './AddTaskModal';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import type { Lead } from '../../types/lead';

export function LeadTasks({ lead }: { lead: Lead }) {
  const { tasks, loading, toggleDone, deleteTask, refetch } = useLeadTasks(lead.id);
  const [showCreate, setShowCreate] = useState(false);

  const handleToggle = async (task: (typeof tasks)[number]) => {
    const { error } = await toggleDone(task);
    if (error) toast.error('עדכון המשימה נכשל');
  };

  const handleDelete = async (taskId: string) => {
    const { error } = await deleteTask(taskId);
    if (error) toast.error('מחיקת המשימה נכשלה');
    else toast.success('המשימה נמחקה');
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">משימות</h3>
        <Button onClick={() => setShowCreate(true)}>+ משימה חדשה</Button>
      </div>

      {loading ? (
        <Spinner />
      ) : tasks.length === 0 ? (
        <p className="text-sm text-gray-400">אין עדיין משימות על הליד הזה.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {tasks.map((task) => {
            const overdue = task.status === 'open' && task.due_date && isPastDateOnly(task.due_date);
            return (
              <li
                key={task.id}
                className="flex items-center gap-3 rounded-lg border border-gray-100 px-3 py-2"
              >
                <input
                  type="checkbox"
                  checked={task.status === 'done'}
                  onChange={() => handleToggle(task)}
                  className="h-4 w-4 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  aria-label={task.status === 'done' ? 'סמן כלא הושלמה' : 'סמן כהושלמה'}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={`truncate text-sm font-medium ${
                      task.status === 'done' ? 'text-gray-400 line-through' : 'text-gray-900'
                    }`}
                  >
                    {task.title}
                  </p>
                  {task.due_date && (
                    <p className={`text-xs ${overdue ? 'font-medium text-red-600' : 'text-gray-400'}`}>
                      {overdue ? 'באיחור — ' : 'עד '}
                      {formatDateOnly(task.due_date)}
                    </p>
                  )}
                </div>
                <PriorityBadge priority={task.priority} />
                <button
                  type="button"
                  onClick={() => handleDelete(task.id)}
                  aria-label="מחיקת משימה"
                  className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {showCreate && (
        <AddTaskModal lead={lead} onClose={() => setShowCreate(false)} onCreated={refetch} />
      )}
    </div>
  );
}
