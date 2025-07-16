import { Address, AddressResponse, ImportAddressesResponse } from '../types';
import { httpService } from './httpService';
import { summaryService } from './summaryService';

class AddressService {
  async getAddresses(page = 1, perPage = 10, filters?: Record<string, unknown>): Promise<{ addresses: Address[]; total: number; currentPage: number; totalPages: number }> {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString()
      });
      
      // Add search parameter if provided
      if (filters?.name) {
        queryParams.append('name', filters.name as string);
      }
      
      // Add category filter if provided
      if (filters?.category && filters.category !== 'all') {
        queryParams.append('category', filters.category as string);
      }
      
      const queryString = queryParams.toString();
      const endpoint = `/sua/postal-cards/list-postal-addresses?${queryString}`;
      
      // Debug logging
      if (import.meta.env.DEV) {
        console.log('API Request:', endpoint);
        console.log('Filters:', filters);
      }
      
      const response = await httpService.get(endpoint) as AddressResponse;
      
      if (response.success) {
        const addresses = response.data || [];
        const returnedCount = addresses.length;
        
        // Use summary data for better pagination when no filters are applied
        let total = 0;
        let totalPages = 1;
        
        // Check if we have filters applied
        const hasFilters = filters && (filters.name || (filters.category && filters.category !== 'all'));
        
        if (!hasFilters) {
          // No filters applied, use summary data for accurate pagination
          try {
            const summary = await summaryService.getSummary();
            total = summary.total_addresses;
            totalPages = Math.ceil(total / perPage);
          } catch (error) {
            // Fallback to the old method if summary fails
            const isFullPage = returnedCount === perPage;
            const hasNextPage = isFullPage;
            total = (page - 1) * perPage + returnedCount;
            totalPages = hasNextPage ? page + 1 : page;
          }
        } else {
          // Filters applied, use the old method since summary doesn't account for filters
          const isFullPage = returnedCount === perPage;
          const hasNextPage = isFullPage;
          total = (page - 1) * perPage + returnedCount;
          totalPages = hasNextPage ? page + 1 : page;
        }
        
        // Debug logging in development
        if (import.meta.env.DEV) {
          console.log('Server-side Pagination Debug:', {
            requestedPage: page,
            returnedCount,
            perPage,
            total,
            totalPages,
            currentPage: page,
            filters,
            hasFilters
          });
        }
        
        return {
          addresses: addresses,
          total: total,
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