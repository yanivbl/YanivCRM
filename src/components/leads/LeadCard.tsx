import { Link } from 'react-router-dom';
import type { Lead } from '../../types/lead';
import { formatPrice } from '../../utils/formatters';
import { StatusBadge } from './StatusBadge';

interface LeadCardProps {
  lead: Lead;
  onDeleteRequest: (lead: Lead) => void;
}

export function LeadCard({ lead, onDeleteRequest }: LeadCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:hidden">
      <div className="flex items-start justify-between gap-2">
        <Link to={`/leads/${lead.id}`} className="font-medium text-gray-900 hover:underline">
          {lead.name}
        </Link>
        <StatusBadge status={lead.status} />
      </div>
      <dl className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-sm text-gray-600">
        <dt className="text-gray-400">חברה</dt>
        <dd>{lead.company || '—'}</dd>
        <dt className="text-gray-400">טלפון</dt>
        <dd dir="ltr">{lead.phone || '—'}</dd>
        <dt className="text-gray-400">עיר</dt>
        <dd>{lead.city || '—'}</dd>
        <dt className="text-gray-400">מחיר</dt>
        <dd>{formatPrice(lead.price)}</dd>
      </dl>
      <div className="mt-3 flex text-xs">
        <button
          type="button"
          onClick={() => onDeleteRequest(lead)}
          className="text-red-600 hover:underline"
        >
          מחיקה
        </button>
      </div>
    </div>
  );
}
