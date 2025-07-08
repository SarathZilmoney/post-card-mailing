import { urlService } from './urlService';

class HttpService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private async handleUnauthorized(): Promise<void> {
    // Clear stored token
    localStorage.removeItem('token');
    
    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  private async handleResponse(response: Response): Promise<any> {
    // Check for unauthorized error and logout user
    if (response.status === 401) {
      await this.handleUnauthorized();
      throw new Error('Session expired. Please login again.');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  private async handleCorsError(error: any): Promise<void> {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.log('CORS error detected, logging out and redirecting');
      // Clear stored token
      localStorage.removeItem('token');
      
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      
      throw new Error('Connection error. Please check your network and try again.');
    }
    throw error;
  }

  async get(endpoint: string, options?: RequestInit): Promise<any> {
    const backendUrl = urlService.getBackendUrl();
    const url = `${backendUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          ...this.getAuthHeaders(),
          ...options?.headers,
        },
        ...options,
      });

      return this.handleResponse(response);
    } catch (error) {
      return this.handleCorsError(error);
    }
  }

  async post(endpoint: string, data?: any, options?: RequestInit): Promise<any> {
    const backendUrl = urlService.getBackendUrl();
    const url = `${backendUrl}${endpoint}`;
    
    const isFormData = data instanceof FormData;
    let headers: HeadersInit;
    
    if (isFormData) {
      // For FormData, don't set Content-Type header - let browser set it
      const authHeaders = this.getAuthHeaders();
      const { 'Content-Type': _, ...headersWithoutContentType } = authHeaders as any;
      headers = headersWithoutContentType;
    } else {
      headers = this.getAuthHeaders();
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...headers,
          ...options?.headers,
        },
        body: isFormData ? data : JSON.stringify(data),
        ...options,
      });

      return this.handleResponse(response);
    } catch (error) {
      return this.handleCorsError(error);
    }
  }

  async put(endpoint: string, data?: any, options?: RequestInit): Promise<any> {
    const backendUrl = urlService.getBackendUrl();
    const url = `${backendUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          ...this.getAuthHeaders(),
          ...options?.headers,
        },
        body: JSON.stringify(data),
        ...options,
      });

      return this.handleResponse(response);
    } catch (error) {
      return this.handleCorsError(error);
    }
  }

  async delete(endpoint: string, options?: RequestInit): Promise<any> {
    const backendUrl = urlService.getBackendUrl();
    const url = `${backendUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          ...this.getAuthHeaders(),
          ...options?.headers,
        },
        ...options,
      });

      // Check for unauthorized error and logout user
      if (response.status === 401) {
        await this.handleUnauthorized();
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Some delete operations might not return JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return response.json();
      }
      
      return response.text();
    } catch (error) {
      return this.handleCorsError(error);
    }
  }
}

export const httpService = new HttpService(); 