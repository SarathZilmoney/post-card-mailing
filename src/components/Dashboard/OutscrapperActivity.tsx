import React from 'react';
import { Link } from 'react-router-dom';
import { Database, Target, Search } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const OutscrapperActivity: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <div className={`${
      isDark ? 'glass-dark' : 'glass bg-white/70 border-gray-200/50'
    } rounded-2xl hover:border-purple-500/30 transition-all duration-300 animate-slideUp`}>
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
          <Link
            to="/outscrapper"
            className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
          >
            Get started
          </Link>
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
        <Link
          to="/outscrapper"
          className={`inline-flex items-center px-4 py-2 ${
            isDark ? 'btn-gradient' : 'bg-purple-600 hover:bg-purple-700'
          } text-sm font-medium rounded-lg text-white transition-all duration-200`}
        >
          <Search className="mr-2 h-4 w-4" />
          Start Fetching
        </Link>
      </div>
    </div>
  );
};