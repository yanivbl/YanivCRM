import type { AnalysisStatus } from '../../types/analysis';

const LABELS: Record<AnalysisStatus, string> = {
  queued: 'בהמתנה',
  running: 'מנתח...',
  done: 'הושלם',
  failed: 'נכשל',
};

const STYLES: Record<AnalysisStatus, string> = {
  queued: 'bg-gray-100 text-gray-600',
  running: 'bg-blue-100 text-blue-800',
  done: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
};

export function AnalysisStatusBadge({ status }: { status: AnalysisStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STYLES[status]}`}>
      {LABELS[status]}
    </span>
  );
}
