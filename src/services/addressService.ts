import { Address, AddressResponse, ImportAddressesResponse } from '../types';
import { httpService } from './httpService';

class AddressService {
  async getAddresses(page = 1, filters?: Record<string, unknown>): Promise<{ addresses: Address[]; total: number; currentPage: number; totalPages: number }> {
    try {
      // Request server-side pagination with 10 results per page
      const queryParams = new URLSearchParams({
        page: page.toString(),
        per_page: '10',
        ...filters
      });
      
      const queryString = queryParams.toString();
      const endpoint = queryString ? `/sua/postal-cards/list-postal-addresses?${queryString}` : '/sua/postal-cards/list-postal-addresses';
      
      // Debug logging
      if (import.meta.env.DEV) {
        console.log('API Request:', endpoint);
      }
      
      const response = await httpService.get(endpoint) as AddressResponse;
      
      if (response.success) {
        const addresses = response.data || [];
        
        // Since API doesn't return pagination metadata, we use a different approach
        const perPage = 10;
        const returnedCount = addresses.length;
        
        // Determine if there are more pages based on returned count
        const isFullPage = returnedCount === perPage;
        const hasNextPage = isFullPage;
        
        // Instead of estimating misleading totals, we'll use a more honest approach
        // We only know for certain up to the current page
        const knownTotal = (page - 1) * perPage + returnedCount;
        const totalPages = hasNextPage ? page + 1 : page; // Show next page only if we're confident it exists
        
        // Debug logging in development
        if (import.meta.env.DEV) {
          console.log('Server-side Pagination Debug:', {
            requestedPage: page,
            returnedCount,
            perPage,
            isFullPage,
            hasNextPage,
            knownTotal,
            totalPages,
            currentPage: page
          });
        }
        
        return {
          addresses: addresses, // Return all addresses from API (already paginated server-side)
          total: knownTotal, // Only count what we know for sure
          currentPage: page,
          totalPages: totalPages
        };
      } else {
        throw new Error('Failed to fetch addresses from server');
      }
    } catch (error) {
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
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error;
      }
      
      throw new Error('Failed to check for duplicates. Please try again.');
    }
  }
}

export const addressService = new AddressService();