import { useActivityLog } from '../../hooks/useActivityLog';
import { formatDate } from '../../utils/formatters';
import { Spinner } from '../ui/Spinner';
import { STATUS_LABELS, SOURCE_LABELS, type LeadStatus, type LeadSource } from '../../types/lead';
import type { ActivityLogEntry } from '../../types/activity';

function describe(entry: ActivityLogEntry): string {
  if (entry.action === 'lead_created') {
    const source = entry.details?.source as LeadSource | undefined;
    return source ? `הליד נוצר (${SOURCE_LABELS[source]})` : 'הליד נוצר';
  }
  if (entry.action === 'status_changed') {
    const from = entry.details?.from as LeadStatus | undefined;
    const to = entry.details?.to as LeadStatus | undefined;
    if (from && to) return `הסטטוס שונה מ"${STATUS_LABELS[from]}" ל"${STATUS_LABELS[to]}"`;
  }
  return entry.action;
}

export function LeadActivityLog({ leadId }: { leadId: string }) {
  const { entries, loading } = useActivityLog(leadId);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">היסטוריית פעילות</h3>

      {loading ? (
        <Spinner />
      ) : entries.length === 0 ? (
        <p className="text-sm text-gray-400">אין עדיין היסטוריה עבור הליד הזה.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {entries.map((entry) => (
            <li key={entry.id} className="flex items-baseline justify-between gap-3 text-sm">
              <span className="text-gray-700">{describe(entry)}</span>
              <span className="shrink-0 text-xs text-gray-400">{formatDate(entry.created_at)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
