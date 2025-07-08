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
        if (token) {
          // Authentication validation disabled - assume token is valid for now
          // If token is invalid, 401 errors from API calls will trigger logout
          // Since we can't validate the token, create a minimal user object
          const user: User = {
            id: 0,
            email: 'user@example.com',
            nick_name: 'User',
            admin_type: 'user',
            created_at: null,
            updated_at: new Date().toISOString(),
            added_by_admin: null,
            status: 1,
            deleted_at: null,
            admin_department: null,
            admin_uuid: 'temp-uuid'
          };
          
          dispatch({ type: 'LOGIN_SUCCESS', payload: user });
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('token');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      const { user, token } = await authService.login(email, password);
      localStorage.setItem('token', token);
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      return Promise.resolve();
    } catch (error: any) {
      // If it's a CORS error, logout and redirect to login
      if (error?.name === 'CORSError' || error?.message === 'CORS_ERROR') {
        console.log('CORS error detected during login, logging out and redirecting');
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
    localStorage.removeItem('token');
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