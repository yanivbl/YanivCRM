import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ClipboardList } from 'lucide-react';
import { useOrgTasks } from '../hooks/useOrgTasks';
import type { TaskPriority, TaskStatus, TaskWithLead } from '../types/task';
import { TaskFilters } from '../components/tasks/TaskFilters';
import { TaskTable } from '../components/tasks/TaskTable';
import { Spinner } from '../components/ui/Spinner';

export function TasksPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const status = (searchParams.get('status') as TaskStatus | '') ?? '';
  const priority = (searchParams.get('priority') as TaskPriority | '') ?? '';

  const { tasks, loading, error, toggleDone } = useOrgTasks(status, priority);

  const setStatusFilter = (value: TaskStatus | '') => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set('status', value);
      else next.delete('status');
      return next;
    });
  };

  const setPriorityFilter = (value: TaskPriority | '') => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set('priority', value);
      else next.delete('priority');
      return next;
    });
  };

  const handleToggleDone = async (task: TaskWithLead) => {
    const { error } = await toggleDone(task);
    if (error) toast.error('עדכון המשימה נכשל');
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold text-gray-900">משימות</h1>
        <TaskFilters
          status={status}
          priority={priority}
          onStatusChange={setStatusFilter}
          onPriorityChange={setPriorityFilter}
        />
      </div>

      {error && <p className="text-sm text-red-600">שגיאה בטעינת המשימות: {error}</p>}

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white py-16 text-center">
          <ClipboardList className="text-gray-300" size={32} />
          <div>
            <p className="font-medium text-gray-700">אין משימות להצגה</p>
            <p className="text-sm text-gray-400">משימות נוצרות מתוך עמוד הליד.</p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <TaskTable tasks={tasks} onToggleDone={handleToggleDone} />
        </div>
      )}
    </div>
  );
}
