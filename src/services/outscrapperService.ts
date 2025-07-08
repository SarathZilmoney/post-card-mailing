import { OutscrapperFetch, OutscrapperFilters, Address } from '../types';
import { httpService } from './httpService';
import { STATE_NAME_TO_ABBR } from '../config/constants';

class OutscrapperService {
  private apiKey = import.meta.env.VITE_OUTSCRAPPER_API_KEY || 'demo-key';

  async fetchAddresses(filters: OutscrapperFilters): Promise<Address[]> {
    try {
      // Convert full state name to abbreviation for backend compatibility
      const backendFilters = {
        ...filters,
        state: filters.state ? STATE_NAME_TO_ABBR[filters.state as keyof typeof STATE_NAME_TO_ABBR] || filters.state : filters.state
      };
      
      // Build request body from filters
      const requestBody = this.buildRequestBody(backendFilters);
      const endpoint = `/sua/postal-cards/search-postal-address`;
      
      // Try to make actual POST API call to backend with request body
      const data = await httpService.post(endpoint, requestBody);
      return data;
    } catch (error) {
      console.log('Postal address search API call failed, using mock data:', error);
      return this.mockFetchAddresses(filters);
    }
  }

  private buildRequestBody(filters: OutscrapperFilters): any {
    const requestBody: any = {
      // Add region as US by default
      region: 'US'
    };
    
    // Add filters to request body
    if (filters.keyword) requestBody.query = filters.keyword;
    if (filters.state) requestBody.state = filters.state;
    if (filters.city) requestBody.city = filters.city;
    if (filters.zipCode) requestBody.zipCode = filters.zipCode;
    // if (filters.businessType) requestBody.businessType = filters.businessType;
    if (filters.limit) requestBody.limit = filters.limit;
    // if (filters.ignoreNoReviews !== undefined) requestBody.ignoreNoReviews = filters.ignoreNoReviews;
    
    return requestBody;
  }

  private mockFetchAddresses(filters: OutscrapperFilters): Address[] {
    // Convert full state name to abbreviation for consistency
    const stateAbbr = filters.state ? STATE_NAME_TO_ABBR[filters.state as keyof typeof STATE_NAME_TO_ABBR] || filters.state : 'CA';
    
    // Mock data for demo purposes since we don't have real API key
    const mockAddresses: Address[] = Array.from({ length: filters.limit }, (_, i) => ({
        id: `outscrapper-${Date.now()}-${i}`,
        businessName: `Business ${i + 1}`,
        contactName: `Contact ${i + 1}`,
        street: `${100 + i} Main Street`,
        city: filters.city || 'Demo City',
        state: stateAbbr,
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
      const data = await httpService.get('/sua/postal-cards/search-postal-address-history');
      return data;
    } catch (error) {
      console.log('Postal address history API call failed, using mock data:', error);
      return this.getMockFetchHistory();
    }
  }

  private getMockFetchHistory(): OutscrapperFetch[] {
    // Mock fetch history
    return [
      {
        id: '1',
        query: 'restaurants in Los Angeles',
        filters: { state: 'California', city: 'Los Angeles', businessType: 'Restaurant', limit: 100 },
        status: 'completed',
        recordsFetched: 95,
        creditsUsed: 10,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        completedAt: new Date(Date.now() - 86400000 + 300000).toISOString()
      },
      {
        id: '2',
        query: 'real estate agencies in San Francisco',
        filters: { state: 'California', city: 'San Francisco', businessType: 'Real Estate', limit: 50 },
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
      const data = await httpService.get('/sua/postal-cards/search-postal-address-credits');
      return data;
    } catch (error) {
      console.log('Postal address credits API call failed, using mock data:', error);
      return this.getMockCreditsUsage();
    }
  }

  private getMockCreditsUsage(): { used: number; total: number } {
    return { used: 15, total: 1000 };
  }
}

export const outscrapperService = new OutscrapperService();