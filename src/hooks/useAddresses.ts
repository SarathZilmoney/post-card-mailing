import { useState, useEffect } from 'react';
import { Address } from '../types';
import { addressService } from '../services/addressService';

export const useAddresses = (page = 1, limit = 25, filters?: any) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const data = await addressService.getAddresses(page, limit, filters);
      setAddresses(data.addresses);
      setTotal(data.total);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch addresses');
    } finally {
      setLoading(false);
    }
  };

  const createAddress = async (addressData: Partial<Address>) => {
    try {
      const newAddress = await addressService.createAddress(addressData);
      setAddresses(prev => [newAddress, ...prev]);
      setTotal(prev => prev + 1);
      return newAddress;
    } catch (err) {
      throw err;
    }
  };

  const updateAddress = async (id: string, updates: Partial<Address>) => {
    try {
      const updatedAddress = await addressService.updateAddress(id, updates);
      setAddresses(prev => prev.map(a => a.id === id ? updatedAddress : a));
      return updatedAddress;
    } catch (err) {
      throw err;
    }
  };

  const deleteAddress = async (id: string) => {
    try {
      await addressService.deleteAddress(id);
      setAddresses(prev => prev.filter(a => a.id !== id));
      setTotal(prev => prev - 1);
    } catch (err) {
      throw err;
    }
  };

  const importAddresses = async (file: File) => {
    try {
      const imported = await addressService.importAddresses(file);
      setAddresses(prev => [...imported, ...prev]);
      setTotal(prev => prev + imported.length);
      return imported;
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [page, limit, filters]);

  return {
    addresses,
    total,
    loading,
    error,
    refetch: fetchAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    importAddresses
  };
};