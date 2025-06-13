import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Database, Clock, CheckCircle, XCircle } from 'lucide-react';
import { OutscrapperFetch } from '../../types';
import { outscrapperService } from '../../services/outscrapperService';
import { formatDistanceToNow } from 'date-fns';

export const OutscrapperActivity: React.FC = () => {
  const [fetches, setFetches] = useState<OutscrapperFetch[]>([]);
  const [loading, setLoading] = useState(true);

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
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">Outscrapper Activity</h3>
          </div>
          <Link
            to="/outscrapper"
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            View all
          </Link>
        </div>
      </div>
      <div className="divide-y divide-gray-200">
        {fetches.slice(0, 4).map((fetch) => (
          <div key={fetch.id} className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(fetch.status)}
                  <h4 className="text-sm font-medium text-gray-900">
                    {fetch.query}
                  </h4>
                </div>
                <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                  <span>{fetch.recordsFetched} records</span>
                  <span>{fetch.creditsUsed} credits</span>
                  <span>{formatDistanceToNow(new Date(fetch.createdAt))} ago</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {fetch.filters.state && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {fetch.filters.state}
                    </span>
                  )}
                  {fetch.filters.city && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      {fetch.filters.city}
                    </span>
                  )}
                  {fetch.filters.businessType && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
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