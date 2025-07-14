import React, { useState } from 'react';
import { Search, Filter, Target, X } from 'lucide-react';
import { OutscrapperFilters } from '../types';
import { outscrapperService } from '../services/outscrapperService';
import { US_STATES, BUSINESS_TYPES, BUSINESS_TYPE_LABELS } from '../config/constants';
import { alertService } from '../services/alertService';
import { useTheme } from '../context/ThemeContext';
import { SearchableDropdown } from '../components/UI';

export const Outscrapper: React.FC = () => {
  const { isDark } = useTheme();
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
    // Validate required fields
    if (!filters.keyword || filters.keyword.trim() === '') {
      alertService.error('Keyword is required for searching addresses', {
        title: 'Validation Error'
      });
      return;
    }

    if (filters.zipCode && !validateZipCode(filters.zipCode)) {
      alertService.error('Please enter a valid 5-digit ZIP code', {
        title: 'Invalid ZIP Code'
      });
      return;
    }

    try {
      setFetchLoading(true);
      const addresses = await outscrapperService.fetchAddresses(filters);
      
      // Show success alert
      alertService.success(
        `Successfully fetched ${addresses.length} addresses from Outscrapper.`, 
        {
          title: 'Fetch Completed',
          duration: 4000
        }
      );
      
      setShowFilters(false); // Hide filters after successful fetch
    } catch (error: any) {
      // Show failure alert
      const errorMessage = error?.message || 'An unexpected error occurred while fetching addresses.';
      alertService.error(
        `Failed to fetch addresses from Outscrapper. ${errorMessage}`, 
        {
          title: 'Fetch Failed',
          duration: 5000
        }
      );
    } finally {
      setFetchLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-2xl sm:text-3xl font-bold ${
            isDark ? 'gradient-text' : 'gradient-text-light'
          }`}>Outscrapper Integration</h1>
          <p className={`mt-1 text-sm sm:text-base ${
            isDark ? 'text-gray-400' : 'text-light-600'
          }`}>
            Fetch business addresses and contact information from Outscrapper
          </p>
        </div>
      </div>

      {/* Main Fetch Button */}
      {!showFilters && (
        <div className={`${
          isDark ? 'glass-dark' : 'glass-light'
        } rounded-2xl p-6 sm:p-8 text-center border ${
          isDark ? 'border-purple-500/20' : 'border-brand-primary-300/30'
        } ${
          isDark ? 'hover:border-purple-500/40' : 'hover:border-brand-primary-400/50'
        } transition-all duration-300 animate-slideUp`}>
          <div className={`mx-auto w-12 h-12 sm:w-16 sm:h-16 ${
            isDark 
              ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20' 
              : 'bg-gradient-to-br from-brand-primary-100 to-brand-secondary-100'
          } rounded-2xl flex items-center justify-center mb-4 animate-pulse-glow`}>
            <Target className={`h-6 w-6 sm:h-8 sm:w-8 ${
              isDark ? 'text-purple-400' : 'text-brand-primary-600'
            }`} />
          </div>
          <h3 className={`text-lg font-semibold ${
            isDark ? 'text-white' : 'text-light-900'
          } mb-2`}>
            Ready to Fetch New Addresses?
          </h3>
          <p className={`text-sm sm:text-base ${
            isDark ? 'text-gray-400' : 'text-light-600'
          } mb-6 max-w-md mx-auto`}>
            Use Outscrapper's powerful API to find targeted business addresses based on your specific criteria.
          </p>
          <button
            onClick={handleFetchAddresses}
            className={`inline-flex items-center px-6 sm:px-8 py-3 ${
              isDark ? 'btn-gradient' : 'btn-light'
            } text-sm sm:text-base font-medium rounded-lg text-white transition-all duration-200`}
          >
            <Search className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5" />
            Fetch New Addresses
          </button>
        </div>
      )}

      {/* Filters Section */}
      {showFilters && (
        <div className={`${
          isDark ? 'glass-dark' : 'glass-light'
        } rounded-2xl p-4 sm:p-6 border-t-4 ${
          isDark ? 'border-purple-500' : 'border-brand-primary-500'
        } animate-slideUp`}>
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center space-x-2">
              <div className={`w-6 h-6 sm:w-8 sm:h-8 ${
                isDark 
                  ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20' 
                  : 'bg-gradient-to-br from-brand-primary-100 to-brand-secondary-100'
              } rounded-lg flex items-center justify-center`}>
                <Filter className={`h-3 w-3 sm:h-4 sm:w-4 ${
                  isDark ? 'text-purple-400' : 'text-brand-primary-600'
                }`} />
              </div>
              <h3 className={`text-base sm:text-lg font-medium ${
                isDark ? 'text-white' : 'text-light-900'
              }`}>Configure Search Filters</h3>
            </div>
            <button
              onClick={() => setShowFilters(false)}
              className={`${
                isDark ? 'text-gray-400 hover:text-white hover:bg-dark-800/50' : 'text-light-600 hover:text-light-900 hover:bg-light-200/60'
              } rounded-lg p-2 transition-all duration-200`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
            {/* Keyword - Now Required */}
            <div className="sm:col-span-2">
              <label className={`block text-sm font-medium ${
                isDark ? 'text-gray-300' : 'text-light-700'
              } mb-2`}>
                Keyword <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={filters.keyword}
                onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                placeholder="e.g., NoMad, restaurant, dentist"
                className={`block w-full px-3 py-2 ${
                  isDark ? 'bg-dark-800/50 border-dark-600 text-white placeholder-gray-500' : 'bg-light-100/70 border-light-300 text-light-900 placeholder-light-600'
                } rounded-lg text-sm focus:ring-2 ${
                  isDark ? 'focus:ring-purple-500 focus:border-purple-500' : 'focus:ring-brand-primary-500 focus:border-brand-primary-500'
                } transition-all duration-200`}
              />
              <p className={`mt-1 text-xs ${
                isDark ? 'text-gray-500' : 'text-light-500'
              }`}>
                This will be used as the main search query
              </p>
            </div>

            {/* State */}
            <div>
              <SearchableDropdown
                value={filters.state || ''}
                onChange={(value) => setFilters({ ...filters, state: value })}
                options={US_STATES}
                placeholder="Select State"
                label="State"
              />
            </div>

            {/* ZIP Code */}
            <div>
              <label className={`block text-sm font-medium ${
                isDark ? 'text-gray-300' : 'text-light-700'
              } mb-2`}>
                ZIP Code
              </label>
              <input
                type="text"
                value={filters.zipCode}
                onChange={handleZipCodeChange}
                placeholder="Enter ZIP code (optional)"
                className={`block w-full px-3 py-2 ${
                  isDark ? 'bg-dark-800/50 border-dark-600 text-white placeholder-gray-500' : 'bg-light-100/70 border-light-300 text-light-900 placeholder-light-600'
                } rounded-lg text-sm focus:ring-2 ${
                  isDark ? 'focus:ring-purple-500 focus:border-purple-500' : 'focus:ring-brand-primary-500 focus:border-brand-primary-500'
                } transition-all duration-200 ${zipCodeError ? 'border-red-400' : ''}`}
              />
              {zipCodeError && (
                <p className="mt-1 text-xs text-red-400">{zipCodeError}</p>
              )}
            </div>

            {/* Category (formerly Business Type) */}
            <div>
              <SearchableDropdown
                value={filters.businessType || ''}
                onChange={(value) => setFilters({ ...filters, businessType: value })}
                options={BUSINESS_TYPES}
                placeholder="Select Category"
                label="Category"
                getDisplayValue={(type) => BUSINESS_TYPE_LABELS[type as keyof typeof BUSINESS_TYPE_LABELS]}
              />
            </div>

            {/* Limit */}
            <div>
              <label className={`block text-sm font-medium ${
                isDark ? 'text-gray-300' : 'text-light-700'
              } mb-2`}>
                Limit
              </label>
              <select
                value={filters.limit}
                onChange={(e) => setFilters({ ...filters, limit: parseInt(e.target.value) })}
                className={`block w-full px-3 py-2 ${
                  isDark ? 'bg-dark-800/50 border-dark-600 text-white' : 'bg-light-100/70 border-light-300 text-light-900'
                } rounded-lg text-sm focus:ring-2 ${
                  isDark ? 'focus:ring-purple-500 focus:border-purple-500' : 'focus:ring-brand-primary-500 focus:border-brand-primary-500'
                } transition-all duration-200`}
              >
                <option value={50}>50 addresses</option>
                <option value={100}>100 addresses</option>
                <option value={200}>200 addresses</option>
                <option value={500}>500 addresses</option>
              </select>
            </div>

            {/* Options */}
            <div className="sm:col-span-2">
              <div className="flex items-center">
                <input
                  id="ignore-no-reviews"
                  type="checkbox"
                  checked={filters.ignoreNoReviews}
                  onChange={(e) => setFilters({ ...filters, ignoreNoReviews: e.target.checked })}
                  className={`h-4 w-4 ${
                    isDark ? 'text-purple-500 bg-dark-800 border-dark-600' : 'text-brand-primary-500 bg-light-100 border-light-300'
                  } rounded focus:ring-2 ${
                    isDark ? 'focus:ring-purple-500' : 'focus:ring-brand-primary-500'
                  }`}
                />
                <label htmlFor="ignore-no-reviews" className={`ml-2 text-sm ${
                  isDark ? 'text-gray-300' : 'text-light-700'
                }`}>
                  Ignore businesses with no reviews
                </label>
              </div>
            </div>
          </div>

          <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 sm:pt-6 border-t ${
            isDark ? 'border-white/10' : 'border-light-300'
          }`}>
            <div className={`${
              isDark ? 'text-gray-400' : 'text-light-500'
            } text-sm text-center sm:text-left`}>
              Estimated cost: ~$0.02-0.05 per address fetched
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={() => setShowFilters(false)}
                className={`px-4 py-2 text-sm font-medium ${
                  isDark ? 'text-gray-300 bg-dark-800/50 hover:bg-dark-700/50 hover:text-white' : 'text-light-700 bg-light-200/60 hover:bg-light-300/60 hover:text-light-900'
                } rounded-lg transition-all duration-200`}
              >
                Cancel
              </button>
              <button
                onClick={handleFetch}
                disabled={fetchLoading}
                className={`inline-flex items-center justify-center px-4 sm:px-6 py-2 ${
                  isDark ? 'btn-gradient' : 'btn-light'
                } text-sm font-medium rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {fetchLoading ? (
                  <>
                    <div className={`${
                      isDark ? 'spinner' : 'spinner-light'
                    } mr-2`}></div>
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
    </div>
  );
};