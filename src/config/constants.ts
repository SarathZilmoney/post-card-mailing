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

// US States with full names for display
export const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia',
  'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland',
  'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
  'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
  'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

// Mapping from full state names to abbreviations (for backend compatibility)
export const STATE_NAME_TO_ABBR = {
  'Alabama': 'AL',
  'Alaska': 'AK',
  'Arizona': 'AZ',
  'Arkansas': 'AR',
  'California': 'CA',
  'Colorado': 'CO',
  'Connecticut': 'CT',
  'Delaware': 'DE',
  'Florida': 'FL',
  'Georgia': 'GA',
  'Hawaii': 'HI',
  'Idaho': 'ID',
  'Illinois': 'IL',
  'Indiana': 'IN',
  'Iowa': 'IA',
  'Kansas': 'KS',
  'Kentucky': 'KY',
  'Louisiana': 'LA',
  'Maine': 'ME',
  'Maryland': 'MD',
  'Massachusetts': 'MA',
  'Michigan': 'MI',
  'Minnesota': 'MN',
  'Mississippi': 'MS',
  'Missouri': 'MO',
  'Montana': 'MT',
  'Nebraska': 'NE',
  'Nevada': 'NV',
  'New Hampshire': 'NH',
  'New Jersey': 'NJ',
  'New Mexico': 'NM',
  'New York': 'NY',
  'North Carolina': 'NC',
  'North Dakota': 'ND',
  'Ohio': 'OH',
  'Oklahoma': 'OK',
  'Oregon': 'OR',
  'Pennsylvania': 'PA',
  'Rhode Island': 'RI',
  'South Carolina': 'SC',
  'South Dakota': 'SD',
  'Tennessee': 'TN',
  'Texas': 'TX',
  'Utah': 'UT',
  'Vermont': 'VT',
  'Virginia': 'VA',
  'Washington': 'WA',
  'West Virginia': 'WV',
  'Wisconsin': 'WI',
  'Wyoming': 'WY'
} as const;

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