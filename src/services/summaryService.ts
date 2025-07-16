import { httpService } from './httpService';

export interface SummaryResponse {
  success: boolean;
  data: {
    total_addresses: number;
    total_categories: number;
  };
}

export interface SummaryData {
  total_addresses: number;
  total_categories: number;
}

class SummaryService {
  async getSummary(): Promise<SummaryData> {
    try {
      const response = await httpService.get('/sua/postal-cards/summary') as SummaryResponse;
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error('Invalid response format from summary endpoint');
      }
    } catch (error) {
      // Check if it's an authentication error
      if (error instanceof Error && error.message.includes('Session expired')) {
        // Re-throw authentication errors to trigger proper logout
        throw error;
      }
      
      // For other errors, provide a user-friendly message without triggering logout
      throw new Error('Unable to load summary data. Please check your connection and try again.');
    }
  }
}

export const summaryService = new SummaryService(); 