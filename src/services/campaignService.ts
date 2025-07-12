import { Campaign, Address, CampaignRun } from '../types';
import { httpService } from './httpService';

class CampaignService {
  async getCampaigns(): Promise<Campaign[]> {
    try {
      // Make API call to the backend
      const response = await httpService.get('/sua/postal-cards/get-campaigns') as {success: boolean, data: any[]};
      
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

  private mapBackendCampaignToFrontend(backendCampaign: Record<string, unknown>): Campaign {
    // Parse postal addresses to count them
    let addressCount = 0;
    try {
      if (backendCampaign.postal_addresses) {
        const addresses = JSON.parse(backendCampaign.postal_addresses as string);
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

    // Parse run history from backend
    const parseRunHistory = (runHistoryData: unknown): CampaignRun[] => {
      try {
        if (!runHistoryData) return [];
        
        const runs = Array.isArray(runHistoryData) ? runHistoryData : 
                     typeof runHistoryData === 'string' ? JSON.parse(runHistoryData) : [];
        
        return runs.map((run: Record<string, unknown>) => ({
          runNumber: run.run_number || 0,
          startedAt: run.started_at || new Date().toISOString(),
          completedAt: run.completed_at || undefined,
          status: this.mapRunStatus(run.status),
          sentCount: run.sent_count || 0,
          deliveredCount: run.delivered_count || 0,
          returnedCount: run.returned_count || 0,
          cost: run.cost || 0,
          errorMessage: run.error_message || undefined
        }));
      } catch (error) {
        console.log('Failed to parse run history:', error);
        return [];
      }
    };

    const runHistory = parseRunHistory(backendCampaign.run_history);
    const currentRun = (backendCampaign.current_run as number) || 0;
    const maxRuns = 3; // Fixed to 3 runs
    const totalRuns = runHistory.length;
    const canRunAgain = currentRun < maxRuns && (backendCampaign.status as string) !== 'completed';
    const nextRunAvailable = currentRun < maxRuns && (runHistory.length === 0 || runHistory[runHistory.length - 1]?.status === 'completed');

    return {
      id: (backendCampaign.id as number).toString(),
      name: (backendCampaign.campaign_name as string) || '',
      description: (backendCampaign.description as string) || '',
      status: mapStatus(backendCampaign.status as string),
      createdAt: (backendCampaign.created_at as string) || new Date().toISOString(),
      scheduledDate: (backendCampaign.start_date as string) || undefined,
      postcardDesign: (backendCampaign.file_path as string) || undefined,
      category: (backendCampaign.category_id as string) || undefined, // category_id contains the category name
      zipCode: (backendCampaign.zip_code as string) || undefined,
      addressCount,
      targetAddressCount: addressCount, // Use same count for now
      sentCount: runHistory.reduce((sum, run) => sum + run.sentCount, 0),
      deliveredCount: runHistory.reduce((sum, run) => sum + run.deliveredCount, 0),
      returnedCount: runHistory.reduce((sum, run) => sum + run.returnedCount, 0),
      cost: runHistory.reduce((sum, run) => sum + run.cost, 0),
      // Run tracking fields
      currentRun,
      totalRuns,
      maxRuns,
      runHistory,
      canRunAgain,
      nextRunAvailable
    };
  }

  private mapRunStatus(status: string): 'pending' | 'running' | 'completed' | 'failed' {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'pending';
      case 'running':
      case 'active':
        return 'running';
      case 'completed':
      case 'finished':
        return 'completed';
      case 'failed':
      case 'error':
        return 'failed';
      default:
        return 'pending';
    }
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
        payload.append('category_id', category || ''); // Send category ID instead of name
        
        // Add zip code if provided
        const zipCode = campaignData.get('zipCode') as string;
        if (zipCode?.trim()) {
          payload.append('zip_code', zipCode.trim());
        }
        
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
        
        // Log payload for debugging in development
        if (import.meta.env.DEV) {
          console.log('Campaign payload being sent');
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
      payload.append('category_id', category || ''); // Send category ID instead of name
      
      // Add zip code if provided
      const zipCode = campaignData.get('zipCode') as string;
      if (zipCode?.trim()) {
        payload.append('zip_code', zipCode.trim());
      }
      
      // File is optional for edit - only add if provided
      const file = campaignData.get('postcardImage') as File;
      if (file && file.size > 0) {
        // Validate file
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          throw new Error('File size must be less than 5MB');
        }
        payload.append('file', file);
      }
      
      // Log payload for debugging in development
      if (import.meta.env.DEV) {
        console.log('Edit campaign payload being sent');
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

  async runCampaign(id: string): Promise<{success: boolean, message: string, campaign?: Campaign}> {
    try {
      // Validate required fields
      if (!id) {
        throw new Error('Campaign ID is required');
      }
      
      // Prepare the payload for the backend API
      const payload = {
        campaign_id: id
      };
      
      // Log payload for debugging in development
      if (import.meta.env.DEV) {
        console.log('Run campaign payload being sent');
      }
      
      // Make API call to the correct endpoint
      const response = await httpService.post('/sua/sent-postal-cards', payload);
      
      // Handle the response format
      if (response.success) {
        // Map the returned campaign data if available
        const campaign = response.campaign ? this.mapBackendCampaignToFrontend(response.campaign) : undefined;
        
        return {
          success: true,
          message: response.message || 'Campaign run started successfully!',
          campaign
        };
      } else {
        console.log('Campaign run failed:', response);
        throw new Error(response.message || 'Failed to start campaign run');
      }
    } catch (error) {
      console.log('Run campaign API call failed:', error);
      
      // Enhanced error handling for different response codes
      if (error instanceof Error) {
        if (error.message.includes('422') || error.message.includes('Unprocessable')) {
          throw new Error('Invalid campaign data. Please check the campaign configuration and try again.');
        }
        if (error.message.includes('404')) {
          throw new Error('Campaign not found. Please refresh the page and try again.');
        }
        if (error.message.includes('400')) {
          throw new Error('Campaign cannot be started. Please check if the campaign is properly configured.');
        }
        if (error.message.includes('500')) {
          throw new Error('Server error occurred while starting the campaign. Please try again later.');
        }
      }
      
      throw error;
    }
  }

  async getRunHistory(id: string): Promise<CampaignRun[]> {
    try {
      const response = await httpService.get(`/sua/postal-cards/campaign-runs/${id}`) as {success: boolean, data: any[]};
      
      if (response.success && response.data) {
        return response.data.map((run: Record<string, unknown>) => ({
          runNumber: run.run_number || 0,
          startedAt: run.started_at || new Date().toISOString(),
          completedAt: run.completed_at || undefined,
          status: this.mapRunStatus(run.status),
          sentCount: run.sent_count || 0,
          deliveredCount: run.delivered_count || 0,
          returnedCount: run.returned_count || 0,
          cost: run.cost || 0,
          errorMessage: run.error_message || undefined
        }));
      } else {
        console.log('Failed to fetch run history:', response);
        return [];
      }
    } catch (error) {
      console.log('Get run history API call failed:', error);
      throw new Error('Failed to fetch campaign run history');
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
      
      // Log payload for debugging in development
      if (import.meta.env.DEV) {
        console.log('Delete campaign payload being sent');
      }
      
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