import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Mail, 
  Users, 
  BarChart3, 
  Database,
  LogOut,
  Clock,
  User
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { clsx } from 'clsx';

const navigationItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Campaigns', href: '/campaigns', icon: Mail },
  { name: 'Addresses', href: '/addresses', icon: Users },
  { name: 'Outscrapper', href: '/outscrapper', icon: Database },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, comingSoon: true },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const { isDark } = useTheme();

  return (
    <div className={`w-64 ${
      isDark 
        ? 'bg-dark-900/90 backdrop-blur-sm text-white' 
        : 'bg-light-50/95 backdrop-blur-sm text-light-900 border-r border-light-400/30'
    } flex flex-col min-h-screen`}>
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 ${
            isDark 
              ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
              : 'bg-gradient-to-br from-brand-primary-500 to-brand-secondary-500'
          } rounded-xl flex items-center justify-center animate-pulse-glow`}>
            <span className="text-white font-bold text-lg">P</span>
          </div>
          <div>
            <h1 className={`text-lg font-bold ${
              isDark ? 'gradient-text' : 'gradient-text-light'
            }`}>PostCard Pro</h1>
            <p className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-light-600'
            }`}>Campaign Manager</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.href;
          
          if (item.comingSoon) {
            return (
              <div
                key={item.name}
                className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium ${
                  isDark ? 'text-gray-500' : 'text-light-500'
                } cursor-not-allowed relative group`}
                title="Coming Soon"
              >
                <item.icon className="mr-3 h-5 w-5" />
                <span className="flex-1">{item.name}</span>
                <Clock className="h-4 w-4" />
                <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs ${
                  isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-600'
                } px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity`}>
                  Soon
                </span>
              </div>
            );
          }
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={clsx(
                'flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative',
                isActive
                  ? isDark 
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white shadow-lg'
                    : 'bg-gradient-to-r from-brand-primary-100 to-brand-secondary-100 text-brand-primary-700 shadow-lg border border-brand-primary-200/50'
                  : isDark
                    ? 'text-gray-300 hover:bg-dark-800/50 hover:text-white'
                    : 'text-light-700 hover:bg-light-200/60 hover:text-light-900'
              )}
            >
              <item.icon className={clsx(
                'mr-3 h-5 w-5 transition-colors',
                isActive 
                  ? isDark 
                    ? 'text-purple-400' 
                    : 'text-brand-primary-600'
                  : isDark 
                    ? 'text-gray-400 group-hover:text-purple-400'
                    : 'text-light-600 group-hover:text-brand-primary-600'
              )} />
              {item.name}
              {isActive && (
                <div className={`absolute right-2 w-2 h-2 ${
                  isDark 
                    ? 'bg-gradient-to-r from-purple-400 to-pink-400' 
                    : 'bg-gradient-to-r from-brand-primary-500 to-brand-secondary-500'
                } rounded-full animate-pulse`}></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 space-y-4">
        <div className={`flex items-center mb-4 p-3 ${
          isDark ? 'bg-dark-800/50' : 'bg-light-100/70'
        } rounded-xl`}>
          <div className={`w-10 h-10 ${
            isDark 
              ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
              : 'bg-gradient-to-br from-brand-primary-500 to-brand-secondary-500'
          } rounded-full flex items-center justify-center`}>
            <User className="h-5 w-5 text-white" />
          </div>
          <div className="ml-3 flex-1">
            <p className={`text-sm font-medium ${
              isDark ? 'text-white' : 'text-light-900'
            }`}>
              {user?.nick_name || 'User'}
            </p>
            <p className={`text-xs ${
              isDark ? 'text-gray-400' : 'text-light-600'
            } truncate`}>
              {user?.email || 'user@example.com'}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className={`flex items-center w-full px-4 py-2 text-sm ${
            isDark 
              ? 'text-gray-300 hover:bg-dark-800/50 hover:text-white' 
              : 'text-light-700 hover:bg-light-200/60 hover:text-light-900'
          } rounded-xl transition-all duration-200 group`}
        >
          <LogOut className={`mr-3 h-4 w-4 ${
            isDark ? 'text-gray-400' : 'text-light-600'
          } group-hover:text-red-400 transition-colors`} />
          Sign out
        </button>
      </div>
    </div>
  );
};