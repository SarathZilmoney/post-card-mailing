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
  errorMessage?: string;
}

export interface Campaign {
  id: string;
  encrypted_id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
  scheduledDate?: string;
  nextScheduledRunAt?: string;
  postcardDesign?: string; // Optional since it's no longer in the API response
  addressCount: number;
  sentCount: number;
  deliveredCount: number;
  returnedCount: number;
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
  id?: number; // Made optional since it's not in the new response
  encrypted_id: string;
  name: string;
  category_name: string; // Added category_name field from new response
  full_address: string;
  address_line_1: string;
  street: string;
  postal_code: string;
  country_code: string;
  country: string;
  city: string;
  state: string;
  latitude: string;
  longitude: string;
  rating: string;
  phone: string;
  email: string;
  website: string;
  description: string | null;
  reviews: number;
  business_status: string;
  created_at: string;
  updated_at: string;
}

export interface AddressResponse {
  success: boolean;
  data: Address[];
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
  description: string;
  is_active: boolean;
  address_count: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  encrypted_id: string;
}

export interface AddressCategoriesResponse {
  success: boolean;
  data: AddressCategory[];
}

export interface ImportAddressesResponse {
  status: string;
  message: string;
  job_id: number;
}

// New types for detailed campaign view
export interface CampaignAddress {
  id: number;
  campaign_id: number;
  address_id: number;
  status: number;
  failure_reason: string | null;
  address: {
    id: number;
    name: string;
    payee_id: number | null;
    payee: any | null;
  };
}

export interface CampaignAttachment {
  id: number;
  attachable_id: number;
  file_name: string;
  file_nick_name: string;
  page_count: number;
  created_for_id: number;
  created_by_id: number;
  attachable_type: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  formated_date: string;
  encrypted_id: string;
  public_url: string;
}

export interface CampaignCategory {
  id: number;
  name: string;
  description: string;
}

export interface DetailedCampaign {
  id: number;
  campaign_name: string;
  description: string;
  start_date: string;
  end_date: string | null;
  category_id: number;
  file_path: string | null;
  cycle_duration_days: number;
  sends_per_cycle: number;
  run_count: number;
  next_scheduled_run_at: string | null;
  created_by: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  category: CampaignCategory;
  addresses: CampaignAddress[];
  attachments: CampaignAttachment[];
}

export interface DetailedCampaignResponse {
  success: boolean;
  data: DetailedCampaign;
}