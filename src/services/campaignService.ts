import { Campaign, Address } from '../types';
import { httpService } from './httpService';

class CampaignService {
  async getCampaigns(): Promise<Campaign[]> {
    try {
      // Make API call to the backend
      const response = await httpService.get('/sua/postal-cards/get-campaigns');
      
      // Handle the response format
      if (response.success && response.data) {
        const campaigns = response.data.map(this.mapBackendCampaignToFrontend);
        
        // Sort campaigns by creation date in descending order (newest first)
        return campaigns.sort((a: Campaign, b: Campaign) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        });
      } else {
        console.log('Invalid response format:', response);
        return [];
      }
    } catch (error) {
      console.log('Campaigns API call failed:', error);
      throw error;
    }
  }

  private mapBackendCampaignToFrontend(backendCampaign: any): Campaign {
    // Parse postal addresses to count them
    let addressCount = 0;
    try {
      if (backendCampaign.postal_addresses) {
        const addresses = JSON.parse(backendCampaign.postal_addresses);
        addressCount = Array.isArray(addresses) ? addresses.length : 0;
      }
    } catch (error) {
      console.log('Failed to parse postal addresses:', error);
    }

    // Map backend status to frontend status
    const mapStatus = (status: string): 'draft' | 'scheduled' | 'active' | 'completed' | 'paused' => {
      switch (status?.toLowerCase()) {
        case 'pending':
          return 'draft';
        case 'active':
        case 'running':
          return 'active';
        case 'completed':
        case 'finished':
          return 'completed';
        case 'paused':
        case 'stopped':
          return 'paused';
        case 'draft':
        default:
          return 'draft';
      }
    };

    return {
      id: backendCampaign.id.toString(),
      name: backendCampaign.campaign_name || '',
      description: backendCampaign.description || '',
      status: mapStatus(backendCampaign.status),
      createdAt: backendCampaign.created_at || new Date().toISOString(),
      scheduledDate: backendCampaign.start_date || undefined,
      postcardDesign: backendCampaign.file_path || undefined,
      category: backendCampaign.category || undefined,
      addressCount,
      targetAddressCount: addressCount, // Use same count for now
      sentCount: 0, // Backend doesn't provide this yet
      deliveredCount: 0, // Backend doesn't provide this yet
      returnedCount: 0, // Backend doesn't provide this yet
      cost: 0 // Backend doesn't provide this yet
    };
  }

  async createCampaign(campaignData: Partial<Campaign> | FormData): Promise<{success: boolean, message: string}> {
    try {
      // Prepare the payload for the backend API
      let payload: FormData;
      
      if (campaignData instanceof FormData) {
        // Map FormData keys to match backend expectations
        payload = new FormData();
        
        const campaignName = campaignData.get('name') as string;
        const description = campaignData.get('description') as string;
        const startDate = campaignData.get('startDate') as string;
        const category = campaignData.get('category') as string;
        
                // Validate required fields
        if (!campaignName?.trim()) {
          throw new Error('Campaign name is required');
        }
        if (!description?.trim()) {
          throw new Error('Description is required');
        }
        if (!startDate) {
          throw new Error('Start date is required');
        }
        
        payload.append('campaign_name', campaignName.trim());
        payload.append('description', description.trim());
        payload.append('start_date', startDate);
        payload.append('category', 'Hospital'); // Temporary: always set category as Hospital
        
        // Postcard image is now required
        const file = campaignData.get('postcardImage') as File;
        if (!file || file.size === 0) {
          throw new Error('Postcard image is required');
        }
        
        // Validate file
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          throw new Error('File size must be less than 5MB');
        }
        
        payload.append('file', file);
        
        // Debug log the payload
        console.log('Campaign payload being sent:');
        console.log('Note: Category temporarily hardcoded to "Hospital"');
        for (const [key, value] of payload.entries()) {
          if (value instanceof File) {
            console.log(`${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
          } else {
            console.log(`${key}: ${value}`);
          }
        }
        
      } else {
        // Handle object data (convert to FormData) - Note: This path doesn't support file uploads
        throw new Error('Postcard image is required. Please use the campaign creation form.');
      }
      
      // Make API call to the correct endpoint
      const response = await httpService.post('/sua/postal-cards/create-campaigns', payload);
      
      // Handle the response format - backend only returns success message, not campaign data
      if (response.success) {
        // Backend doesn't return campaign data, just success confirmation
        // We'll need to refetch campaigns to get the updated list
        return response;
      } else {
        console.log('Campaign creation failed:', response);
        throw new Error(response.message || 'Failed to create campaign');
      }
    } catch (error) {
      console.log('Create campaign API call failed:', error);
      
      // Enhanced error handling for 422 responses
      if (error instanceof Error) {
        if (error.message.includes('422') || error.message.includes('Unprocessable')) {
          throw new Error('Invalid campaign data. Please check all required fields and try again.');
        }
      }
      
      throw error;
    }
  }

  async editCampaign(campaignData: FormData): Promise<{success: boolean, message: string}> {
    try {
      // Prepare the payload for the backend API
      const payload = new FormData();
      
      const campaignId = campaignData.get('campaign_id') as string;
      const campaignName = campaignData.get('name') as string;
      const description = campaignData.get('description') as string;
      const startDate = campaignData.get('startDate') as string;
      const category = campaignData.get('category') as string;
      
      // Validate required fields
      if (!campaignId) {
        throw new Error('Campaign ID is required');
      }
      if (!campaignName?.trim()) {
        throw new Error('Campaign name is required');
      }
      if (!description?.trim()) {
        throw new Error('Description is required');
      }
      if (!startDate) {
        throw new Error('Start date is required');
      }
      
      payload.append('campaign_id', campaignId);
      payload.append('campaign_name', campaignName.trim());
      payload.append('description', description.trim());
      payload.append('start_date', startDate);
      payload.append('category', category || 'Hospital'); // Use provided category or default to Hospital
      
      // File is optional for edit - only add if provided
      const file = campaignData.get('postcardImage') as File;
      if (file && file.size > 0) {
        // Validate file
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          throw new Error('File size must be less than 5MB');
        }
        payload.append('file', file);
      }
      
      // Debug log the payload
      console.log('Edit campaign payload being sent:');
      for (const [key, value] of payload.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }
      
      // Make API call to the edit endpoint
      const response = await httpService.post('/sua/postal-cards/edit-campaigns', payload);
      
      // Handle the response format
      if (response.success) {
        return response;
      } else {
        console.log('Campaign edit failed:', response);
        throw new Error(response.message || 'Failed to edit campaign');
      }
    } catch (error) {
      console.log('Edit campaign API call failed:', error);
      
      // Enhanced error handling for 422 responses
      if (error instanceof Error) {
        if (error.message.includes('422') || error.message.includes('Unprocessable')) {
          throw new Error('Invalid campaign data. Please check all required fields and try again.');
        }
      }
      
      throw error;
    }
  }



  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign> {
    try {
      // Make actual API call to backend
      const data = await httpService.put(`/campaigns/${id}`, updates);
      return data;
    } catch (error) {
      console.log('Update campaign API call failed:', error);
      throw error;
    }
  }

  async runCampaign(id: string): Promise<Campaign> {
    try {
      // Make actual API call to backend
      const data = await httpService.post(`/campaigns/${id}/run`);
      return data;
    } catch (error) {
      console.log('Run campaign API call failed:', error);
      throw error;
    }
  }

  async stopCampaign(id: string): Promise<Campaign> {
    try {
      // Make actual API call to backend
      const data = await httpService.post(`/campaigns/${id}/stop`);
      return data;
    } catch (error) {
      console.log('Stop campaign API call failed:', error);
      throw error;
    }
  }

  async deleteCampaign(id: string): Promise<{success: boolean, message: string}> {
    try {
      // Validate required fields
      if (!id) {
        throw new Error('Campaign ID is required');
      }
      
      // Prepare the payload for the backend API
      const payload = {
        campaign_id: id
      };
      
      // Debug log the payload
      console.log('Delete campaign payload being sent:', payload);
      
      // Make API call to the delete endpoint
      const response = await httpService.post('/sua/postal-cards/delete-campaigns', payload);
      
      // Handle the response format
      if (response.success) {
        return response;
      } else {
        console.log('Campaign deletion failed:', response);
        throw new Error(response.message || 'Failed to delete campaign');
      }
    } catch (error) {
      console.log('Delete campaign API call failed:', error);
      
      // Enhanced error handling
      if (error instanceof Error) {
        if (error.message.includes('422') || error.message.includes('Unprocessable')) {
          throw new Error('Invalid campaign ID. Please refresh and try again.');
        }
      }
      
      throw error;
    }
  }

  async getCampaignAddresses(campaignId: string): Promise<Address[]> {
    try {
      // Make actual API call to backend
      const data = await httpService.get(`/campaigns/${campaignId}/addresses`);
      return data;
    } catch (error) {
      console.log('Get campaign addresses API call failed:', error);
      throw error;
    }
  }
}

export const campaignService = new CampaignService();