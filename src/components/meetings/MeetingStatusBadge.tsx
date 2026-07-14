import { MEETING_STATUS_LABELS, type MeetingStatus } from '../../types/meeting';

const STATUS_STYLES: Record<MeetingStatus, string> = {
  scheduled: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-200 text-gray-600',
  no_show: 'bg-red-100 text-red-800',
};

export function MeetingStatusBadge({ status }: { status: MeetingStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {MEETING_STATUS_LABELS[status]}
    </span>
  );
}
