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
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error?.message || 'Invalid credentials. Please try again.';
      toast.error(errorMessage);
      setError('email', { message: errorMessage });
    }
  };

  return (
    <div className={`min-h-screen ${
      isDark 
        ? 'bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800' 
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
    } flex`}>
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`abstract-shape w-96 h-96 -top-24 -left-24 animate-float ${
          isDark ? '' : 'opacity-20'
        }`}></div>
        <div className={`abstract-shape w-64 h-64 top-1/2 -right-16 animate-float ${
          isDark ? '' : 'opacity-20'
        }`} style={{ animationDelay: '2s' }}></div>
        <div className={`abstract-shape w-48 h-48 bottom-24 left-1/4 animate-float ${
          isDark ? '' : 'opacity-20'
        }`} style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Login Form Panel */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md">
          {/* Logo/Brand */}
          <div className="text-center mb-8 animate-slideUp">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
              PostCard Pro
            </h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
              Sign in to your account
            </p>
          </div>

          {/* Login Form */}
          <div className={`${
            isDark ? 'glass-dark' : 'glass bg-white/70'
          } rounded-2xl p-8 shadow-2xl animate-slideUp border ${
            isDark ? 'border-white/10' : 'border-gray-200/50'
          }`} style={{ animationDelay: '0.2s' }}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  </div>
                  <input
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    type="email"
                    className={`w-full pl-10 pr-4 py-3 ${
                      isDark 
                        ? 'bg-dark-800/50 border-dark-600 text-white placeholder-gray-500' 
                        : 'bg-white/50 border-gray-300 text-gray-900 placeholder-gray-400'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200`}
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && (
                  <p className="text-pink-400 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
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
                    className={`w-full pl-10 pr-12 py-3 ${
                      isDark 
                        ? 'bg-dark-800/50 border-dark-600 text-white placeholder-gray-500' 
                        : 'bg-white/50 border-gray-300 text-gray-900 placeholder-gray-400'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute inset-y-0 right-0 pr-3 flex items-center ${
                      isDark 
                        ? 'text-gray-400 hover:text-gray-300' 
                        : 'text-gray-500 hover:text-gray-700'
                    } transition-colors`}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-pink-400 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-gradient py-3 px-4 rounded-lg font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center group"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="spinner mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Backend URL Configuration */}
            <div className={`mt-6 pt-6 border-t ${
              isDark ? 'border-dark-600' : 'border-gray-200'
            }`}>
              <button
                type="button"
                onClick={() => setShowBackendUrlModal(true)}
                className={`w-full flex items-center justify-center px-4 py-2 border ${
                  isDark 
                    ? 'border-dark-600 text-gray-400 hover:text-gray-300 hover:border-gray-500' 
                    : 'border-gray-300 text-gray-600 hover:text-gray-700 hover:border-gray-400'
                } rounded-lg transition-all duration-200 text-sm`}
              >
                <Settings className="h-4 w-4 mr-2" />
                Configure Backend URL
                {urlService.hasTempBackendUrl() && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400">
                    Override
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Welcome Panel */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <div className="max-w-lg text-center animate-slideUp" style={{ animationDelay: '0.4s' }}>
          <div className="mb-8">
            <h2 className="text-6xl font-bold gradient-text mb-6">
              Welcome.
            </h2>
            <p className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              Manage your postcard campaigns with ease and precision.
            </p>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Sign in to access your dashboard and start creating amazing campaigns that convert.
            </p>
          </div>
          
          {/* Decorative elements */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-3xl animate-pulse"></div>
            <div className={`relative bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-3xl p-8 backdrop-blur-sm ${
              isDark ? '' : 'border border-white/20'
            }`}>
              <div className="grid grid-cols-3 gap-4">
                <div className="h-2 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full animate-pulse"></div>
                <div className="h-2 bg-gradient-to-r from-pink-400 to-pink-600 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <div className="h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Backend URL Modal */}
      <BackendUrlModal
        isOpen={showBackendUrlModal}
        onClose={() => setShowBackendUrlModal(false)}
      />
    </div>
  );
};