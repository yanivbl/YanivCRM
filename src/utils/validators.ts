import type { LeadFormValues } from '../types/lead';

export interface LeadFormErrors {
  name?: string;
  email?: string;
  phone?: string;
  price?: string;
  website_url?: string;
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[\d+\-\s()]{6,20}$/;
const URL_RE = /^https?:\/\/[^\s]+\.[^\s]+$/i;

export function validateLeadForm(values: LeadFormValues): LeadFormErrors {
  const errors: LeadFormErrors = {};

  if (!values.name.trim()) {
    errors.name = 'שם הליד הוא שדה חובה';
  }

  if (values.email.trim() && !EMAIL_RE.test(values.email.trim())) {
    errors.email = 'כתובת אימייל לא תקינה';
  }

  if (values.phone.trim() && !PHONE_RE.test(values.phone.trim())) {
    errors.phone = 'מספר טלפון לא תקין';
  }

  if (values.price.trim()) {
    const priceNum = Number(values.price);
    if (Number.isNaN(priceNum) || priceNum < 0) {
      errors.price = 'מחיר חייב להיות מספר חיובי';
    }
  }

  if (values.website_url.trim() && !URL_RE.test(values.website_url.trim())) {
    errors.website_url = 'כתובת אתר לא תקינה (למשל https://example.com)';
  }

  return errors;
}
