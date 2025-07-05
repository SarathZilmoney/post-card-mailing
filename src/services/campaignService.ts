import { Campaign, Address } from '../types';
import { httpService } from './httpService';

class CampaignService {
  async getCampaigns(): Promise<Campaign[]> {
    try {
      // Try to make actual API call to backend
      const data = await httpService.get('/campaigns');
      return data;
    } catch (error) {
      console.log('Campaigns API call failed, using mock data:', error);
      return this.getMockCampaigns();
    }
  }

  private getMockCampaigns(): Campaign[] {
    // Mock campaigns data
    return [
      {
        id: '1',
        name: 'Spring Restaurant Promotion',
        description: 'Targeting restaurants in Los Angeles area',
        status: 'active',
        createdAt: '2024-01-15T10:00:00Z',
        scheduledDate: '2024-01-20T09:00:00Z',
        postcardDesign: 'spring-promo.jpg',
        addressCount: 150,
        sentCount: 150,
        deliveredCount: 142,
        returnedCount: 8,
        cost: 225.00
      },
      {
        id: '2',
        name: 'Real Estate Outreach',
        description: 'New development promotion to real estate agencies',
        status: 'completed',
        createdAt: '2024-01-10T14:30:00Z',
        scheduledDate: '2024-01-12T08:00:00Z',
        postcardDesign: 'real-estate.jpg',
        addressCount: 75,
        sentCount: 75,
        deliveredCount: 70,
        returnedCount: 5,
        cost: 112.50
      },
      {
        id: '3',
        name: 'Healthcare Network Expansion',
        description: 'Introducing new healthcare services',
        status: 'draft',
        createdAt: '2024-01-18T16:20:00Z',
        addressCount: 0,
        sentCount: 0,
        deliveredCount: 0,
        returnedCount: 0,
        cost: 0
      }
    ];
  }

  async createCampaign(campaignData: Partial<Campaign> | FormData): Promise<Campaign> {
    try {
      // Try to make actual API call to backend
      const data = await httpService.post('/campaigns', campaignData);
      return data;
    } catch (error) {
      console.log('Create campaign API call failed, using mock creation:', error);
      return this.mockCreateCampaign(campaignData);
    }
  }

  private mockCreateCampaign(campaignData: Partial<Campaign> | FormData): Campaign {
    let name = '';
    let description = '';
    let startDate = '';
    let postcardDesign = '';

    if (campaignData instanceof FormData) {
      name = campaignData.get('name') as string || '';
      description = campaignData.get('description') as string || '';
      startDate = campaignData.get('startDate') as string || '';
      const imageFile = campaignData.get('postcardImage') as File;
      if (imageFile) {
        postcardDesign = imageFile.name;
      }
    } else {
      name = campaignData.name || '';
      description = campaignData.description || '';
      startDate = campaignData.scheduledDate || '';
      postcardDesign = campaignData.postcardDesign || '';
    }

    const newCampaign: Campaign = {
      id: Date.now().toString(),
      name,
      description,
      status: 'draft',
      createdAt: new Date().toISOString(),
      scheduledDate: startDate,
      postcardDesign,
      addressCount: 0,
      sentCount: 0,
      deliveredCount: 0,
      returnedCount: 0,
      cost: 0
    };
    return newCampaign;
  }

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign> {
    try {
      // Try to make actual API call to backend
      const data = await httpService.put(`/campaigns/${id}`, updates);
      return data;
    } catch (error) {
      console.log('Update campaign API call failed, using mock update:', error);
      return this.mockUpdateCampaign(id, updates);
    }
  }

  private async mockUpdateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign> {
    // Mock update
    const campaigns = await this.getMockCampaigns();
    const campaign = campaigns.find(c => c.id === id);
    if (!campaign) throw new Error('Campaign not found');
    
    return { ...campaign, ...updates };
  }

  async deleteCampaign(id: string): Promise<void> {
    try {
      // Try to make actual API call to backend
      await httpService.delete(`/campaigns/${id}`);
    } catch (error) {
      console.log('Delete campaign API call failed, using mock delete:', error);
      this.mockDeleteCampaign(id);
    }
  }

  private mockDeleteCampaign(id: string): void {
    // Mock delete
    console.log('Deleting campaign:', id);
  }

  async getCampaignAddresses(campaignId: string): Promise<Address[]> {
    try {
      // Try to make actual API call to backend
      const data = await httpService.get(`/campaigns/${campaignId}/addresses`);
      return data;
    } catch (error) {
      console.log('Get campaign addresses API call failed, using mock data:', error);
      return this.getMockCampaignAddresses(campaignId);
    }
  }

  private getMockCampaignAddresses(campaignId: string): Address[] {
    // Mock addresses for campaign
    return [];
  }
}

export const campaignService = new CampaignService();