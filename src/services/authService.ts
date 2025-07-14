import { User, LoginResponse } from '../types';
import { urlService } from './urlService';

class AuthService {
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const backendUrl = urlService.getBackendUrl();
    
    try {
      // Make actual API call to the sua/login endpoint
      const response = await fetch(`${backendUrl}/sua/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data: LoginResponse = await response.json();
        
        if (data.success && data.data) {
          return {
            user: data.data.admin,
            token: data.data.token
          };
        } else {
          throw new Error('Login failed');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Login failed');
      }
    } catch (error) {
      // Check if it's a CORS error or network error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        // This is likely a CORS error or network error
        const corsError = new Error('CORS_ERROR');
        corsError.name = 'CORSError';
        throw corsError;
      }
      // Re-throw other errors
      throw error;
    }
  }

  // Commented out authentication validation function as requested
  // async validateToken(token: string): Promise<User> {
  //   const backendUrl = urlService.getBackendUrl();
  //   
  //   // Make actual API call to backend
  //   const response = await fetch(`${backendUrl}/sua/validate`, {
  //     method: 'GET',
  //     headers: {
  //       'Authorization': `Bearer ${token}`,
  //       'Content-Type': 'application/json',
  //     },
  //   });

  //   if (response.ok) {
  //     const data = await response.json();
  //     return data.data?.admin || data.admin || data.user;
  //   } else {
  //     throw new Error('Token validation failed');
  //   }
  // }

  async logout(): Promise<void> {
    const backendUrl = urlService.getBackendUrl();
    
    try {
      // Try to make actual API call to backend
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(`${backendUrl}/sua/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      // If API call fails, just continue with local logout
    }
    
    // Clear any stored data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}

export const authService = new AuthService();