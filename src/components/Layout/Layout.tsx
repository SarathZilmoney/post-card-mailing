import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Toaster } from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';

export const Layout: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen ${
      isDark 
        ? 'bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800' 
        : 'bg-gradient-light-brand'
    }`}>

      
      <div className="flex flex-col">
        <Header />
        <main className={`flex-1 min-h-screen ${
          isDark 
            ? 'bg-dark-900/30' 
            : 'bg-light-50/60 backdrop-blur-sm'
        }`}>
          <div className="max-w-screen-2xl mx-auto px-8 py-6">
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
            color: isDark ? '#f8fafc' : '#27272a',
            border: isDark ? '1px solid #8b5cf6' : '1px solid #e4e4e7',
            boxShadow: isDark ? '0 8px 32px rgba(0, 0, 0, 0.3)' : '0 8px 32px rgba(0, 0, 0, 0.08)',
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