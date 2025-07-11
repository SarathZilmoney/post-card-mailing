import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User, AuthContextType } from '../types';
import { authService } from '../services/authService';

interface AuthState {
  user: User | null;
  loading: boolean;
}

type AuthAction = 
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_ERROR' }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true };
    case 'LOGIN_SUCCESS':
      return { user: action.payload, loading: false };
    case 'LOGIN_ERROR':
      return { user: null, loading: false };
    case 'LOGOUT':
      return { user: null, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    loading: true
  });

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
          try {
            // Parse the stored user data
            const user: User = JSON.parse(userData);
            dispatch({ type: 'LOGIN_SUCCESS', payload: user });
          } catch (parseError) {
            console.error('Failed to parse stored user data:', parseError);
            // Clear invalid data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            dispatch({ type: 'SET_LOADING', payload: false });
          }
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      const { user, token } = await authService.login(email, password);
      
      // Store both token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      return Promise.resolve();
    } catch (error: unknown) {
      // If it's a CORS error, logout and redirect to login
      if (error instanceof Error && (error.name === 'CORSError' || error.message === 'CORS_ERROR')) {
        // Handle CORS error during login
        await logout();
        // Force redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        dispatch({ type: 'LOGIN_ERROR' });
        throw new Error('Connection error. Please check your network and try again.');
      }
      
      dispatch({ type: 'LOGIN_ERROR' });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    // Clear both token and user data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    dispatch({ type: 'LOGOUT' });
  };

  const value: AuthContextType = {
    user: state.user,
    login,
    logout,
    loading: state.loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext }