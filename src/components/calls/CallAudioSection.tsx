import { useRef, useState, type DragEvent } from 'react';
import { UploadCloud, ChevronDown, ChevronUp, RefreshCw, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { SENTIMENT_LABELS, type Call } from '../../types/call';
import { Spinner } from '../ui/Spinner';

const ACCEPTED_TYPES = ['audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/mp4', 'audio/x-m4a'];
const MAX_SIZE_BYTES = 25 * 1024 * 1024; // Whisper's own upload limit.

const SENTIMENT_STYLES: Record<string, string> = {
  positive: 'bg-green-100 text-green-800',
  neutral: 'bg-gray-100 text-gray-700',
  negative: 'bg-red-100 text-red-800',
};

function AnalysisList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="text-xs font-medium text-gray-600">{title}</p>
      <ul className="mt-1 list-inside list-disc space-y-0.5 text-sm text-gray-700">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

interface CallAudioSectionProps {
  call: Call;
  onUpload: (file: File) => Promise<{ error: string | null }>;
  onRetry: () => Promise<{ error: string | null }>;
}

export function CallAudioSection({ call, onUpload, onRetry }: CallAudioSectionProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndUpload = async (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error('פורמט לא נתמך — יש להעלות mp3, wav או m4a');
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      toast.error('הקובץ גדול מדי (מקסימום 25MB)');
      return;
    }
    setUploading(true);
    const { error } = await onUpload(file);
    setUploading(false);
    if (error) {
      toast.error(`תמלול ההקלטה נכשל: ${error}`);
      return;
    }
    toast.success('ההקלטה תומללה ונותחה בהצלחה');
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndUpload(file);
  };

  const handleRetry = async () => {
    setUploading(true);
    const { error } = await onRetry();
    setUploading(false);
    if (error) {
      toast.error(`תמלול ההקלטה נכשל: ${error}`);
      return;
    }
    toast.success('ההקלטה תומללה ונותחה בהצלחה');
  };

  // Checked before the upload dropzone so a transcript typed manually at
  // creation time (no audio_url at all) still shows its own analysis
  // progress/result instead of being masked by the "upload a recording" zone.
  if (call.transcription_status === 'processing' || uploading) {
    return (
      <p className="mt-2 flex items-center gap-2 text-xs text-gray-400">
        <Spinner /> {call.audio_url ? 'מתמלל ומנתח את ההקלטה...' : 'מנתח את השיחה...'}
      </p>
    );
  }

  if (call.transcription_status === 'failed') {
    return (
      <button
        type="button"
        onClick={handleRetry}
        className="mt-2 flex items-center gap-1.5 text-xs text-red-600 hover:underline"
      >
        <RefreshCw size={12} />
        {call.audio_url ? 'תמלול ההקלטה נכשל' : 'ניתוח השיחה נכשל'} — נסה שוב
      </button>
    );
  }

  if (!call.audio_url && !call.transcription_status) {
    return (
      <div className="mt-2 flex flex-col gap-2">
        {/* A transcript here got saved before auto-analysis existed, or
            without its text changing since (edits only re-trigger analysis
            when the text itself changes, to avoid a paid call on every
            unrelated edit) — this lets it be analyzed on demand either way. */}
        {call.transcript && (
          <button
            type="button"
            onClick={handleRetry}
            className="flex w-fit items-center gap-1.5 text-xs text-blue-600 hover:underline"
          >
            <Sparkles size={12} />
            הרצת ניתוח AI על השיחה
          </button>
        )}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex cursor-pointer items-center gap-2 rounded-lg border border-dashed px-3 py-2 text-xs transition-colors ${
            dragActive ? 'border-blue-400 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-400 hover:border-gray-300'
          }`}
        >
          {uploading ? (
            <>
              <Spinner /> מעלה ומתמלל...
            </>
          ) : (
            <>
              <UploadCloud size={14} />
              גרירת קובץ הקלטה (mp3, wav, m4a) או לחיצה לבחירה
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/mpeg,audio/wav,audio/x-wav,audio/mp4,audio/x-m4a,.mp3,.wav,.m4a"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) validateAndUpload(file);
              e.target.value = '';
            }}
          />
        </div>
      </div>
    );
  }

  if (call.transcription_status === 'done') {
    return (
      <div className="mt-2">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          הצג תמלול וניתוח AI
        </button>

        {expanded && (
          <div className="mt-2 flex flex-col gap-3 rounded-lg bg-gray-50 p-3">
            {call.ai_analysis && (
              <div className="flex flex-col gap-2">
                <span
                  className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-medium ${
                    SENTIMENT_STYLES[call.ai_analysis.sentiment]
                  }`}
                >
                  סנטימנט: {SENTIMENT_LABELS[call.ai_analysis.sentiment]}
                </span>
                <AnalysisList title="נקודות מפתח" items={call.ai_analysis.key_points} />
                <AnalysisList title="התנגדויות" items={call.ai_analysis.objections} />
                <AnalysisList title="סימני קנייה" items={call.ai_analysis.buying_signals} />
                <AnalysisList title="פעולות נדרשות" items={call.ai_analysis.action_items} />
                <AnalysisList title="צעדים מומלצים" items={call.ai_analysis.recommended_next_steps} />
              </div>
            )}
            {call.transcript && (
              <div>
                <p className="text-xs font-medium text-gray-600">תמלול מלא</p>
                <p className="mt-1 max-h-40 overflow-y-auto whitespace-pre-wrap text-xs text-gray-500">
                  {call.transcript}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return null;
}
