export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
export const OUTSCRAPPER_API_URL = 'https://api.outscraper.com/maps/search-v2';

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
  'Restaurant',
  'Retail Store',
  'Real Estate',
  'Healthcare',
  'Automotive',
  'Professional Services',
  'Beauty & Wellness',
  'Education',
  'Technology',
  'Construction',
  'Other'
];

export const ITEMS_PER_PAGE = 25;