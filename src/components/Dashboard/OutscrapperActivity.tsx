import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Database, Clock, CheckCircle, XCircle } from 'lucide-react';
import { OutscrapperFetch } from '../../types';
import { outscrapperService } from '../../services/outscrapperService';
import { useTheme } from '../../context/ThemeContext';
import { formatDistanceToNow } from 'date-fns';

export const OutscrapperActivity: React.FC = () => {
  const [fetches, setFetches] = useState<OutscrapperFetch[]>([]);
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();

  useEffect(() => {
    const loadFetches = async () => {
      try {
        const data = await outscrapperService.getFetchHistory();
        setFetches(data);
      } catch (error) {
        console.error('Failed to load fetch history:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFetches();
  }, []);

  if (loading) {
    return (
      <div className={`${
        isDark ? 'glass-dark' : 'glass bg-white/70 border-gray-200/50'
      } rounded-2xl p-6 animate-slideUp`}>
        <div className="animate-pulse space-y-4">
          <div className={`h-4 ${
            isDark ? 'bg-dark-600' : 'bg-gray-300'
          } rounded w-1/3`}></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`h-4 ${
                isDark ? 'bg-dark-600' : 'bg-gray-300'
              } rounded`}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-400" />;
    }
  };

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
            }`}>Outscrapper Activity</h3>
          </div>
          <Link
            to="/outscrapper"
            className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
          >
            View all
          </Link>
        </div>
      </div>
      <div className={`divide-y ${
        isDark ? 'divide-dark-600' : 'divide-gray-200'
      }`}>
        {fetches.slice(0, 4).map((fetch) => (
          <div key={fetch.id} className={`px-6 py-4 ${
            isDark ? 'hover:bg-dark-800/30' : 'hover:bg-gray-50'
          } transition-colors`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(fetch.status)}
                  <h4 className={`text-sm font-medium ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {fetch.query}
                  </h4>
                </div>
                <div className={`flex items-center space-x-4 mt-1 text-xs ${
                  isDark ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  <span>{fetch.recordsFetched} records</span>
                  <span>{fetch.creditsUsed} credits</span>
                  <span>{formatDistanceToNow(new Date(fetch.createdAt))} ago</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {fetch.filters.state && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-400/30">
                      {fetch.filters.state}
                    </span>
                  )}
                  {fetch.filters.city && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-500/20 text-green-300 border border-green-400/30">
                      {fetch.filters.city}
                    </span>
                  )}
                  {fetch.filters.businessType && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-400/30">
                      {fetch.filters.businessType}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};