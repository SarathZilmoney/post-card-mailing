import { useState, useEffect, useCallback } from 'react';
import { Address, ImportAddressesResponse } from '../types';
import { addressService } from '../services/addressService';

export const useAddresses = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Build filters object
  const buildFilters = useCallback(() => {
    const filters: Record<string, unknown> = {};
    
    if (debouncedSearchTerm.trim()) {
      filters.name = debouncedSearchTerm.trim();
    }
    
    if (categoryFilter && categoryFilter !== 'all') {
      filters.category = categoryFilter;
    }
    
    return filters;
  }, [debouncedSearchTerm, categoryFilter]);

  const fetchAddresses = async (page = 1) => {
    try {
      setLoading(true);
      const filters = buildFilters();
      const data = await addressService.getAddresses(page, filters);
      setAddresses(data.addresses);
      setTotal(data.total);
      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch addresses');
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page !== currentPage) {
      setCurrentPage(page);
      fetchAddresses(page);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchAddresses(nextPage);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      fetchAddresses(prevPage);
    }
  };

  const createAddress = async (addressData: Partial<Address>) => {
    try {
      const newAddress = await addressService.createAddress(addressData);
      // Refresh the current page to show the new address
      await fetchAddresses(currentPage);
      return newAddress;
    } catch (err) {
      throw err;
    }
  };

  const updateAddress = async (id: number, updates: Partial<Address>) => {
    try {
      const updatedAddress = await addressService.updateAddress(id.toString(), updates);
      setAddresses(prev => prev.map(a => a.id === id ? updatedAddress : a));
      return updatedAddress;
    } catch (err) {
      throw err;
    }
  };

  const deleteAddress = async (encryptedId: string) => {
    try {
      await addressService.deleteAddress(encryptedId);
      // Refresh the current page after deletion
      await fetchAddresses(currentPage);
    } catch (err) {
      throw err;
    }
  };

  const importAddresses = async (file: File) => {
    try {
      const response = await addressService.importAddresses(file);
      // Note: Since import is now queued, we don't refresh immediately
      // The addresses will be available once the job completes
      return response;
    } catch (err) {
      throw err;
    }
  };

  // Refetch addresses when filters change
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
    fetchAddresses(1);
  }, [debouncedSearchTerm, categoryFilter]);

  return {
    addresses,
    total,
    currentPage,
    totalPages,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    refetch: fetchAddresses,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    createAddress,
    updateAddress,
    deleteAddress,
    importAddresses
  };
};