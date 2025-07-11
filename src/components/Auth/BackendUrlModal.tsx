import React, { useState } from 'react';
import { X, Server, AlertCircle, CheckCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { urlService } from '../../services/urlService';
import toast from 'react-hot-toast';

interface BackendUrlModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackendUrlModal: React.FC<BackendUrlModalProps> = ({ isOpen, onClose }) => {
  const { isDark } = useTheme();
  const [backendUrl, setBackendUrl] = useState(urlService.getTempBackendUrl() || '');

  const handleSave = async () => {
    if (!backendUrl.trim()) {
      toast.error('Please enter a backend URL');
      return;
    }

    // Just save the URL directly without any validation
    urlService.setTempBackendUrl(backendUrl);
    toast.success('Backend URL saved successfully');
    onClose();
  };

  const handleReset = () => {
    // Reset to default URL from constants
    urlService.clearTempBackendUrl();
    const defaultUrl = urlService.getDefaultBackendUrl();
    setBackendUrl('');
    toast.success('Backend URL reset to default');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className={`${
        isDark ? 'glass-dark' : 'glass bg-white/90'
      } rounded-2xl shadow-2xl w-full max-w-md mx-4 relative animate-fadeIn border ${
        isDark ? 'border-white/10' : 'border-gray-200/50'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isDark ? 'border-white/10' : 'border-gray-200'
        }`}>
          <div className="flex items-center space-x-3">
            <Server className="h-5 w-5 text-purple-400" />
            <h2 className={`text-lg font-semibold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Backend Configuration
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${
              isDark 
                ? 'hover:bg-white/10 text-gray-400 hover:text-white' 
                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
            } transition-all duration-200`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          <div className={`p-4 rounded-lg ${
            isDark 
              ? 'bg-blue-500/10 border border-blue-400/20' 
              : 'bg-blue-50 border border-blue-200'
          }`}>
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />
              <div>
                <p className={`text-sm font-medium ${
                  isDark ? 'text-blue-300' : 'text-blue-800'
                }`}>
                  Backend URL Override
                </p>
                <p className={`text-xs mt-1 ${
                  isDark ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  This will override the default backend URL for this session. Leave empty to use default.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className={`block text-sm font-medium ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Backend URL
            </label>
            <input
              type="url"
              value={backendUrl}
              onChange={(e) => setBackendUrl(e.target.value)}
              placeholder="https://your-backend-url.com"
              className={`w-full px-4 py-3 rounded-lg ${
                isDark 
                  ? 'bg-dark-800/50 border-dark-600 text-white placeholder-gray-500' 
                  : 'bg-white/50 border-gray-300 text-gray-900 placeholder-gray-400'
              } focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200`}
            />
          </div>

          {urlService.hasTempBackendUrl() && (
            <div className={`p-3 rounded-lg ${
              isDark 
                ? 'bg-green-500/10 border border-green-400/20' 
                : 'bg-green-50 border border-green-200'
            }`}>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <p className={`text-sm ${
                  isDark ? 'text-green-300' : 'text-green-800'
                }`}>
                  Backend URL override is active
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className={`flex justify-between gap-3 px-6 py-4 border-t ${
          isDark ? 'border-white/10' : 'border-gray-200'
        }`}>
          <button
            onClick={handleReset}
            className={`px-4 py-2 text-sm rounded-lg ${
              isDark 
                ? 'text-gray-400 hover:text-white hover:bg-white/10' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            } transition-all duration-200`}
          >
            Reset to Default
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className={`px-4 py-2 text-sm rounded-lg border ${
                isDark 
                  ? 'border-white/10 text-gray-300 hover:bg-white/10' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-100'
              } transition-all duration-200`}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 