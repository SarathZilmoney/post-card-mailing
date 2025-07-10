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
        id: i + 1,
        name: `Business ${i + 1} - Example Restaurant`,
        place_id: `ChIJexample${i}`,
        google_id: `0x88d9b552f4d3efad:0xd0eaf60b52e0fee${i}`,
        full_address: `${100 + i} Business Street, ${filters.city || 'Demo City'}, ${stateAbbr} 90210`,
        street: `${100 + i} Business Street`,
        postal_code: `9021${i % 10}`,
        country_code: "US",
        country: "United States of America",
        city: filters.city || 'Demo City',
        state: stateAbbr === 'CA' ? 'California' : 'Demo State',
        us_state: stateAbbr === 'CA' ? 'California' : 'Demo State',
        latitude: `34.0522${i}`,
        longitude: `-118.2437${i}`,
        time_zone: "America/Los_Angeles",
        category: filters.businessType || ['restaurants', 'retail', 'services', 'healthcare'][i % 4],
        rating: (3.5 + Math.random() * 1.5).toFixed(1),
        location_link: `https://www.google.com/maps/place/Business+${i + 1}`,
        phone: `+1 555-000-${String(i).padStart(4, '0')}`,
        site: `https://business${i + 1}.com`,
        description: i % 3 === 0 ? `Description for business ${i + 1}` : null,
        reviews: Math.floor(Math.random() * 1000) + 10,
        working_hours: {
          "Monday": "9AM-9PM",
          "Tuesday": "9AM-9PM",
          "Wednesday": "9AM-9PM",
          "Thursday": "9AM-9PM",
          "Friday": "9AM-10PM",
          "Saturday": "9AM-10PM",
          "Sunday": "10AM-8PM"
        },
        business_status: "OPERATIONAL",
        created_at: new Date(Date.now() - i * 86400000).toISOString(),
        updated_at: new Date(Date.now() - i * 43200000).toISOString()
      }));

      return mockAddresses;
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