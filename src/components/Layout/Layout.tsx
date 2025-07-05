import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Toaster } from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';

export const Layout: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <div className={`flex h-screen ${
      isDark 
        ? 'bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800' 
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
    }`}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className={`flex-1 overflow-auto p-6 ${
          isDark 
            ? 'bg-dark-900/50 backdrop-blur-sm' 
            : 'bg-white/50 backdrop-blur-sm'
        }`}>
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: isDark ? '#1e293b' : '#ffffff',
            color: isDark ? '#f8fafc' : '#1f2937',
            border: isDark ? '1px solid #8b5cf6' : '1px solid #d1d5db',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: isDark ? '#f8fafc' : '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: isDark ? '#f8fafc' : '#ffffff',
            },
          },
        }}
      />
    </div>
  );
};