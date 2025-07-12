import { Address, AddressResponse, ImportAddressesResponse } from '../types';
import { httpService } from './httpService';

class AddressService {
  async getAddresses(page = 1, filters?: Record<string, unknown>): Promise<{ addresses: Address[]; total: number; currentPage: number; totalPages: number }> {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        ...filters
      });
      
      const queryString = queryParams.toString();
      const endpoint = queryString ? `/sua/postal-cards/list-postal-addresses?${queryString}` : '/sua/postal-cards/list-postal-addresses';
      
      const response = await httpService.get(endpoint) as AddressResponse;
      
      if (response.success) {
        const responseData = response.data;
        const addresses = responseData.data || [];
        
        // Parse working_hours from JSON string to object for each address
        const parsedAddresses = addresses.map(address => ({
          ...address,
          working_hours: typeof address.working_hours === 'string' 
            ? JSON.parse(address.working_hours) 
            : address.working_hours
        }));
        
        return {
          addresses: parsedAddresses,
          total: responseData.total,
          currentPage: responseData.current_page,
          totalPages: responseData.last_page
        };
      } else {
        throw new Error('Failed to fetch addresses from server');
      }
    } catch (error) {
      console.error('Get addresses API call failed:', error);
      
      // Check if it's an authentication error
      if (error instanceof Error && error.message.includes('Session expired')) {
        // Re-throw authentication errors to trigger proper logout
        throw error;
      }
      
      // For other errors, provide a user-friendly message without triggering logout
      throw new Error('Unable to load addresses. Please check your connection and try again.');
    }
  }

  async createAddress(addressData: Partial<Address>): Promise<Address> {
    try {
      const data = await httpService.post('/sua/postal-cards/create-address', addressData) as Address;
      return data;
    } catch (error) {
      console.error('Create address API call failed:', error);
      
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error;
      }
      
      throw new Error('Failed to create address. Please try again.');
    }
  }

  async updateAddress(id: string, updates: Partial<Address>): Promise<Address> {
    try {
      const data = await httpService.put(`/sua/postal-cards/update-address/${id}`, updates) as Address;
      return data;
    } catch (error) {
      console.error('Update address API call failed:', error);
      
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error;
      }
      
      throw new Error('Failed to update address. Please try again.');
    }
  }

  async deleteAddress(id: string): Promise<void> {
    try {
      await httpService.delete('/sua/postal-cards/delete-addresses', {
        body: JSON.stringify({
          address_ids: [id]
        })
      });
    } catch (error) {
      console.error('Delete address API call failed:', error);
      
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error;
      }
      
      throw new Error('Failed to delete address. Please try again.');
    }
  }

  async deleteAddresses(ids: string[]): Promise<void> {
    try {
      await httpService.delete('/sua/postal-cards/delete-addresses', {
        body: JSON.stringify({
          address_ids: ids
        })
      });
    } catch (error) {
      console.error('Delete addresses API call failed:', error);
      
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error;
      }
      
      throw new Error('Failed to delete addresses. Please try again.');
    }
  }

  async importAddresses(file: File): Promise<ImportAddressesResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Add file type information for backend processing
      formData.append('fileType', 'excel');
      
      const data = await httpService.post('/sua/postal-cards/import-addresses', formData) as ImportAddressesResponse;
      return data;
    } catch (error) {
      console.error('Import addresses API call failed:', error);
      
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error;
      }
      
      throw new Error('Failed to import addresses from Excel file. Please check your file format and try again.');
    }
  }

  async validateAddresses(addressIds: string[]): Promise<void> {
    try {
      await httpService.post('/sua/postal-cards/validate-addresses', { addressIds });
    } catch (error) {
      console.error('Validate addresses API call failed:', error);
      
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error;
      }
      
      throw new Error('Failed to validate addresses. Please try again.');
    }
  }

  async checkDuplicates(address: Partial<Address>): Promise<Address[]> {
    try {
      const data = await httpService.post('/sua/postal-cards/check-duplicates', address) as Address[];
      return data || [];
    } catch (error) {
      console.error('Check duplicates API call failed:', error);
      
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error;
      }
      
      throw new Error('Failed to check for duplicates. Please try again.');
    }
  }
}

export const addressService = new AddressService();