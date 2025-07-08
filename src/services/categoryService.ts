import { AddressCategory, AddressCategoriesResponse } from '../types';
import { httpService } from './httpService';

class CategoryService {
  async getAddressCategories(): Promise<AddressCategory[]> {
    try {
      // Call the real backend API endpoint
      const response: AddressCategoriesResponse = await httpService.get('/sua/postal-cards/categories');
      
      // Handle the new response format
      if (response.status === 'success' && Array.isArray(response.data)) {
        console.log(`Fetched ${response.total_categories} address categories`);
        return response.data;
      } else {
        console.log('Invalid response format or no categories:', response);
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
      const response: AddressCategoriesResponse = await httpService.get('/sua/postal-cards/categories');
      
      // Handle the new response format
      if (response.status === 'success' && Array.isArray(response.data)) {
        return {
          categories: response.data,
          totalCount: response.total_categories
        };
      } else {
        console.log('Invalid response format or no categories:', response);
        return { categories: [], totalCount: 0 };
      }
    } catch (error) {
      console.error('Failed to fetch address categories:', error);
      return { categories: [], totalCount: 0 };
    }
  }
}

export const categoryService = new CategoryService(); 