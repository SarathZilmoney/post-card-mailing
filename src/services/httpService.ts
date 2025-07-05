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

  async get(endpoint: string, options?: RequestInit): Promise<any> {
    const backendUrl = urlService.getBackendUrl();
    const url = `${backendUrl}${endpoint}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...this.getAuthHeaders(),
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async post(endpoint: string, data?: any, options?: RequestInit): Promise<any> {
    const backendUrl = urlService.getBackendUrl();
    const url = `${backendUrl}${endpoint}`;
    
    const isFormData = data instanceof FormData;
    const headers = isFormData 
      ? { ...this.getAuthHeaders(), 'Content-Type': undefined } 
      : this.getAuthHeaders();

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...headers,
        ...options?.headers,
      },
      body: isFormData ? data : JSON.stringify(data),
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async put(endpoint: string, data?: any, options?: RequestInit): Promise<any> {
    const backendUrl = urlService.getBackendUrl();
    const url = `${backendUrl}${endpoint}`;
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        ...this.getAuthHeaders(),
        ...options?.headers,
      },
      body: JSON.stringify(data),
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async delete(endpoint: string, options?: RequestInit): Promise<any> {
    const backendUrl = urlService.getBackendUrl();
    const url = `${backendUrl}${endpoint}`;
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        ...this.getAuthHeaders(),
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Some delete operations might not return JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    
    return response.text();
  }
}

export const httpService = new HttpService(); 