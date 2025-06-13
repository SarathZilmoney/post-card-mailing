export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
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
  businessType?: string;
  keyword?: string;
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
  logout: () => void;
  loading: boolean;
}