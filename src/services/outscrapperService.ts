import axios from 'axios';
import { OutscrapperFetch, OutscrapperFilters, Address } from '../types';

class OutscrapperService {
  private apiKey = import.meta.env.VITE_OUTSCRAPPER_API_KEY || 'demo-key';

  async fetchAddresses(filters: OutscrapperFilters): Promise<Address[]> {
    try {
      // Mock data for demo purposes since we don't have real API key
      const mockAddresses: Address[] = Array.from({ length: filters.limit }, (_, i) => ({
        id: `outscrapper-${Date.now()}-${i}`,
        businessName: `Business ${i + 1}`,
        contactName: `Contact ${i + 1}`,
        street: `${100 + i} Main Street`,
        city: filters.city || 'Demo City',
        state: filters.state || 'CA',
        zipCode: `9000${i}`,
        phone: `(555) 000-${String(i).padStart(4, '0')}`,
        email: `contact${i + 1}@business.com`,
        source: 'outscrapper',
        status: 'pending',
        createdAt: new Date().toISOString(),
        campaigns: []
      }));

      return mockAddresses;
    } catch (error) {
      console.error('Outscrapper fetch error:', error);
      throw new Error('Failed to fetch addresses from Outscrapper');
    }
  }

  async getFetchHistory(): Promise<OutscrapperFetch[]> {
    // Mock fetch history
    return [
      {
        id: '1',
        query: 'restaurants in Los Angeles',
        filters: { state: 'CA', city: 'Los Angeles', businessType: 'Restaurant', limit: 100 },
        status: 'completed',
        recordsFetched: 95,
        creditsUsed: 10,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        completedAt: new Date(Date.now() - 86400000 + 300000).toISOString()
      },
      {
        id: '2',
        query: 'real estate agencies in San Francisco',
        filters: { state: 'CA', city: 'San Francisco', businessType: 'Real Estate', limit: 50 },
        status: 'completed',
        recordsFetched: 48,
        creditsUsed: 5,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        completedAt: new Date(Date.now() - 172800000 + 250000).toISOString()
      }
    ];
  }

  async getCreditsUsage(): Promise<{ used: number; total: number }> {
    return { used: 15, total: 1000 };
  }
}

export const outscrapperService = new OutscrapperService();