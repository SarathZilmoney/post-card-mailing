import { OutscrapperFilters, Address } from '../types';
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
      
      const data = await httpService.post(endpoint, requestBody) as Address[];
      return data;
    } catch (error) {
      throw error;
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
    if (filters.limit) requestBody.limit = filters.limit;
    
    return requestBody;
  }

  async getCreditsUsage(): Promise<{ used: number; total: number }> {
    try {
      const data = await httpService.get('/sua/postal-cards/search-postal-address-credits') as { used: number; total: number };
      return data;
    } catch (error) {
      throw error;
    }
  }
}

export const outscrapperService = new OutscrapperService();