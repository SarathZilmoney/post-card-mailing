import { OutscrapperFetch, OutscrapperFilters, Address } from '../types';
import { httpService } from './httpService';

class OutscrapperService {
  private apiKey = import.meta.env.VITE_OUTSCRAPPER_API_KEY || 'demo-key';

  async fetchAddresses(filters: OutscrapperFilters): Promise<Address[]> {
    try {
      // Try to make actual API call to backend
      const data = await httpService.post('/outscrapper/fetch', { filters });
      return data;
    } catch (error) {
      console.log('Outscrapper fetch API call failed, using mock data:', error);
      return this.mockFetchAddresses(filters);
    }
  }

  private mockFetchAddresses(filters: OutscrapperFilters): Address[] {
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
  }

  async getFetchHistory(): Promise<OutscrapperFetch[]> {
    try {
      // Try to make actual API call to backend
      const data = await httpService.get('/outscrapper/history');
      return data;
    } catch (error) {
      console.log('Outscrapper history API call failed, using mock data:', error);
      return this.getMockFetchHistory();
    }
  }

  private getMockFetchHistory(): OutscrapperFetch[] {
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
    try {
      // Try to make actual API call to backend
      const data = await httpService.get('/outscrapper/credits');
      return data;
    } catch (error) {
      console.log('Outscrapper credits API call failed, using mock data:', error);
      return this.getMockCreditsUsage();
    }
  }

  private getMockCreditsUsage(): { used: number; total: number } {
    return { used: 15, total: 1000 };
  }
}

export const outscrapperService = new OutscrapperService();