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

  private async handleResponse(response: Response): Promise<unknown> {
    // Check for unauthorized error and logout user
    if (response.status === 401) {
      await this.handleUnauthorized();
      throw new Error('Session expired. Please login again.');
    }

    if (!response.ok) {
      // Handle specific HTTP errors
      if (response.status === 403) {
        throw new Error('Access denied. You do not have permission to perform this action.');
      }
      if (response.status === 404) {
        throw new Error('The requested resource was not found.');
      }
      if (response.status === 500) {
        throw new Error('Server error. Please try again later.');
      }
      if (response.status >= 400 && response.status < 500) {
        throw new Error('Bad request. Please check your data and try again.');
      }
      
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  private async handleCorsError(error: unknown): Promise<void> {
    // Only trigger logout for specific network errors that indicate auth issues
    if (error instanceof TypeError && error.message.includes('fetch')) {
      // Check if it's a CORS error specifically related to authentication
      if (error.message.includes('401') || error.message.includes('unauthorized')) {
        // Clear stored token
        localStorage.removeItem('token');
        
        // Redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        
        throw new Error('Session expired. Please login again.');
      }
      
      // For other network errors, don't logout
      throw new Error('Network error. Please check your connection and try again.');
    }
    throw error;
  }

  async get(endpoint: string, options?: RequestInit): Promise<unknown> {
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

  async post(endpoint: string, data?: unknown, options?: RequestInit): Promise<unknown> {
    const backendUrl = urlService.getBackendUrl();
    const url = `${backendUrl}${endpoint}`;
    
    const isFormData = data instanceof FormData;
    let headers: HeadersInit;
    
    if (isFormData) {
      // For FormData, don't set Content-Type header - let browser set it
      const authHeaders = this.getAuthHeaders();
      const { 'Content-Type': contentType, ...headersWithoutContentType } = authHeaders as Record<string, string>;
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

  async put(endpoint: string, data?: unknown, options?: RequestInit): Promise<unknown> {
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

  async delete(endpoint: string, options?: RequestInit): Promise<unknown> {
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
        // Handle specific HTTP errors
        if (response.status === 403) {
          throw new Error('Access denied. You do not have permission to perform this action.');
        }
        if (response.status === 404) {
          throw new Error('The requested resource was not found.');
        }
        if (response.status === 500) {
          throw new Error('Server error. Please try again later.');
        }
        
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