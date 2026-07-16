export function formatPrice(price: number | null): string {
  if (price === null) return '—';
  return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(price);
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('he-IL', { dateStyle: 'short', timeStyle: 'short' }).format(
    new Date(iso)
  );
}

export function isPast(iso: string): boolean {
  return new Date(iso) < new Date();
}

// Converts an ISO timestamp to the "YYYY-MM-DDTHH:mm" shape <input type="datetime-local"> expects, in local time.
export function toDateTimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
