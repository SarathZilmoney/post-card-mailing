export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const CAMPAIGN_STATUSES = {
  DRAFT: 'draft',
  SCHEDULED: 'scheduled',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  PAUSED: 'paused'
} as const;

export const ADDRESS_STATUSES = {
  PENDING: 'pending',
  VALIDATED: 'validated',
  INVALID: 'invalid',
  BLACKLISTED: 'blacklisted'
} as const;

export const ADDRESS_SOURCES = {
  MANUAL: 'manual',
  CSV: 'csv',
  OUTSCRAPPER: 'outscrapper'
} as const;

export const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export const BUSINESS_TYPES = [
  'account',
  'restaurant',
  'retail',
  'real_estate',
  'healthcare',
  'automotive',
  'professional_services',
  'beauty',
  'education',
  'technology',
  'construction',
  'finance',
  'entertainment',
  'government',
  'non_profit',
  'other'
];

// Human-readable labels for business types
export const BUSINESS_TYPE_LABELS = {
  account: 'Account',
  restaurant: 'Restaurant',
  retail: 'Retail Store',
  real_estate: 'Real Estate',
  healthcare: 'Healthcare',
  automotive: 'Automotive',
  professional_services: 'Professional Services',
  beauty: 'Beauty & Wellness',
  education: 'Education',
  technology: 'Technology',
  construction: 'Construction',
  finance: 'Finance',
  entertainment: 'Entertainment',
  government: 'Government',
  non_profit: 'Non-Profit',
  other: 'Other'
} as const;

export const ITEMS_PER_PAGE = 25;