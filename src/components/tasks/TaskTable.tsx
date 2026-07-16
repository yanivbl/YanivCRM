import { Link } from 'react-router-dom';
import type { TaskWithLead } from '../../types/task';
import { formatDateOnly, isPastDateOnly } from '../../utils/formatters';
import { PriorityBadge } from './PriorityBadge';
import { STATUS_LABELS } from '../../types/task';

interface TaskTableProps {
  tasks: TaskWithLead[];
  onToggleDone: (task: TaskWithLead) => void;
}

export function TaskTable({ tasks, onToggleDone }: TaskTableProps) {
  return (
    <table className="w-full text-start text-sm">
      <thead>
        <tr className="border-b border-gray-200 text-xs text-gray-500">
          <th className="px-4 py-2 text-start font-medium">בוצע</th>
          <th className="px-4 py-2 text-start font-medium">משימה</th>
          <th className="px-4 py-2 text-start font-medium">ליד</th>
          <th className="px-4 py-2 text-start font-medium">עדיפות</th>
          <th className="px-4 py-2 text-start font-medium">תאריך יעד</th>
          <th className="px-4 py-2 text-start font-medium">סטטוס</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {tasks.map((task) => {
          const overdue = task.status === 'open' && task.due_date && isPastDateOnly(task.due_date);
          return (
            <tr key={task.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={task.status === 'done'}
                  onChange={() => onToggleDone(task)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  aria-label={task.status === 'done' ? 'סמן כלא הושלמה' : 'סמן כהושלמה'}
                />
              </td>
              <td
                className={`px-4 py-3 font-medium ${
                  task.status === 'done' ? 'text-gray-400 line-through' : 'text-gray-900'
                }`}
              >
                {task.title}
              </td>
              <td className="px-4 py-3">
                <Link to={`/leads/${task.lead_id}`} className="text-blue-600 hover:underline">
                  {task.lead_name}
                </Link>
              </td>
              <td className="px-4 py-3">
                <PriorityBadge priority={task.priority} />
              </td>
              <td className={`px-4 py-3 ${overdue ? 'font-medium text-red-600' : 'text-gray-600'}`}>
                {task.due_date ? formatDateOnly(task.due_date) : '—'}
              </td>
              <td className="px-4 py-3 text-gray-600">{STATUS_LABELS[task.status]}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
