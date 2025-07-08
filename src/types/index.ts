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
    two_factor: any[];
    admin_uuid: string;
  };
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
}

export interface Address {
  id: string;
  businessName?: string;
  contactName?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  email?: string;
  source: 'manual' | 'csv' | 'outscrapper';
  status: 'pending' | 'validated' | 'invalid' | 'blacklisted';
  lastMailedDate?: string;
  createdAt: string;
  campaigns: string[];
}

export interface OutscrapperFetch {
  id: string;
  query: string;
  filters: OutscrapperFilters;
  status: 'pending' | 'completed' | 'failed';
  recordsFetched: number;
  creditsUsed: number;
  createdAt: string;
  completedAt?: string;
  error?: string;
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
  hideAlert: (id: string) => void;
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