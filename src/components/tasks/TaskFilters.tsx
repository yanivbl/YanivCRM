import { Select } from '../ui/Select';
import { STATUS_LABELS, STATUS_OPTIONS, PRIORITY_LABELS, PRIORITY_OPTIONS } from '../../types/task';
import type { TaskPriority, TaskStatus } from '../../types/task';

interface TaskFiltersProps {
  status: TaskStatus | '';
  priority: TaskPriority | '';
  onStatusChange: (value: TaskStatus | '') => void;
  onPriorityChange: (value: TaskPriority | '') => void;
}

export function TaskFilters({ status, priority, onStatusChange, onPriorityChange }: TaskFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Select
        aria-label="סינון לפי סטטוס"
        value={status}
        onChange={(e) => onStatusChange(e.target.value as TaskStatus | '')}
        className="sm:w-40"
      >
        <option value="">כל הסטטוסים</option>
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </Select>
      <Select
        aria-label="סינון לפי עדיפות"
        value={priority}
        onChange={(e) => onPriorityChange(e.target.value as TaskPriority | '')}
        className="sm:w-40"
      >
        <option value="">כל העדיפויות</option>
        {PRIORITY_OPTIONS.map((p) => (
          <option key={p} value={p}>
            {PRIORITY_LABELS[p]}
          </option>
        ))}
      </Select>
    </div>
  );
}
