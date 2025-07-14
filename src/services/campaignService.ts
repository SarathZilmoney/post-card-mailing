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
        return [];
      }
    } catch (error) {
      throw error;
    }
  }

  private mapBackendCampaignToFrontend(backendCampaign: Record<string, unknown>): Campaign {
    // Debug logging in development
    if (import.meta.env.DEV) {
      console.log('Mapping backend campaign to frontend:', backendCampaign);
    }

    // Handle address count - now comes from total_addresses field or default to 0
    const addressCount = (backendCampaign.total_addresses as number) || 0;

    // Map backend status to frontend status - handle null status
    const mapStatus = (status: string | null): 'draft' | 'scheduled' | 'active' | 'completed' | 'paused' => {
      if (!status) return 'draft'; // Default to draft if status is null
      
      switch (status.toLowerCase()) {
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

    // Extract category information - now it's an object or null
    const categoryData = backendCampaign.category as Record<string, unknown> | null;
    const categoryName = categoryData ? (categoryData.name as string) : undefined;

    // Extract postcard design from attachments
    const attachments = backendCampaign.attachments as Array<Record<string, unknown>> | [];
    const postcardDesign = attachments.length > 0 ? (attachments[0].public_url as string) : undefined;

    // Handle run tracking with new backend fields
    const runCount = (backendCampaign.run_count as number) || 0;
    const maxRuns = 3; // Fixed to 3 runs as per requirements
    const nextScheduledRunAt = backendCampaign.next_scheduled_run_at as string | null;
    
    // Calculate run status based on run_count - CAP AT MAXIMUM 3 RUNS
    const currentRun = Math.min(runCount, maxRuns); // Cap at maxRuns
    const totalRuns = Math.min(runCount, maxRuns); // Cap at maxRuns
    const canRunAgain = currentRun < maxRuns;
    const nextRunAvailable = canRunAgain;
    
    // Create run history based on run_count (placeholder data since we don't have detailed run history)
    // Only create history for runs up to maxRuns
    const runHistory: CampaignRun[] = [];
    for (let i = 1; i <= Math.min(runCount, maxRuns); i++) {
      runHistory.push({
        runNumber: i,
        startedAt: new Date().toISOString(), // Placeholder - would need actual data from backend
        completedAt: new Date().toISOString(), // Placeholder - would need actual data from backend
        status: 'completed',
        sentCount: 0, // Placeholder - would need actual data from backend
        deliveredCount: 0, // Placeholder - would need actual data from backend
        returnedCount: 0, // Placeholder - would need actual data from backend
        cost: 0, // Placeholder - would need actual data from backend
        errorMessage: undefined
      });
    }

    return {
      id: (backendCampaign.id as number)?.toString() || '', // Handle case where id might not exist
      encrypted_id: (backendCampaign.encrypted_id as string) || '',
      name: (backendCampaign.campaign_name as string) || '',
      description: (backendCampaign.description as string) || '',
      status: mapStatus(backendCampaign.status as string | null),
      createdAt: (backendCampaign.created_at as string) || new Date().toISOString(),
      scheduledDate: (backendCampaign.start_date as string) || undefined,
      nextScheduledRunAt: nextScheduledRunAt || undefined,
      postcardDesign,
      category: categoryName,
      zipCode: undefined, // Not in new response
      addressCount,
      targetAddressCount: addressCount, // Use same count for now
      sentCount: 0, // Default to 0 since not in new response
      deliveredCount: 0, // Default to 0 since not in new response
      returnedCount: 0, // Default to 0 since not in new response
      cost: 0, // Default to 0 since not in new response
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
        payload.append('category', category || ''); // Send category ID instead of name
        
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
          console.log('Create campaign payload being sent:', {
            campaign_name: campaignName,
            description: description,
            start_date: startDate,
            category_encrypted_id: category,
            zipCode: zipCode,
            hasFile: !!file
          });
        }
        
      } else {
        // Handle object data (convert to FormData) - Note: This path doesn't support file uploads
        throw new Error('Postcard image is required. Please use the campaign creation form.');
      }
      
      // Make API call to the correct endpoint
      const response = await httpService.post('/sua/postal-cards/create-campaign', payload) as {success: boolean, message: string};
      
      // Handle the response format - backend only returns success message, not campaign data
      if (response.success) {
        // Backend doesn't return campaign data, just success confirmation
        // We'll need to refetch campaigns to get the updated list
        return response;
      } else {
        throw new Error(response.message || 'Failed to create campaign');
      }
    } catch (error) {
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
      const encryptedId = campaignData.get('encrypted_id') as string;
      
      // Validate required fields
      if (!encryptedId) {
        throw new Error('Encrypted ID is required');
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
      
      // Only append campaign_id if it's available (for backward compatibility)
      if (campaignId) {
        payload.append('campaign_id', campaignId);
      }
      payload.append('campaign_name', campaignName.trim());
      payload.append('description', description.trim());
      payload.append('start_date', startDate);
      payload.append('category', category || ''); // Send category ID instead of name
      
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
        console.log('Edit campaign - received FormData:', {
          campaign_id: campaignId,
          encrypted_id: encryptedId,
          campaign_name: campaignName,
          description: description,
          start_date: startDate,
          category: category,
          zipCode: zipCode,
          hasFile: !!file
        });
        console.log('Edit campaign payload being sent with encryptedId:', encryptedId);
      }
      
      // Make API call to the update endpoint with encrypted_id in URL
      const response = await httpService.post(`/sua/postal-cards/update-campaign/${encryptedId}`, payload) as {success: boolean, message: string};
      
      // Handle the response format
      if (response.success) {
        return response;
      } else {
        throw new Error(response.message || 'Failed to edit campaign');
      }
    } catch (error) {
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
      const data = await httpService.put(`/campaigns/${id}`, updates) as Record<string, unknown>;
      return this.mapBackendCampaignToFrontend(data);
    } catch (error) {
      throw error;
    }
  }

  async runCampaign(encryptedId: string): Promise<{success: boolean, message: string, campaign?: Campaign}> {
    try {
      // Validate required fields
      if (!encryptedId) {
        throw new Error('Campaign encrypted ID is required');
      }
      
      // Prepare the payload for the backend API with new format
      const payload = {
        campaignId: encryptedId
      };
      
      // Log payload for debugging in development
      if (import.meta.env.DEV) {
        console.log('Run campaign payload being sent:', payload);
      }
      
      // Make API call to the new endpoint
      const response = await httpService.post('/sua/postal-cards/sent-postal-card', payload) as {success: boolean, message: string, campaign?: Record<string, unknown>};
      
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
        throw new Error(response.message || 'Failed to start campaign run');
      }
    } catch (error) {
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
          runNumber: (run.run_number as number) || 0,
          startedAt: (run.started_at as string) || new Date().toISOString(),
          completedAt: (run.completed_at as string) || undefined,
          status: this.mapRunStatus(run.status as string),
          sentCount: (run.sent_count as number) || 0,
          deliveredCount: (run.delivered_count as number) || 0,
          returnedCount: (run.returned_count as number) || 0,
          cost: (run.cost as number) || 0,
          errorMessage: (run.error_message as string) || undefined
        }));
      } else {
        return [];
      }
    } catch (error) {
      throw new Error('Failed to fetch campaign run history');
    }
  }

  async stopCampaign(id: string): Promise<Campaign> {
    try {
      // Make actual API call to backend
      const data = await httpService.post(`/campaigns/${id}/stop`) as Record<string, unknown>;
      return this.mapBackendCampaignToFrontend(data);
    } catch (error) {
      throw error;
    }
  }

  async deleteCampaign(encryptedId: string): Promise<{success: boolean, message: string}> {
    try {
      // Validate required fields
      if (!encryptedId) {
        throw new Error('Campaign encrypted ID is required');
      }
      
      // Log request for debugging in development
      if (import.meta.env.DEV) {
        console.log('Delete campaign request being sent for encrypted ID:', encryptedId);
      }
      
      // Make API call to the delete endpoint with encrypted_id in URL
      const response = await httpService.delete(`/sua/postal-cards/campaign/${encryptedId}`) as {success: boolean, message: string};
      
      // Handle the response format
      if (response.success) {
        return response;
      } else {
        throw new Error(response.message || 'Failed to delete campaign');
      }
    } catch (error) {
      // Enhanced error handling
      if (error instanceof Error) {
        if (error.message.includes('422') || error.message.includes('Unprocessable')) {
          throw new Error('Invalid campaign ID. Please refresh and try again.');
        }
        if (error.message.includes('404')) {
          throw new Error('Campaign not found. Please refresh the page and try again.');
        }
        if (error.message.includes('403')) {
          throw new Error('Access denied. You do not have permission to delete this campaign.');
        }
        if (error.message.includes('500')) {
          throw new Error('Server error occurred while deleting the campaign. Please try again later.');
        }
      }
      
      throw error;
    }
  }

  async getCampaignAddresses(campaignId: string): Promise<Address[]> {
    try {
      // Make actual API call to backend
      const data = await httpService.get(`/campaigns/${campaignId}/addresses`) as Address[];
      return data;
    } catch (error) {
      throw error;
    }
  }
}

export const campaignService = new CampaignService();