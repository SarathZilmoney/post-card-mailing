import React, { useState, useEffect } from 'react';
import { Database, Search, Download, Filter, Target } from 'lucide-react';
import { OutscrapperFetch, OutscrapperFilters } from '../types';
import { outscrapperService } from '../services/outscrapperService';
import { US_STATES, BUSINESS_TYPES } from '../config/constants';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export const Outscrapper: React.FC = () => {
  const [fetches, setFetches] = useState<OutscrapperFetch[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<OutscrapperFilters>({
    state: '',
    city: '',
    businessType: '',
    keyword: '',
    limit: 100
  });

  useEffect(() => {
    loadFetchHistory();
  }, []);

  const loadFetchHistory = async () => {
    try {
      const data = await outscrapperService.getFetchHistory();
      setFetches(data);
    } catch (error) {
      console.error('Failed to load fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchAddresses = () => {
    setShowFilters(true);
  };

  const handleFetch = async () => {
    if (!filters.state && !filters.city && !filters.keyword) {
      toast.error('Please provide at least one filter criteria');
      return;
    }

    try {
      setFetchLoading(true);
      const addresses = await outscrapperService.fetchAddresses(filters);
      toast.success(`Fetched ${addresses.length} addresses successfully`);
      loadFetchHistory(); // Refresh history
      setShowFilters(false); // Hide filters after successful fetch
    } catch (error) {
      toast.error('Failed to fetch addresses from Outscrapper');
    } finally {
      setFetchLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'failed':
        return '❌';
      default:
        return '⏳';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Outscrapper Integration</h1>
          <p className="mt-1 text-sm text-gray-500">
            Fetch business addresses and contact information from Outscrapper
          </p>
        </div>
      </div>

      {/* Main Fetch Button */}
      {!showFilters && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Target className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Ready to Fetch New Addresses?
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Use Outscrapper's powerful API to find targeted business addresses based on your specific criteria.
          </p>
          <button
            onClick={handleFetchAddresses}
            className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:shadow-lg"
          >
            <Search className="mr-3 h-5 w-5" />
            Fetch New Addresses
          </button>
        </div>
      )}

      {/* Filters Section */}
      {showFilters && (
        <div className="bg-white shadow-lg rounded-lg p-6 border-t-4 border-blue-500">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-medium text-gray-900">Configure Search Filters</h3>
            </div>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-400 hover:text-gray-500 text-sm"
            >
              Cancel
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State *
              </label>
              <select
                value={filters.state}
                onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                className="block w-full border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select State</option>
                {US_STATES.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                placeholder="Enter city name"
                className="block w-full border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Type
              </label>
              <select
                value={filters.businessType}
                onChange={(e) => setFilters({ ...filters, businessType: e.target.value })}
                className="block w-full border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Type</option>
                {BUSINESS_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Keyword
              </label>
              <input
                type="text"
                value={filters.keyword}
                onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                placeholder="e.g., restaurant, dentist"
                className="block w-full border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Results Limit
              </label>
              <select
                value={filters.limit}
                onChange={(e) => setFilters({ ...filters, limit: parseInt(e.target.value) })}
                className="block w-full border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={50}>50 results</option>
                <option value={100}>100 results</option>
                <option value={250}>250 results</option>
                <option value={500}>500 results</option>
              </select>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Please provide at least one filter criteria (State, City, or Keyword) to proceed with the fetch.
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowFilters(false)}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              onClick={handleFetch}
              disabled={fetchLoading}
              className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {fetchLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Fetching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Fetch Addresses
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Fetch History */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-medium text-gray-900">Fetch History</h3>
            </div>
            <button className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
              <Download className="mr-1 h-3 w-3" />
              Export
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {fetches.map((fetch) => (
              <div key={fetch.id} className="px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getStatusIcon(fetch.status)}</span>
                      <h4 className="text-sm font-medium text-gray-900">
                        {fetch.query}
                      </h4>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {fetch.filters.state && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          State: {fetch.filters.state}
                        </span>
                      )}
                      {fetch.filters.city && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          City: {fetch.filters.city}
                        </span>
                      )}
                      {fetch.filters.businessType && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                          Type: {fetch.filters.businessType}
                        </span>
                      )}
                      {fetch.filters.keyword && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                          Keyword: {fetch.filters.keyword}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>{fetch.recordsFetched} records fetched</span>
                      <span>{fetch.creditsUsed} credits used</span>
                      <span>{formatDistanceToNow(new Date(fetch.createdAt))} ago</span>
                      {fetch.error && (
                        <span className="text-red-500">Error: {fetch.error}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && fetches.length === 0 && (
          <div className="px-6 py-12 text-center">
            <Database className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No fetch history</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start by fetching addresses using the button above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};