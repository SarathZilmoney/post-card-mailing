import { useState, useEffect } from 'react';
import { Address } from '../types';
import { addressService } from '../services/addressService';

export const useAddresses = (filters?: Record<string, unknown>) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAddresses = async (page = currentPage) => {
    try {
      setLoading(true);
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
    if (page >= 1 && page <= totalPages && page !== currentPage) {
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

  const deleteAddress = async (id: number) => {
    try {
      await addressService.deleteAddress(id.toString());
      // Refresh the current page after deletion
      await fetchAddresses(currentPage);
    } catch (err) {
      throw err;
    }
  };

  const importAddresses = async (file: File) => {
    try {
      const imported = await addressService.importAddresses(file);
      // Refresh the first page to show imported addresses
      setCurrentPage(1);
      await fetchAddresses(1);
      return imported;
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchAddresses(1);
  }, [filters]);

  return {
    addresses,
    total,
    currentPage,
    totalPages,
    loading,
    error,
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