import React from 'react';
import { Bell, Search, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const Header: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className={`${isDark ? 'bg-dark-900/80' : 'bg-white/80'} backdrop-blur-sm border-b ${isDark ? 'border-dark-700' : 'border-gray-200'} px-6 py-4`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'} h-4 w-4`} />
            <input
              type="text"
              placeholder="Search campaigns, addresses..."
              className={`pl-10 pr-4 py-2 ${
                isDark 
                  ? 'bg-dark-800/50 border-dark-600 text-white placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500' 
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500'
              } rounded-lg focus:ring-2 w-80 transition-all duration-200`}
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Theme Toggle Button */}
          <button 
            onClick={toggleTheme}
            className={`relative p-2 ${
              isDark 
                ? 'text-gray-400 hover:text-white hover:bg-dark-800/50' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            } rounded-lg transition-all duration-200 group`}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            {isDark ? (
              <Sun className="h-5 w-5 group-hover:text-yellow-400 transition-colors" />
            ) : (
              <Moon className="h-5 w-5 group-hover:text-purple-400 transition-colors" />
            )}
          </button>

          {/* Notification Bell */}
          <button className={`relative p-2 ${
            isDark 
              ? 'text-gray-400 hover:text-white hover:bg-dark-800/50' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          } rounded-lg transition-all duration-200 group`}>
            <Bell className={`h-5 w-5 ${isDark ? 'group-hover:text-purple-400' : 'group-hover:text-purple-500'} transition-colors`} />
            <span className="absolute -top-1 -right-1 block h-3 w-3 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse"></span>
          </button>
        </div>
      </div>
    </header>
  );
};