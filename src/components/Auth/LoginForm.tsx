import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Settings, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { BackendUrlModal } from './BackendUrlModal';
import { urlService } from '../../services/urlService';
import toast from 'react-hot-toast';

interface LoginFormData {
  email: string;
  password: string;
}

export const LoginForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showBackendUrlModal, setShowBackendUrlModal] = useState(false);
  const { login, loading } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/';
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (error: unknown) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Invalid credentials. Please try again.';
      toast.error(errorMessage);
      setError('email', { message: errorMessage });
    }
  };

  return (
    <div className={`min-h-screen flex ${
      isDark 
        ? 'bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800' 
        : 'bg-gradient-light-brand'
    }`}>
      {/* Login Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <div className="flex items-center space-x-3 mb-8">
              <div className={`w-12 h-12 ${
                isDark 
                  ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
                  : 'bg-gradient-to-br from-brand-primary-500 to-brand-secondary-500'
              } rounded-xl flex items-center justify-center animate-pulse-glow`}>
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${
                  isDark ? 'gradient-text' : 'gradient-text-light'
                }`}>PostCard Pro</h1>
                <p className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-light-600'
                }`}>Campaign Manager</p>
              </div>
            </div>
            <h2 className={`text-3xl font-extrabold ${
              isDark ? 'text-white' : 'text-light-900'
            }`}>
              Sign in to your account
            </h2>
            <p className={`mt-2 text-sm ${
              isDark ? 'text-gray-400' : 'text-light-600'
            }`}>
              Welcome back! Please enter your details.
            </p>
          </div>

          <div className="mt-8">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label htmlFor="email" className={`block text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-light-700'
                }`}>
                  Email address
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className={`h-5 w-5 ${
                      isDark ? 'text-gray-400' : 'text-light-600'
                    }`} />
                  </div>
                  <input
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /\S+@\S+\.\S+/,
                        message: 'Please enter a valid email'
                      }
                    })}
                    type="email"
                    autoComplete="email"
                    className={`appearance-none block w-full pl-10 pr-3 py-3 border ${
                      errors.email
                        ? 'border-red-400 focus:ring-red-500 focus:border-red-500'
                        : isDark
                          ? 'border-dark-600 focus:ring-purple-500 focus:border-purple-500'
                          : 'border-light-300 focus:ring-brand-primary-500 focus:border-brand-primary-500'
                    } rounded-lg shadow-sm placeholder-${
                      isDark ? 'gray-500' : 'light-600'
                    } ${
                      isDark 
                        ? 'bg-dark-800/50 text-white' 
                        : 'bg-light-100/70 text-light-900'
                    } focus:outline-none focus:ring-2 transition-all duration-200`}
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-400">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className={`block text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-light-700'
                }`}>
                  Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className={`h-5 w-5 ${
                      isDark ? 'text-gray-400' : 'text-light-600'
                    }`} />
                  </div>
                  <input
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    })}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className={`appearance-none block w-full pl-10 pr-10 py-3 border ${
                      errors.password
                        ? 'border-red-400 focus:ring-red-500 focus:border-red-500'
                        : isDark
                          ? 'border-dark-600 focus:ring-purple-500 focus:border-purple-500'
                          : 'border-light-300 focus:ring-brand-primary-500 focus:border-brand-primary-500'
                    } rounded-lg shadow-sm placeholder-${
                      isDark ? 'gray-500' : 'light-600'
                    } ${
                      isDark 
                        ? 'bg-dark-800/50 text-white' 
                        : 'bg-light-100/70 text-light-900'
                    } focus:outline-none focus:ring-2 transition-all duration-200`}
                    placeholder="Enter your password"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      className={`${
                        isDark ? 'text-gray-400 hover:text-gray-300' : 'text-light-600 hover:text-light-700'
                      } transition-colors`}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-400">{errors.password.message}</p>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white ${
                    isDark ? 'btn-gradient' : 'btn-light'
                  } focus:outline-none focus:ring-2 ${
                    isDark ? 'focus:ring-purple-500' : 'focus:ring-brand-primary-500'
                  } focus:ring-offset-2 ${
                    isDark ? 'focus:ring-offset-dark-900' : 'focus:ring-offset-light-50'
                  } disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200`}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className={`animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2`}></div>
                      Signing in...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Sign in
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </button>
              </div>

              <div className={`mt-6 pt-6 border-t ${
                isDark ? 'border-dark-600' : 'border-light-300'
              }`}>
                <button
                  type="button"
                  onClick={() => setShowBackendUrlModal(true)}
                  className={`w-full flex items-center justify-center px-4 py-2 border ${
                    isDark 
                      ? 'border-dark-600 text-gray-400 hover:text-gray-300 hover:border-gray-500' 
                      : 'border-light-300 text-light-700 hover:text-light-900 hover:border-light-400'
                  } rounded-lg transition-all duration-200 text-sm`}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Configure Backend URL
                  {urlService.hasTempBackendUrl() && (
                    <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-600'
                    }`}>
                      Override
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Welcome Panel */}
      <div className={`hidden lg:block relative w-0 flex-1 ${
        isDark 
          ? 'bg-gradient-to-br from-purple-900/20 via-dark-800 to-pink-900/20' 
          : 'bg-gradient-to-br from-brand-primary-50 via-light-100 to-brand-secondary-50'
      }`}>
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center">
            <div className={`w-24 h-24 ${
              isDark 
                ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
                : 'bg-gradient-to-br from-brand-primary-500 to-brand-secondary-500'
            } rounded-2xl flex items-center justify-center mx-auto mb-8 animate-float`}>
              <Mail className="h-12 w-12 text-white" />
            </div>
            <h2 className={`text-4xl font-bold ${
              isDark ? 'text-white' : 'text-light-900'
            } mb-4`}>
              Welcome to PostCard Pro
            </h2>
            <p className={`text-lg ${
              isDark ? 'text-gray-300' : 'text-light-700'
            } max-w-md mx-auto`}>
              The ultimate platform for managing your postcard marketing campaigns with precision and ease.
            </p>
            <div className="mt-8 space-y-4">
              <div className={`flex items-center space-x-3 ${
                isDark ? 'text-gray-300' : 'text-light-700'
              }`}>
                <div className={`w-8 h-8 ${
                  isDark 
                    ? 'bg-purple-500/20' 
                    : 'bg-brand-primary-100'
                } rounded-lg flex items-center justify-center`}>
                  <span className="text-sm font-bold">1</span>
                </div>
                <span>Create targeted campaigns</span>
              </div>
              <div className={`flex items-center space-x-3 ${
                isDark ? 'text-gray-300' : 'text-light-700'
              }`}>
                <div className={`w-8 h-8 ${
                  isDark 
                    ? 'bg-purple-500/20' 
                    : 'bg-brand-primary-100'
                } rounded-lg flex items-center justify-center`}>
                  <span className="text-sm font-bold">2</span>
                </div>
                <span>Manage address lists</span>
              </div>
              <div className={`flex items-center space-x-3 ${
                isDark ? 'text-gray-300' : 'text-light-700'
              }`}>
                <div className={`w-8 h-8 ${
                  isDark 
                    ? 'bg-purple-500/20' 
                    : 'bg-brand-primary-100'
                } rounded-lg flex items-center justify-center`}>
                  <span className="text-sm font-bold">3</span>
                </div>
                <span>Track performance analytics</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BackendUrlModal 
        isOpen={showBackendUrlModal} 
        onClose={() => setShowBackendUrlModal(false)} 
      />
    </div>
  );
};