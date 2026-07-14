import { Select } from '../ui/Select';
import { STATUS_LABELS, STATUS_OPTIONS, type LeadStatus } from '../../types/lead';

interface StatusFilterDropdownProps {
  value: LeadStatus | '';
  onChange: (value: LeadStatus | '') => void;
}

export function StatusFilterDropdown({ value, onChange }: StatusFilterDropdownProps) {
  return (
    <Select
      aria-label="סינון לפי סטטוס"
      value={value}
      onChange={(e) => onChange(e.target.value as LeadStatus | '')}
      className="sm:w-48"
    >
      <option value="">הכל</option>
      {STATUS_OPTIONS.map((s) => (
        <option key={s} value={s}>
          {STATUS_LABELS[s]}
        </option>
      ))}
    </Select>
  );
}
