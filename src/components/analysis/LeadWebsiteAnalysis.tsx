import { useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { useWebsiteAnalyses } from '../../hooks/useWebsiteAnalyses';
import { formatDate } from '../../utils/formatters';
import { TextField } from '../ui/TextField';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { AnalysisStatusBadge } from './AnalysisStatusBadge';
import { AnalysisResult } from './AnalysisResult';

export function LeadWebsiteAnalysis({ leadId, defaultUrl }: { leadId: string; defaultUrl: string | null }) {
  const { analyses, loading, running, runAnalysis } = useWebsiteAnalyses(leadId);
  const [url, setUrl] = useState(defaultUrl ?? '');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    const { error } = await runAnalysis(url.trim());
    if (error) {
      toast.error('הניתוח נכשל: ' + error);
      return;
    }
    toast.success('הניתוח הושלם בהצלחה');
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">ניתוח אתר AI</h3>

      <form onSubmit={handleSubmit} className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <TextField
            label="כתובת האתר לניתוח"
            name="analysis_url"
            type="url"
            dir="ltr"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={running || !url.trim()}>
          {running ? 'מנתח...' : 'הרצת ניתוח'}
        </Button>
      </form>

      {running && (
        <div className="mb-5 flex items-center gap-3 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <Spinner />
          מנתח את האתר... זה עשוי לקחת עד דקה.
        </div>
      )}

      {loading ? (
        <Spinner />
      ) : analyses.length === 0 ? (
        !running && <p className="text-sm text-gray-400">עדיין לא בוצע ניתוח עבור הליד הזה.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {analyses.map((analysis) => (
            <li key={analysis.id} className="rounded-lg border border-gray-100 p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <a
                  href={analysis.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  dir="ltr"
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  {analysis.url}
                </a>
                <div className="flex items-center gap-2">
                  <AnalysisStatusBadge status={analysis.status} />
                  <span className="text-xs text-gray-400">{formatDate(analysis.created_at)}</span>
                </div>
              </div>
              <AnalysisResult analysis={analysis} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
