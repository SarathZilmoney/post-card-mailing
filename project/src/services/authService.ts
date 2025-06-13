import { User } from '../types';

interface LoginResponse {
  user: User;
  token: string;
}

class AuthService {
  async login(email: string, password: string): Promise<LoginResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock login for demo purposes
    if (email === 'admin@example.com' && password === 'password') {
      const mockUser: User = {
        id: '1',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin'
      };
      return {
        user: mockUser,
        token: 'mock-jwt-token-' + Date.now()
      };
    }
    
    throw new Error('Invalid credentials');
  }

  async validateToken(token: string): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock validation for demo
    if (token && token.startsWith('mock-jwt-token')) {
      return {
        id: '1',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin'
      };
    }
    
    throw new Error('Invalid token');
  }

  async logout(): Promise<void> {
    // Clear any stored data if needed
    return Promise.resolve();
  }
}

export const authService = new AuthService();