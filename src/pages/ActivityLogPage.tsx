import { Link } from 'react-router-dom';
import { useCurrentOrg } from '../hooks/useCurrentOrg';
import { useOrgActivityLog, type OrgActivityLogEntry } from '../hooks/useOrgActivityLog';
import { formatDate } from '../utils/formatters';
import { STATUS_LABELS, SOURCE_LABELS, type LeadStatus, type LeadSource } from '../types/lead';
import { ROLE_LABELS, type Role } from '../types/organization';
import { Spinner } from '../components/ui/Spinner';

function describe(entry: OrgActivityLogEntry): string {
  if (entry.action === 'lead_created') {
    const source = entry.details?.source as LeadSource | undefined;
    return source ? `הליד נוצר (${SOURCE_LABELS[source]})` : 'הליד נוצר';
  }
  if (entry.action === 'status_changed') {
    const from = entry.details?.from as LeadStatus | undefined;
    const to = entry.details?.to as LeadStatus | undefined;
    if (from && to) return `הסטטוס שונה מ"${STATUS_LABELS[from]}" ל"${STATUS_LABELS[to]}"`;
  }
  if (entry.action === 'member_invited') {
    const email = entry.details?.email;
    const role = entry.details?.role as Role | undefined;
    return email && role ? `${email} הוזמן/ה כ${ROLE_LABELS[role]}` : 'חבר צוות הוזמן';
  }
  if (entry.action === 'member_joined') {
    const role = entry.details?.role as Role | undefined;
    const who = entry.actor_name ?? 'חבר צוות חדש';
    return role ? `${who} הצטרף/ה לצוות כ${ROLE_LABELS[role]}` : `${who} הצטרף/ה לצוות`;
  }
  if (entry.action === 'member_role_changed') {
    const from = entry.details?.from as Role | undefined;
    const to = entry.details?.to as Role | undefined;
    const who = entry.target_name ?? 'חבר צוות';
    if (from && to) return `התפקיד של ${who} שונה מ${ROLE_LABELS[from]} ל${ROLE_LABELS[to]}`;
  }
  if (entry.action === 'member_removed') {
    const who = entry.target_name ?? 'חבר צוות';
    return `${who} הוסר/ה מהארגון`;
  }
  return entry.action;
}

export function ActivityLogPage() {
  const { orgId, loading: orgLoading } = useCurrentOrg();
  const { entries, loading: entriesLoading } = useOrgActivityLog(orgId);
  const loading = orgLoading || entriesLoading;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-gray-900">פעילות</h1>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        {loading ? (
          <Spinner />
        ) : entries.length === 0 ? (
          <p className="text-sm text-gray-400">אין עדיין פעילות בארגון.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {entries.map((entry) => (
              <li key={entry.id} className="flex items-start justify-between gap-3 text-sm">
                <div>
                  <span className="text-gray-700">{describe(entry)}</span>
                  {entry.lead_name && (
                    <>
                      {' · '}
                      {entry.lead_id ? (
                        <Link to={`/leads/${entry.lead_id}`} className="text-blue-600 hover:underline">
                          {entry.lead_name}
                        </Link>
                      ) : (
                        <span>{entry.lead_name}</span>
                      )}
                    </>
                  )}
                  {entry.actor_name && <span className="text-gray-400"> · {entry.actor_name}</span>}
                </div>
                <span className="shrink-0 text-xs text-gray-400">{formatDate(entry.created_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
