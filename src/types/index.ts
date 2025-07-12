import React from 'react';

export interface User {
  id: number;
  email: string;
  nick_name: string;
  admin_type: string;
  created_at: string | null;
  updated_at: string;
  added_by_admin: number | null;
  status: number;
  deleted_at: string | null;
  admin_department: string | null;
  admin_uuid: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    admin: User;
    two_factor: string[];
    admin_uuid: string;
  };
}

export interface CampaignRun {
  runNumber: number;
  startedAt: string;
  completedAt?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  sentCount: number;
  deliveredCount: number;
  returnedCount: number;
  cost: number;
  errorMessage?: string;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'paused';
  createdAt: string;
  scheduledDate?: string;
  postcardDesign?: string;
  addressCount: number;
  sentCount: number;
  deliveredCount: number;
  returnedCount: number;
  cost: number;
  category?: string;
  targetAddressCount?: number;
  zipCode?: string;
  // Run tracking fields
  currentRun: number;
  totalRuns: number;
  maxRuns: number;
  runHistory: CampaignRun[];
  canRunAgain: boolean;
  nextRunAvailable: boolean;
}

export interface Address {
  id: number;
  name: string;
  place_id: string;
  google_id: string;
  full_address: string;
  street: string;
  postal_code: string;
  country_code: string;
  country: string;
  city: string;
  state: string;
  us_state: string;
  latitude: string;
  longitude: string;
  time_zone: string;
  category: string;
  rating: string;
  location_link: string;
  phone: string;
  site: string;
  description: string | null;
  reviews: number;
  working_hours: string | {
    [key: string]: string;
  };
  business_status: string;
  created_at: string;
  updated_at: string;
}

export interface AddressResponse {
  success: boolean;
  data: {
    data: Address[];
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number;
    to: number;
  };
}

export interface OutscrapperFilters {
  state?: string;
  city?: string;
  zipCode?: string;
  businessType?: string;
  keyword?: string;
  ignoreNoReviews?: boolean;
  limit: number;
}

export interface Analytics {
  totalCampaigns: number;
  activeCampaigns: number;
  totalAddresses: number;
  totalSent: number;
  deliveryRate: number;
  avgCostPerPiece: number;
  monthlySpend: number;
  outscrapperCreditsUsed: number;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

export interface AlertOptions {
  id?: string;
  title?: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number; // in milliseconds, 0 means no auto-close
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void | Promise<void>;
  onClose?: () => void | Promise<void>; // Called when alert is closed/dismissed
  confirmText?: string;
  cancelText?: string;
  icon?: React.ReactNode;
}

export interface Alert extends AlertOptions {
  id: string;
  createdAt: Date;
  isVisible: boolean;
}

export interface AlertContextType {
  alerts: Alert[];
  showAlert: (options: AlertOptions) => string;
  hideAlert: (id: string, onCloseCallback?: () => void | Promise<void>) => void;
  clearAllAlerts: () => void;
  // Convenience methods
  success: (message: string, options?: Partial<AlertOptions>) => string;
  error: (message: string, options?: Partial<AlertOptions>) => string;
  warning: (message: string, options?: Partial<AlertOptions>) => string;
  info: (message: string, options?: Partial<AlertOptions>) => string;
}

export interface AddressCategory {
  id: number;
  name: string;
  address_count: number;
}

export interface AddressCategoriesResponse {
  status: string;
  data: AddressCategory[];
  total_categories: number;
}

export interface ImportAddressesResponse {
  status: string;
  message: string;
  job_id: number;
}