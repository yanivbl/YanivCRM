export function formatPrice(price: number | null): string {
  if (price === null) return '—';
  return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(price);
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('he-IL', { dateStyle: 'short', timeStyle: 'short' }).format(
    new Date(iso)
  );
}

// For a plain `date` column (YYYY-MM-DD, no time component) — parsing it with
// `new Date(dateOnly)` treats it as UTC midnight, which can roll back a day
// in a timezone behind UTC. Parse the parts directly instead.
export function formatDateOnly(dateOnly: string): string {
  const [year, month, day] = dateOnly.split('-').map(Number);
  return new Intl.DateTimeFormat('he-IL', { dateStyle: 'short' }).format(new Date(year, month - 1, day));
}

export function isPastDateOnly(dateOnly: string): boolean {
  const [year, month, day] = dateOnly.split('-').map(Number);
  const due = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
}

// Converts an ISO timestamp to the "YYYY-MM-DDTHH:mm" shape <input type="datetime-local"> expects, in local time.
export function toDateTimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
