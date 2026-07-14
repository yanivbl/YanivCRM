import type { Lead } from '../../types/lead';
import { SOURCE_LABELS } from '../../types/lead';
import { formatDate, formatPrice } from '../../utils/formatters';
import { StatusBadge } from './StatusBadge';

export function LeadDetailCard({ lead }: { lead: Lead }) {
  const rows: [string, string][] = [
    ['טלפון ליד', lead.phone || '—'],
    ['אימייל ליד', lead.email || '—'],
    ['עיר ליד', lead.city || '—'],
    ['חברת הליד', lead.company || '—'],
    ['מחיר ליד', formatPrice(lead.price)],
    ['מקור', SOURCE_LABELS[lead.source]],
    ['נוצר בתאריך', formatDate(lead.created_at)],
    ['עודכן לאחרונה', formatDate(lead.updated_at)],
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">{lead.name}</h2>
        <StatusBadge status={lead.status} />
      </div>
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {rows.map(([label, val]) => (
          <div key={label}>
            <dt className="text-xs text-gray-400">{label}</dt>
            <dd className="text-sm text-gray-800">{val}</dd>
          </div>
        ))}
        {lead.website_url && (
          <div>
            <dt className="text-xs text-gray-400">אתר הליד</dt>
            <dd className="text-sm">
              <a
                href={lead.website_url}
                target="_blank"
                rel="noopener noreferrer"
                dir="ltr"
                className="inline-block text-blue-600 hover:underline"
              >
                {lead.website_url}
              </a>
            </dd>
          </div>
        )}
      </dl>
      {lead.notes && (
        <div className="mt-4">
          <dt className="text-xs text-gray-400">הערות</dt>
          <dd className="whitespace-pre-wrap text-sm text-gray-800">{lead.notes}</dd>
        </div>
      )}
    </div>
  );
}
