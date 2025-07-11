import { useState, useEffect } from 'react';
import { Campaign, CampaignRun } from '../types';
import { campaignService } from '../services/campaignService';

export const useCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const data = await campaignService.getCampaigns();
      setCampaigns(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch campaigns');
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const createCampaign = async (campaignData: Partial<Campaign> | FormData): Promise<{success: boolean, message: string}> => {
    try {
      const response = await campaignService.createCampaign(campaignData);
      // Backend doesn't return campaign data, just success confirmation
      // The campaigns list will be updated via refetch
      return response;
    } catch (err) {
      throw err;
    }
  };

  const editCampaign = async (campaignData: FormData): Promise<{success: boolean, message: string}> => {
    try {
      const response = await campaignService.editCampaign(campaignData);
      // Backend doesn't return campaign data, just success confirmation
      // The campaigns list will be updated via refetch
      return response;
    } catch (err) {
      throw err;
    }
  };

  const updateCampaign = async (id: string, updates: Partial<Campaign>) => {
    try {
      const updatedCampaign = await campaignService.updateCampaign(id, updates);
      setCampaigns(prev => prev.map(c => c.id === id ? updatedCampaign : c));
      return updatedCampaign;
    } catch (err) {
      throw err;
    }
  };

  const deleteCampaign = async (id: string): Promise<{success: boolean, message: string}> => {
    try {
      const response = await campaignService.deleteCampaign(id);
      // Remove the campaign from the local state only after successful deletion
      setCampaigns(prev => prev.filter(c => c.id !== id));
      return response;
    } catch (err) {
      throw err;
    }
  };

  const runCampaign = async (id: string): Promise<{success: boolean, message: string, campaign?: Campaign}> => {
    try {
      const response = await campaignService.runCampaign(id);
      
      // If the campaign object is returned, update the local state
      if (response.campaign) {
        setCampaigns(prev => prev.map(c => c.id === id ? response.campaign! : c));
      } else {
        // If no campaign object is returned, just refetch the campaigns to get the updated status
        await fetchCampaigns(false);
      }
      
      return response;
    } catch (err) {
      throw err;
    }
  };

  const stopCampaign = async (id: string) => {
    try {
      const updatedCampaign = await campaignService.stopCampaign(id);
      setCampaigns(prev => prev.map(c => c.id === id ? updatedCampaign : c));
      return updatedCampaign;
    } catch (err) {
      throw err;
    }
  };

  const getRunHistory = async (id: string): Promise<CampaignRun[]> => {
    try {
      return await campaignService.getRunHistory(id);
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  return {
    campaigns,
    loading,
    error,
    refetch: (showLoading = true) => fetchCampaigns(showLoading),
    createCampaign,
    editCampaign,
    updateCampaign,
    deleteCampaign,
    runCampaign,
    stopCampaign,
    getRunHistory
  };
};