import { AddressCategory, AddressCategoriesResponse } from '../types';
import { httpService } from './httpService';

class CategoryService {
  async getAddressCategories(): Promise<AddressCategory[]> {
    try {
      // Call the real backend API endpoint
      const response = await httpService.get('/sua/postal-cards/categories') as AddressCategoriesResponse;
      
      // Handle the new response format
      if (response.status === 'success' && Array.isArray(response.data)) {
        return response.data;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Failed to fetch address categories:', error);
      // Return empty array instead of mock data
      return [];
    }
  }

  async getAddressCategoriesWithCount(): Promise<{ categories: AddressCategory[]; totalCount: number }> {
    try {
      // Call the real backend API endpoint
      const response = await httpService.get('/sua/postal-cards/categories') as AddressCategoriesResponse;
      
      // Handle the new response format
      if (response.status === 'success' && Array.isArray(response.data)) {
        return {
          categories: response.data,
          totalCount: response.total_categories
        };
      } else {
        return { categories: [], totalCount: 0 };
      }
    } catch (error) {
      console.error('Failed to fetch address categories:', error);
      return { categories: [], totalCount: 0 };
    }
  }
}

export const categoryService = new CategoryService(); 