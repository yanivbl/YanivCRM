import { useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { useLeadNotes } from '../../hooks/useLeadNotes';
import { formatDate } from '../../utils/formatters';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';

export function LeadNotes({ leadId }: { leadId: string }) {
  const { notes, loading, submitting, addNote } = useLeadNotes(leadId);
  const [body, setBody] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;

    const { error } = await addNote(trimmed);
    if (error) {
      toast.error('הוספת ההערה נכשלה');
      return;
    }
    setBody('');
    toast.success('ההערה נוספה');
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">הערות פנימיות</h3>

      <form onSubmit={handleSubmit} className="mb-5 flex flex-col gap-2">
        <textarea
          rows={2}
          placeholder="הוסף הערה..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        <Button type="submit" className="self-start" disabled={submitting || !body.trim()}>
          {submitting ? 'מוסיף...' : 'הוספת הערה'}
        </Button>
      </form>

      {loading ? (
        <Spinner />
      ) : notes.length === 0 ? (
        <p className="text-sm text-gray-400">אין עדיין הערות על הליד הזה.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {notes.map((note) => (
            <li key={note.id} className="border-s-2 border-gray-200 ps-3">
              <p className="whitespace-pre-wrap text-sm text-gray-800">{note.body}</p>
              <p className="mt-1 text-xs text-gray-400">{formatDate(note.created_at)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
