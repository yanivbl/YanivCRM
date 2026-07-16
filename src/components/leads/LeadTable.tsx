import { Link } from 'react-router-dom';
import type { Lead, LeadStatus } from '../../types/lead';
import { STATUS_LABELS, STATUS_OPTIONS } from '../../types/lead';
import { formatPrice } from '../../utils/formatters';
import { StatusBadge } from './StatusBadge';

interface LeadTableProps {
  leads: Lead[];
  onStatusChange: (id: string, status: LeadStatus) => void;
  onDeleteRequest: (lead: Lead) => void;
}

export function LeadTable({ leads, onStatusChange, onDeleteRequest }: LeadTableProps) {
  return (
    <table className="hidden w-full text-start text-sm md:table">
      <thead>
        <tr className="border-b border-gray-200 text-xs text-gray-500">
          <th className="px-4 py-2 text-start font-medium">שם</th>
          <th className="px-4 py-2 text-start font-medium">חברה</th>
          <th className="px-4 py-2 text-start font-medium">טלפון</th>
          <th className="px-4 py-2 text-start font-medium">אימייל</th>
          <th className="px-4 py-2 text-start font-medium">עיר</th>
          <th className="px-4 py-2 text-start font-medium">מחיר</th>
          <th className="px-4 py-2 text-start font-medium">סטטוס</th>
          <th className="px-4 py-2 text-start font-medium">פעולות</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {leads.map((lead) => (
          <tr key={lead.id} className="hover:bg-gray-50">
            <td className="px-4 py-3 font-medium text-gray-900">
              <Link to={`/leads/${lead.id}`} className="hover:underline">
                {lead.name}
              </Link>
            </td>
            <td className="px-4 py-3 text-gray-600">{lead.company || '—'}</td>
            <td className="px-4 py-3 text-gray-600" dir="ltr">
              {lead.phone || '—'}
            </td>
            <td className="px-4 py-3 text-gray-600" dir="ltr">
              {lead.email || '—'}
            </td>
            <td className="px-4 py-3 text-gray-600">{lead.city || '—'}</td>
            <td className="px-4 py-3 text-gray-600">{formatPrice(lead.price)}</td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <StatusBadge status={lead.status} />
                <select
                  aria-label="שינוי סטטוס"
                  value={lead.status}
                  onChange={(e) => onStatusChange(lead.id, e.target.value as LeadStatus)}
                  className="rounded border border-gray-200 bg-white text-xs text-gray-500 outline-none"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>
            </td>
            <td className="px-4 py-3">
              <div className="flex gap-3 text-xs">
                <Link to={`/leads/${lead.id}`} className="text-blue-600 hover:underline">
                  צפייה
                </Link>
                <Link to={`/leads/${lead.id}/edit`} className="text-gray-600 hover:underline">
                  עריכה
                </Link>
                <button
                  type="button"
                  onClick={() => onDeleteRequest(lead)}
                  className="text-red-600 hover:underline"
                >
                  מחיקה
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
