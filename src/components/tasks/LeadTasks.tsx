import { useState, type FormEvent } from 'react';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLeadTasks } from '../../hooks/useLeadTasks';
import { formatDateOnly, isPastDateOnly } from '../../utils/formatters';
import { PriorityBadge } from './PriorityBadge';
import { Button } from '../ui/Button';
import { TextField } from '../ui/TextField';
import { Select } from '../ui/Select';
import { Spinner } from '../ui/Spinner';
import { PRIORITY_LABELS, PRIORITY_OPTIONS, type TaskPriority } from '../../types/task';

export function LeadTasks({ leadId, orgId }: { leadId: string; orgId: string | null }) {
  const { tasks, loading, submitting, addTask, toggleDone, deleteTask } = useLeadTasks(leadId, orgId);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    const { error } = await addTask(trimmed, priority, dueDate || null);
    if (error) {
      toast.error('הוספת המשימה נכשלה');
      return;
    }
    setTitle('');
    setPriority('medium');
    setDueDate('');
    toast.success('המשימה נוספה');
  };

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
      <h3 className="mb-4 text-lg font-semibold text-gray-900">משימות</h3>

      <form onSubmit={handleSubmit} className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1">
          <TextField
            label="משימה חדשה"
            name="title"
            placeholder="לדוגמה: לחזור עם הצעת מחיר"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <Select
          label="עדיפות"
          name="priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as TaskPriority)}
          className="sm:w-32"
        >
          {PRIORITY_OPTIONS.map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABELS[p]}
            </option>
          ))}
        </Select>
        <TextField
          label="תאריך יעד"
          name="dueDate"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="sm:w-40"
        />
        <Button type="submit" disabled={submitting || !title.trim()}>
          {submitting ? 'מוסיף...' : 'הוספה'}
        </Button>
      </form>

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
    </div>
  );
}
