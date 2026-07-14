import { describe, it, expect } from 'vitest';
import { formatPrice, toDateTimeLocal } from './formatters';

describe('formatPrice', () => {
  it('renders a dash for null', () => {
    expect(formatPrice(null)).toBe('—');
  });

  it('formats a positive number as ILS currency', () => {
    const result = formatPrice(1500);
    expect(result).toContain('1,500');
    expect(result).toMatch(/₪|ILS/);
  });

  it('formats zero', () => {
    expect(formatPrice(0)).not.toBe('—');
  });
});

describe('toDateTimeLocal', () => {
  it('round-trips through a Date correctly shaped for datetime-local inputs', () => {
    const iso = new Date(2026, 5, 15, 14, 30).toISOString();
    const result = toDateTimeLocal(iso);
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
  });
});
