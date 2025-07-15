import React from 'react';
import { Database, Target, Search } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const OutscrapperActivity: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <div className={`relative ${
      isDark ? 'glass-dark' : 'glass bg-white/70 border-gray-200/50'
    } rounded-2xl hover:border-purple-500/30 transition-all duration-300 animate-slideUp overflow-hidden`}>
      {/* Coming Soon Overlay */}
      <div className={`absolute inset-0 ${
        isDark ? 'bg-gray-900/80' : 'bg-white/90'
      } backdrop-blur-sm rounded-2xl z-10 flex items-center justify-center`}>
        <div className="text-center p-4">
          <div className={`inline-flex items-center px-4 py-2 rounded-full ${
            isDark 
              ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/30' 
              : 'bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-300'
          } mb-3`}>
            <span className={`text-sm font-medium ${
              isDark ? 'text-amber-300' : 'text-amber-700'
            }`}>Coming Soon</span>
          </div>
          <p className={`text-sm ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            We're working on improving this feature
          </p>
        </div>
      </div>
      
      {/* Original Content (preserved but dimmed) */}
      <div className={`px-6 py-4 border-b ${
        isDark ? 'border-dark-600' : 'border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center">
              <Database className="h-5 w-5 text-purple-400" />
            </div>
            <h3 className={`text-lg font-medium ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>Outscrapper Integration</h3>
          </div>
          <span className="text-sm font-medium text-purple-400/50 cursor-not-allowed">
            Get started
          </span>
        </div>
      </div>
      
      <div className="px-6 py-8 text-center">
        <div className={`mx-auto w-12 h-12 ${
          isDark 
            ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20' 
            : 'bg-gradient-to-br from-purple-100 to-pink-100'
        } rounded-xl flex items-center justify-center mb-4`}>
          <Target className={`h-6 w-6 ${
            isDark ? 'text-purple-400' : 'text-purple-600'
          }`} />
        </div>
        <h4 className={`text-sm font-medium ${
          isDark ? 'text-white' : 'text-gray-900'
        } mb-2`}>
          Ready to Fetch Addresses?
        </h4>
        <p className={`text-sm ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        } mb-4`}>
          Use Outscrapper to find targeted business addresses for your campaigns.
        </p>
        <button
          disabled
          className={`inline-flex items-center px-4 py-2 ${
            isDark ? 'bg-gray-600/50' : 'bg-gray-400/50'
          } text-sm font-medium rounded-lg text-white/50 cursor-not-allowed transition-all duration-200`}
        >
          <Search className="mr-2 h-4 w-4" />
          Start Fetching
        </button>
      </div>
    </div>
  );
};