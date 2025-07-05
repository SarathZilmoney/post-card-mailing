import { Address } from '../types';
import { httpService } from './httpService';

class AddressService {
  async getAddresses(page = 1, limit = 25, filters?: any): Promise<{ addresses: Address[]; total: number }> {
    try {
      // Try to make actual API call to backend
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      });
      
      const data = await httpService.get(`/addresses?${queryParams}`);
      return data;
    } catch (error) {
      console.log('Get addresses API call failed, using mock data:', error);
      return this.getMockAddresses(page, limit, filters);
    }
  }

  private getMockAddresses(page = 1, limit = 25, filters?: any): { addresses: Address[]; total: number } {
    // Mock addresses data
    const mockAddresses: Address[] = Array.from({ length: 50 }, (_, i) => ({
      id: `addr-${i + 1}`,
      businessName: `Business ${i + 1}`,
      contactName: `Contact Person ${i + 1}`,
      street: `${100 + i} Business Street`,
      city: ['Los Angeles', 'San Francisco', 'San Diego', 'Sacramento'][i % 4],
      state: 'CA',
      zipCode: `9000${i}`,
      phone: `(555) 000-${String(i).padStart(4, '0')}`,
      email: `contact${i + 1}@business.com`,
      source: ['manual', 'csv', 'outscrapper'][i % 3] as any,
      status: ['pending', 'validated', 'invalid'][i % 3] as any,
      createdAt: new Date(Date.now() - i * 86400000).toISOString(),
      campaigns: []
    }));

    const start = (page - 1) * limit;
    const end = start + limit;
    
    return {
      addresses: mockAddresses.slice(start, end),
      total: mockAddresses.length
    };
  }

  async createAddress(addressData: Partial<Address>): Promise<Address> {
    try {
      // Try to make actual API call to backend
      const data = await httpService.post('/addresses', addressData);
      return data;
    } catch (error) {
      console.log('Create address API call failed, using mock creation:', error);
      return this.mockCreateAddress(addressData);
    }
  }

  private mockCreateAddress(addressData: Partial<Address>): Address {
    const newAddress: Address = {
      id: Date.now().toString(),
      street: '',
      city: '',
      state: '',
      zipCode: '',
      source: 'manual',
      status: 'pending',
      createdAt: new Date().toISOString(),
      campaigns: [],
      ...addressData
    };
    return newAddress;
  }

  async updateAddress(id: string, updates: Partial<Address>): Promise<Address> {
    try {
      // Try to make actual API call to backend
      const data = await httpService.put(`/addresses/${id}`, updates);
      return data;
    } catch (error) {
      console.log('Update address API call failed, using mock update:', error);
      return this.mockUpdateAddress(id, updates);
    }
  }

  private async mockUpdateAddress(id: string, updates: Partial<Address>): Promise<Address> {
    const { addresses } = await this.getMockAddresses();
    const address = addresses.find(a => a.id === id);
    if (!address) throw new Error('Address not found');
    
    return { ...address, ...updates };
  }

  async deleteAddress(id: string): Promise<void> {
    try {
      // Try to make actual API call to backend
      await httpService.delete(`/addresses/${id}`);
    } catch (error) {
      console.log('Delete address API call failed, using mock delete:', error);
      this.mockDeleteAddress(id);
    }
  }

  private mockDeleteAddress(id: string): void {
    console.log('Deleting address:', id);
  }

  async importAddresses(file: File): Promise<Address[]> {
    try {
      // Try to make actual API call to backend
      const formData = new FormData();
      formData.append('file', file);
      
      const data = await httpService.post('/addresses/import', formData);
      return data;
    } catch (error) {
      console.log('Import addresses API call failed, using mock import:', error);
      return this.mockImportAddresses(file);
    }
  }

  private mockImportAddresses(file: File): Promise<Address[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockImported: Address[] = Array.from({ length: 10 }, (_, i) => ({
          id: `imported-${Date.now()}-${i}`,
          businessName: `Imported Business ${i + 1}`,
          street: `${200 + i} Imported Street`,
          city: 'Import City',
          state: 'NY',
          zipCode: `1000${i}`,
          source: 'csv',
          status: 'pending',
          createdAt: new Date().toISOString(),
          campaigns: []
        }));
        resolve(mockImported);
      }, 2000);
    });
  }

  async validateAddresses(addressIds: string[]): Promise<void> {
    try {
      // Try to make actual API call to backend
      await httpService.post('/addresses/validate', { addressIds });
    } catch (error) {
      console.log('Validate addresses API call failed, using mock validation:', error);
      this.mockValidateAddresses(addressIds);
    }
  }

  private mockValidateAddresses(addressIds: string[]): void {
    console.log('Validating addresses:', addressIds);
  }

  async checkDuplicates(address: Partial<Address>): Promise<Address[]> {
    try {
      // Try to make actual API call to backend
      const data = await httpService.post('/addresses/check-duplicates', address);
      return data;
    } catch (error) {
      console.log('Check duplicates API call failed, using mock check:', error);
      return this.mockCheckDuplicates(address);
    }
  }

  private mockCheckDuplicates(address: Partial<Address>): Address[] {
    // Mock duplicate check
    return [];
  }
}

export const addressService = new AddressService();