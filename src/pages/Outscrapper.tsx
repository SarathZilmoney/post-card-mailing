import React, { useState, useEffect } from 'react';
import { Database, Search, Download, Filter, Target, X } from 'lucide-react';
import { OutscrapperFetch, OutscrapperFilters } from '../types';
import { outscrapperService } from '../services/outscrapperService';
import { US_STATES, BUSINESS_TYPES } from '../config/constants';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

export const Outscrapper: React.FC = () => {
  const { isDark } = useTheme();
  const [fetches, setFetches] = useState<OutscrapperFetch[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<OutscrapperFilters>({
    state: '',
    zipCode: '',
    businessType: '',
    keyword: '',
    ignoreNoReviews: false,
    limit: 100
  });
  const [zipCodeError, setZipCodeError] = useState('');

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

  const validateZipCode = (zipCode: string): boolean => {
    if (!zipCode) return true; // Optional field
    const zipRegex = /^\d{5}$/;
    return zipRegex.test(zipCode);
  };

  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilters({ ...filters, zipCode: value });
    
    if (value && !validateZipCode(value)) {
      setZipCodeError('ZIP code must be 5 digits');
    } else {
      setZipCodeError('');
    }
  };

  const handleFetch = async () => {
    if (!filters.state && !filters.zipCode && !filters.keyword) {
      toast.error('Please provide at least one filter criteria');
      return;
    }

    if (filters.zipCode && !validateZipCode(filters.zipCode)) {
      toast.error('Please enter a valid 5-digit ZIP code');
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
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Outscrapper Integration</h1>
          <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Fetch business addresses and contact information from Outscrapper
          </p>
        </div>
      </div>

      {/* Main Fetch Button */}
      {!showFilters && (
        <div className={`${
          isDark ? 'glass-dark' : 'glass bg-white/70 border-gray-200/50'
        } rounded-2xl p-8 text-center border ${
          isDark ? 'border-purple-500/20' : 'border-purple-300/30'
        } hover:border-purple-500/40 transition-all duration-300 animate-slideUp`}>
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mb-4 animate-pulse-glow">
            <Target className="h-8 w-8 text-purple-400" />
          </div>
          <h3 className={`text-lg font-semibold ${
            isDark ? 'text-white' : 'text-gray-900'
          } mb-2`}>
            Ready to Fetch New Addresses?
          </h3>
          <p className={`${
            isDark ? 'text-gray-400' : 'text-gray-600'
          } mb-6 max-w-md mx-auto`}>
            Use Outscrapper's powerful API to find targeted business addresses based on your specific criteria.
          </p>
          <button
            onClick={handleFetchAddresses}
            className={`inline-flex items-center px-8 py-3 btn-gradient text-base font-medium rounded-lg text-white transition-all duration-200`}
          >
            <Search className="mr-3 h-5 w-5" />
            Fetch New Addresses
          </button>
        </div>
      )}

      {/* Filters Section */}
      {showFilters && (
        <div className={`${
          isDark ? 'glass-dark' : 'glass bg-white/70 border-gray-200/50'
        } rounded-2xl p-6 border-t-4 border-purple-500 animate-slideUp`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center">
                <Filter className="h-4 w-4 text-purple-400" />
              </div>
              <h3 className={`text-lg font-medium ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Configure Search Filters</h3>
            </div>
            <button
              onClick={() => setShowFilters(false)}
              className={`${
                isDark ? 'text-gray-400 hover:text-white hover:bg-dark-800/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              } rounded-lg p-2 transition-all duration-200`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {/* State */}
            <div>
              <label className={`block text-sm font-medium ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              } mb-2`}>
                State <span className="text-red-400">*</span>
              </label>
              <select
                value={filters.state}
                onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                className={`block w-full px-3 py-2 ${
                  isDark ? 'bg-dark-800/50 border-dark-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200`}
              >
                <option value="">Select State</option>
                {US_STATES.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            {/* ZIP Code */}
            <div>
              <label className={`block text-sm font-medium ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              } mb-2`}>
                ZIP Code
              </label>
              <input
                type="text"
                value={filters.zipCode}
                onChange={handleZipCodeChange}
                placeholder="Enter ZIP code (optional)"
                className={`block w-full px-3 py-2 ${
                  isDark ? 'bg-dark-800/50 border-dark-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                } rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 ${zipCodeError ? 'border-red-400' : ''}`}
              />
              {zipCodeError && (
                <p className="mt-1 text-xs text-red-400">{zipCodeError}</p>
              )}
            </div>

            {/* Keyword */}
            <div>
              <label className={`block text-sm font-medium ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              } mb-2`}>
                Keyword
              </label>
              <input
                type="text"
                value={filters.keyword}
                onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                placeholder="e.g., restaurant, dentist"
                className={`block w-full px-3 py-2 ${
                  isDark ? 'bg-dark-800/50 border-dark-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                } rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200`}
              />
            </div>

            {/* Category (formerly Business Type) */}
            <div>
              <label className={`block text-sm font-medium ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              } mb-2`}>
                Category
              </label>
              <select
                value={filters.businessType}
                onChange={(e) => setFilters({ ...filters, businessType: e.target.value })}
                className={`block w-full px-3 py-2 ${
                  isDark ? 'bg-dark-800/50 border-dark-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200`}
              >
                <option value="">Select Category</option>
                {BUSINESS_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Limit */}
            <div>
              <label className={`block text-sm font-medium ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              } mb-2`}>
                Limit
              </label>
              <select
                value={filters.limit}
                onChange={(e) => setFilters({ ...filters, limit: parseInt(e.target.value) })}
                className={`block w-full px-3 py-2 ${
                  isDark ? 'bg-dark-800/50 border-dark-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200`}
              >
                <option value={50}>50 addresses</option>
                <option value={100}>100 addresses</option>
                <option value={200}>200 addresses</option>
                <option value={500}>500 addresses</option>
              </select>
            </div>

            {/* Options */}
            <div className="flex items-center">
              <input
                id="ignore-no-reviews"
                type="checkbox"
                checked={filters.ignoreNoReviews}
                onChange={(e) => setFilters({ ...filters, ignoreNoReviews: e.target.checked })}
                className={`h-4 w-4 text-purple-500 ${
                  isDark ? 'bg-dark-800 border-dark-600' : 'bg-white border-gray-300'
                } rounded focus:ring-purple-500 focus:ring-2`}
              />
              <label htmlFor="ignore-no-reviews" className={`ml-2 text-sm ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Ignore businesses with no reviews
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-white/10">
            <div className={`${
              isDark ? 'text-gray-400' : 'text-gray-500'
            } text-sm`}>
              Estimated cost: ~$0.02-0.05 per address fetched
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowFilters(false)}
                className={`px-4 py-2 text-sm font-medium ${
                  isDark ? 'text-gray-300 bg-dark-800/50 hover:bg-dark-700/50 hover:text-white' : 'text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-gray-900'
                } rounded-lg transition-all duration-200`}
              >
                Cancel
              </button>
              <button
                onClick={handleFetch}
                disabled={fetchLoading}
                className={`inline-flex items-center px-6 py-2 btn-gradient text-sm font-medium rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {fetchLoading ? (
                  <>
                    <div className="spinner mr-2"></div>
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
        </div>
      )}

      {/* Fetch History */}
      <div className={`${
        isDark ? 'glass-dark' : 'glass bg-white/70 border-gray-200/50'
      } rounded-2xl hover:border-purple-500/30 transition-all duration-300 animate-slideUp`}>
        <div className={`px-6 py-4 border-b ${
          isDark ? 'border-dark-600' : 'border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center">
                <Database className="h-4 w-4 text-purple-400" />
              </div>
              <h3 className={`text-lg font-medium ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Recent Fetch History</h3>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className={`h-16 ${
                  isDark ? 'bg-dark-600' : 'bg-gray-300'
                } rounded`}></div>
              ))}
            </div>
          </div>
        ) : (
          <div className={`divide-y ${
            isDark ? 'divide-dark-600' : 'divide-gray-200'
          }`}>
            {fetches.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Database className="h-8 w-8 text-purple-400" />
                </div>
                <h3 className={`text-lg font-medium ${
                  isDark ? 'text-white' : 'text-gray-900'
                } mb-2`}>No fetch history yet</h3>
                <p className={`${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Start by fetching your first set of addresses
                </p>
              </div>
            ) : (
              fetches.map((fetch) => (
                <div key={fetch.id} className={`px-6 py-4 ${
                  isDark ? 'hover:bg-dark-800/30' : 'hover:bg-gray-50'
                } transition-colors`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getStatusIcon(fetch.status)}</span>
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
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};