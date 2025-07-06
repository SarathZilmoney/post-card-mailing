import { AddressCategory } from '../types';
import { httpService } from './httpService';

class CategoryService {
  async getAddressCategories(): Promise<AddressCategory[]> {
    try {
      // Try to make actual API call to backend
      const data = await httpService.get('/address-categories');
      return data;
    } catch (error) {
      console.log('Address categories API call failed, using mock data:', error);
      return this.getMockCategories();
    }
  }

  private getMockCategories(): AddressCategory[] {
    // Mock categories data
    return [
      {
        id: 'restaurants',
        name: 'Restaurants',
        description: 'Restaurants and food establishments',
        count: 1250
      },
      {
        id: 'retail',
        name: 'Retail Stores',
        description: 'Retail and shopping establishments',
        count: 890
      },
      {
        id: 'healthcare',
        name: 'Healthcare',
        description: 'Medical facilities and healthcare providers',
        count: 550
      },
      {
        id: 'real_estate',
        name: 'Real Estate',
        description: 'Real estate agencies and property management',
        count: 340
      },
      {
        id: 'automotive',
        name: 'Automotive',
        description: 'Car dealerships and automotive services',
        count: 280
      },
      {
        id: 'professional_services',
        name: 'Professional Services',
        description: 'Law firms, accounting, consulting services',
        count: 420
      },
      {
        id: 'beauty',
        name: 'Beauty & Wellness',
        description: 'Salons, spas, and wellness centers',
        count: 310
      },
      {
        id: 'education',
        name: 'Education',
        description: 'Schools, training centers, and educational services',
        count: 180
      },
      {
        id: 'technology',
        name: 'Technology',
        description: 'IT services and technology companies',
        count: 220
      },
      {
        id: 'construction',
        name: 'Construction',
        description: 'Construction and contracting services',
        count: 190
      },
      {
        id: 'finance',
        name: 'Finance',
        description: 'Banks, credit unions, and financial services',
        count: 150
      },
      {
        id: 'entertainment',
        name: 'Entertainment',
        description: 'Entertainment venues and services',
        count: 95
      },
      {
        id: 'other',
        name: 'Other',
        description: 'Other business categories',
        count: 320
      }
    ];
  }
}

export const categoryService = new CategoryService(); 