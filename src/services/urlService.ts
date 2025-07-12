import { API_BASE_URL } from '../config/constants';

class UrlService {
  private static readonly STORAGE_KEY = 'temp_backend_url';

  /**
   * Get the current backend URL to use for API calls
   * Returns the temporary override URL if set, otherwise returns the environment-based URL
   */
  getBackendUrl(): string {
    const tempUrl = this.getTempBackendUrl();
    return tempUrl || API_BASE_URL;
  }

  /**
   * Set a temporary backend URL override
   * This will be used for all API calls until cleared or session ends
   */
  setTempBackendUrl(url: string): void {
    if (url.trim()) {
      // Ensure URL doesn't end with slash
      let cleanUrl = url.trim().replace(/\/$/, '');
      
      // Append /api if it's not already there
      if (!cleanUrl.endsWith('/api')) {
        cleanUrl += '/api';
      }
      
      sessionStorage.setItem(UrlService.STORAGE_KEY, cleanUrl);
    }
  }

  /**
   * Get the current temporary backend URL override
   */
  getTempBackendUrl(): string | null {
    return sessionStorage.getItem(UrlService.STORAGE_KEY);
  }

  /**
   * Clear the temporary backend URL override
   * This will revert to using the environment-based URL
   */
  clearTempBackendUrl(): void {
    sessionStorage.removeItem(UrlService.STORAGE_KEY);
  }

  /**
   * Check if a temporary backend URL is currently set
   */
  hasTempBackendUrl(): boolean {
    return this.getTempBackendUrl() !== null;
  }

  /**
   * Get the default backend URL from environment
   */
  getDefaultBackendUrl(): string {
    return API_BASE_URL;
  }

  /**
   * Build a complete API URL with the given endpoint
   */
  buildApiUrl(endpoint: string): string {
    const baseUrl = this.getBackendUrl();
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${baseUrl}/${cleanEndpoint}`;
  }
}

export const urlService = new UrlService(); 