import React from 'react';
import { Bell, Sun, Moon, LayoutDashboard, Mail, Users, BarChart3, Database, Clock, User, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { clsx } from 'clsx';

const navigationItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Campaigns', href: '/campaigns', icon: Mail },
  { name: 'Lists', href: '/addresses', icon: Users },
  { name: 'Outscrapper', href: '/outscrapper', icon: Database },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, comingSoon: true },
];

export const Header: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const { logout, user } = useAuth();
  const location = useLocation();

  return (
    <header className={`${
      isDark ? 'bg-dark-900/95' : 'bg-white/95'
    } backdrop-blur-lg border-b ${
      isDark ? 'border-gray-800' : 'border-gray-200'
    } px-8 py-4`}>
      <div className="w-full flex items-center justify-between">
        {/* Left: Brand */}
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 ${
            isDark 
              ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
              : 'bg-gradient-to-br from-brand-primary-500 to-brand-secondary-500'
          } rounded-xl flex items-center justify-center`}>
            <span className="text-white font-bold text-lg">P</span>
          </div>
          <div>
            <h1 className={`text-xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>PostCard Pro</h1>
          </div>
        </div>

        {/* Center: Navigation */}
        <nav className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-8">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.href;
            
            if (item.comingSoon) {
              return (
                <div
                  key={item.name}
                  className={`flex items-center text-sm font-medium ${
                    isDark ? 'text-gray-500' : 'text-gray-500'
                  } cursor-not-allowed relative group`}
                  title="Coming Soon"
                >
                  <span className="uppercase tracking-wide">{item.name}</span>
                  <Clock className="ml-2 h-3 w-3" />
                </div>
              );
            }
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={clsx(
                  'text-sm font-medium uppercase tracking-wide transition-all duration-200 relative group',
                  isActive
                    ? isDark 
                      ? 'text-purple-400' 
                      : 'text-brand-primary-600'
                    : isDark
                      ? 'text-gray-300 hover:text-white'
                      : 'text-gray-600 hover:text-gray-900'
                )}
              >
                {item.name}
                {isActive && (
                  <span className={`absolute -bottom-1 left-0 w-full h-0.5 ${
                    isDark 
                      ? 'bg-gradient-to-r from-purple-400 to-pink-400' 
                      : 'bg-gradient-to-r from-brand-primary-500 to-brand-secondary-500'
                  }`}></span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Controls */}
        <div className="flex items-center space-x-3">
          {/* User Profile */}
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 ${
              isDark 
                ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
                : 'bg-gradient-to-br from-brand-primary-500 to-brand-secondary-500'
            } rounded-full flex items-center justify-center`}>
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="hidden lg:block">
              <p className={`text-sm font-medium ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {user?.nick_name || 'User'}
              </p>
            </div>
          </div>

          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className={`p-2 ${
              isDark 
                ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            } rounded-lg transition-all duration-200`}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            {isDark ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>

          {/* Notifications */}
          <button className={`relative p-2 ${
            isDark 
              ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          } rounded-lg transition-all duration-200`}>
            <Bell className="h-5 w-5" />
            <span className={`absolute -top-1 -right-1 block h-3 w-3 rounded-full ${
              isDark 
                ? 'bg-purple-500' 
                : 'bg-brand-primary-500'
            }`}></span>
          </button>
          
          {/* Logout */}
          <button
            onClick={logout}
            className={`p-2 ${
              isDark 
                ? 'text-gray-400 hover:text-red-400 hover:bg-gray-800' 
                : 'text-gray-600 hover:text-red-500 hover:bg-gray-100'
            } rounded-lg transition-all duration-200`}
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};