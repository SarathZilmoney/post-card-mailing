import { Address } from '../types';

class AddressService {
  async getAddresses(page = 1, limit = 25, filters?: any): Promise<{ addresses: Address[]; total: number }> {
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
    const { addresses } = await this.getAddresses();
    const address = addresses.find(a => a.id === id);
    if (!address) throw new Error('Address not found');
    
    return { ...address, ...updates };
  }

  async deleteAddress(id: string): Promise<void> {
    console.log('Deleting address:', id);
  }

  async importAddresses(file: File): Promise<Address[]> {
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
    console.log('Validating addresses:', addressIds);
  }

  async checkDuplicates(address: Partial<Address>): Promise<Address[]> {
    // Mock duplicate check
    return [];
  }
}

export const addressService = new AddressService();