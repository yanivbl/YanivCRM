import { describe, it, expect } from 'vitest';
import { validateLeadForm } from './validators';
import type { LeadFormValues } from '../types/lead';

const BASE: LeadFormValues = {
  name: 'ישראל ישראלי',
  phone: '',
  email: '',
  city: '',
  company: '',
  website_url: '',
  price: '',
  status: 'new',
  notes: '',
};

describe('validateLeadForm', () => {
  it('requires a name', () => {
    const errors = validateLeadForm({ ...BASE, name: '' });
    expect(errors.name).toBeDefined();
  });

  it('accepts a valid form with only the required name', () => {
    const errors = validateLeadForm({ ...BASE });
    expect(errors).toEqual({});
  });

  it('rejects an invalid email', () => {
    const errors = validateLeadForm({ ...BASE, email: 'not-an-email' });
    expect(errors.email).toBeDefined();
  });

  it('accepts a valid email', () => {
    const errors = validateLeadForm({ ...BASE, email: 'test@example.com' });
    expect(errors.email).toBeUndefined();
  });

  it('rejects an invalid phone number', () => {
    const errors = validateLeadForm({ ...BASE, phone: 'abc' });
    expect(errors.phone).toBeDefined();
  });

  it('accepts a valid phone number', () => {
    const errors = validateLeadForm({ ...BASE, phone: '050-1234567' });
    expect(errors.phone).toBeUndefined();
  });

  it('rejects a negative price', () => {
    const errors = validateLeadForm({ ...BASE, price: '-5' });
    expect(errors.price).toBeDefined();
  });

  it('rejects a non-numeric price', () => {
    const errors = validateLeadForm({ ...BASE, price: 'abc' });
    expect(errors.price).toBeDefined();
  });

  it('accepts a valid price', () => {
    const errors = validateLeadForm({ ...BASE, price: '1500' });
    expect(errors.price).toBeUndefined();
  });

  it('rejects a website url without a protocol', () => {
    const errors = validateLeadForm({ ...BASE, website_url: 'example.com' });
    expect(errors.website_url).toBeDefined();
  });

  it('accepts a valid website url', () => {
    const errors = validateLeadForm({ ...BASE, website_url: 'https://example.com' });
    expect(errors.website_url).toBeUndefined();
  });
});
