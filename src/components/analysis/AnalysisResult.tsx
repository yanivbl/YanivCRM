import type { WebsiteAnalysis } from '../../types/analysis';

function Section({ title, items }: { title: string; items: string[] | null }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <h4 className="mb-1 text-sm font-semibold text-gray-800">{title}</h4>
      <ul className="list-disc space-y-1 ps-5 text-sm text-gray-600">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export function AnalysisResult({ analysis }: { analysis: WebsiteAnalysis }) {
  if (analysis.status === 'failed') {
    return <p className="text-sm text-red-600">הניתוח נכשל: {analysis.error_message}</p>;
  }

  if (analysis.status !== 'done') return null;

  return (
    <div className="flex flex-col gap-4">
      {analysis.business_summary && (
        <div>
          <h4 className="mb-1 text-sm font-semibold text-gray-800">תקציר העסק</h4>
          <p className="text-sm text-gray-600">{analysis.business_summary}</p>
        </div>
      )}
      <Section title="בעיות באתר" items={analysis.issues} />
      <Section title="הזדמנויות לשיפור" items={analysis.opportunities} />
      <Section title="שירותים מומלצים" items={analysis.recommended_services} />
      <Section title="צעדים הבאים מומלצים" items={analysis.next_steps} />
    </div>
  );
}
