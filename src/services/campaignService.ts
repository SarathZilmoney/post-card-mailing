import { Campaign, Address } from '../types';

class CampaignService {
  async getCampaigns(): Promise<Campaign[]> {
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

  async createCampaign(campaignData: Partial<Campaign>): Promise<Campaign> {
    const newCampaign: Campaign = {
      id: Date.now().toString(),
      name: campaignData.name || '',
      description: campaignData.description || '',
      status: 'draft',
      createdAt: new Date().toISOString(),
      addressCount: 0,
      sentCount: 0,
      deliveredCount: 0,
      returnedCount: 0,
      cost: 0,
      ...campaignData
    };
    return newCampaign;
  }

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign> {
    // Mock update
    const campaigns = await this.getCampaigns();
    const campaign = campaigns.find(c => c.id === id);
    if (!campaign) throw new Error('Campaign not found');
    
    return { ...campaign, ...updates };
  }

  async deleteCampaign(id: string): Promise<void> {
    // Mock delete
    console.log('Deleting campaign:', id);
  }

  async getCampaignAddresses(campaignId: string): Promise<Address[]> {
    // Mock addresses for campaign
    return [];
  }
}

export const campaignService = new CampaignService();