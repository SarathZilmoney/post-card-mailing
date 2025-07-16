import React, { useState, useEffect } from 'react';
import { Search, Upload, Eye, Trash2, User, MailIcon, Star, MapPin, Phone, Globe, AlertCircle, ChevronUp, Clock, ExternalLink, ChevronLeft, ChevronRight, ChevronDown, Filter } from 'lucide-react';
import { useAddresses } from '../hooks/useAddresses';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { alertService } from '../services/alertService';
import { categoryService } from '../services/categoryService';
import { AddressCategory } from '../types';
import { formatRelativeTime, debugDateInfo } from '../utils/dateUtils';

export const Addresses: React.FC = () => {
  const { 
    addresses, 
    total, 
    currentPage, 
    totalPages, 
    loading, 
    error, 
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    goToPage, 
    goToNextPage, 
    goToPreviousPage, 
    deleteAddress, 
    importAddresses, 
    refetch 
  } = useAddresses();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [categories, setCategories] = useState<AddressCategory[]>([]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.filter-dropdown')) {
        setCategoryDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleRowExpansion = (encryptedId: string) => {
    setExpandedRows(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(encryptedId)) {
        newExpanded.delete(encryptedId);
      } else {
        newExpanded.add(encryptedId);
      }
      return newExpanded;
    });
  };

  // Temporarily disabled - will be re-enabled when Outscrapper integration is ready
  // const handleAddAddress = () => {
  //   alertService.info(
  //     'Outscrapper integration is coming soon! We\'re working on improving this feature to provide you with better address fetching capabilities.',
  //     {
  //       title: 'Coming Soon',
  //       duration: 5000
  //     }
  //   );
  // };

  const handleDelete = async (encryptedId: string, businessName: string) => {
    // Show confirmation alert
    alertService.warning(
      `Are you sure you want to delete "${businessName}"? This action cannot be undone.`,
      {
        title: 'Delete Address',
        confirmText: 'Delete Address',
        cancelText: 'Cancel',
        onConfirm: async () => {
          try {
            await deleteAddress(encryptedId);
            
            // Show success alert
            alertService.success('Address deleted successfully', {
              title: 'Address Deleted',
              duration: 3000
            });
            
            // Show toast notification as well
            toast.success('Address deleted successfully');
            
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete address';
            
            // Show error alert
            alertService.error(errorMessage, {
              title: 'Delete Failed',
              duration: 3000
            });
            
            // Show toast notification as well
            toast.error(errorMessage);
          }
        },
        onCancel: () => {
          // Do nothing on cancel
        }
      }
    );
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset the input value to allow selecting the same file again
    event.target.value = '';

    // Validate file type - only accept Excel files
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
    ];
    
    const fileExtension = file.name.toLowerCase().split('.').pop();
    const isValidExtension = fileExtension === 'xlsx' || fileExtension === 'xls';
    const isValidMimeType = allowedTypes.includes(file.type);

    if (!isValidExtension && !isValidMimeType) {
      alertService.error('Please select a valid Excel file (.xlsx or .xls)');
      return;
    }

    // Check file size (max 10MB)
    const maxSizeInBytes = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSizeInBytes) {
      alertService.error('File size must be less than 10MB');
      return;
    }

    // Show loading alert
    const loadingId = alertService.loading('Uploading Excel file...');

    try {
      const response = await importAddresses(file);
      
      // Hide loading alert
      if (loadingId) {
        alertService.hide(loadingId);
      }
      
      // Show success alert based on API response
      if (response.status === 'success') {
        alertService.success(
          `${response.message} Job ID: ${response.job_id}`,
          {
            duration: 4000, // Show for 8 seconds since it contains important job ID info
          }
        );
      } else {
        // Handle unexpected success response format
        alertService.success('Excel file uploaded successfully');
      }
      
      // Refresh the address list to show new addresses
      await refetch(currentPage);
    } catch (error) {
      // Hide loading alert
      if (loadingId) {
        alertService.hide(loadingId);
      }
      
      // Show error alert
      const errorMessage = error instanceof Error ? error.message : 'Failed to import addresses from Excel file';
      alertService.error(errorMessage);
    }
  };



  const getCategoryColor = (category: string) => {
    if (!category) {
      return isDark 
        ? 'bg-gray-500/20 text-gray-300 border-gray-400/30' 
        : 'bg-gray-100 text-gray-700 border-gray-300';
    }
    switch (category.toLowerCase()) {
      case 'restaurants':
        return isDark 
          ? 'bg-orange-500/20 text-orange-300 border-orange-400/30' 
          : 'bg-orange-100 text-orange-700 border-orange-300';
      case 'retail':
        return isDark 
          ? 'bg-blue-500/20 text-blue-300 border-blue-400/30' 
          : 'bg-blue-100 text-blue-700 border-blue-300';
      case 'services':
        return isDark 
          ? 'bg-purple-500/20 text-purple-300 border-purple-400/30' 
          : 'bg-purple-100 text-purple-700 border-purple-300';
      case 'healthcare':
        return isDark 
          ? 'bg-green-500/20 text-green-300 border-green-400/30' 
          : 'bg-green-100 text-green-700 border-green-300';
      default:
        return isDark 
          ? 'bg-gray-500/20 text-gray-300 border-gray-400/30' 
          : 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getRatingStars = (rating: string) => {
    if (!rating) {
      return Array(5).fill(null).map((_, i) => (
        <Star key={i} className="h-3 w-3 text-gray-400" />
      ));
    }
    const numRating = parseFloat(rating);
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= numRating) {
        stars.push(<Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />);
      } else if (i - 0.5 <= numRating) {
        stars.push(<Star key={i} className="h-3 w-3 fill-yellow-400/50 text-yellow-400" />);
      } else {
        stars.push(<Star key={i} className="h-3 w-3 text-gray-400" />);
      }
    }
    return stars;
  };

  const formatWorkingHours = (workingHours: { [key: string]: string }) => {
    if (!workingHours || typeof workingHours !== 'object') {
      return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => ({
        day,
        hours: 'Closed'
      }));
    }
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days.map(day => ({
      day,
      hours: workingHours[day] || 'Closed'
    }));
  };

  const renderExpandedRow = (address: any) => {
    const workingHours = formatWorkingHours(address.working_hours);
    
    return (
      <tr key={`${address.encrypted_id}-expanded`} className={`${
        isDark ? 'bg-dark-900/50' : 'bg-gray-50/50'
      } border-t-0 animate-slideDown`}>
        <td colSpan={8} className="px-3 sm:px-6 py-4 animate-fadeIn">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {/* Location Details */}
            <div className={`${
              isDark ? 'bg-dark-800/30 border-dark-600' : 'bg-white border-gray-200'
            } rounded-lg p-4 border`}>
              <h4 className={`text-sm font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              } mb-3 flex items-center`}>
                <MapPin className="h-4 w-4 mr-2" />
                Location Details
              </h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className={`font-medium ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>Full Address:</span>
                  <p className={`${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  } mt-1 break-words`}>{address.full_address}</p>
                </div>
                <div>
                  <span className={`font-medium ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>ZIP Code:</span>
                  <p className={`${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  } mt-1`}>{address.postal_code}</p>
                </div>
                <div>
                  <span className={`font-medium ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>Time Zone:</span>
                  <p className={`${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  } mt-1`}>{address.time_zone}</p>
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div className={`${
              isDark ? 'bg-dark-800/30 border-dark-600' : 'bg-white border-gray-200'
            } rounded-lg p-4 border`}>
              <h4 className={`text-sm font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              } mb-3 flex items-center`}>
                <Globe className="h-4 w-4 mr-2" />
                Business Information
              </h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className={`font-medium ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>Total Reviews:</span>
                  <p className={`${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  } mt-1`}>{address.reviews.toLocaleString()}</p>
                </div>
                {address.description && (
                  <div>
                    <span className={`font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>Description:</span>
                    <p className={`${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    } mt-1 break-words`}>{address.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Working Hours */}
            <div className={`${
              isDark ? 'bg-dark-800/30 border-dark-600' : 'bg-white border-gray-200'
            } rounded-lg p-4 border lg:col-span-2 xl:col-span-1`}>
              <h4 className={`text-sm font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              } mb-3 flex items-center`}>
                <Clock className="h-4 w-4 mr-2" />
                Working Hours
              </h4>
              <div className="space-y-1 text-sm">
                {workingHours.map(({ day, hours }) => (
                  <div key={day} className="flex justify-between">
                    <span className={`font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>{day}:</span>
                    <span className={`${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>{hours}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </td>
      </tr>
    );
  };

  const renderPagination = () => {
    // Always show pagination info when there are addresses
    if (!addresses || addresses.length === 0) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className={`px-3 sm:px-6 py-4 border-t ${
        isDark ? 'border-dark-600' : 'border-gray-200'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className={`text-sm ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          } text-center sm:text-left`}>
            {totalPages > 1 ? (
              <>Showing page {currentPage} ({(currentPage - 1) * 10 + 1}-{total} addresses) {totalPages > currentPage ? '• More pages available' : ''}</>
            ) : (
              <>Showing all {total} addresses</>
            )}
          </div>
          
          {/* Only show navigation controls if there are multiple pages */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center sm:justify-start space-x-2">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className={`inline-flex items-center px-2 sm:px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  currentPage === 1
                    ? isDark
                      ? 'text-gray-500 cursor-not-allowed'
                      : 'text-gray-400 cursor-not-allowed'
                    : isDark
                      ? 'text-gray-300 hover:text-white hover:bg-dark-800/50'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              <div className="flex items-center space-x-1">
                {startPage > 1 && (
                  <>
                    <button
                      onClick={() => goToPage(1)}
                      className={`px-2 sm:px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isDark
                          ? 'text-gray-300 hover:text-white hover:bg-dark-800/50'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      1
                    </button>
                    {startPage > 2 && (
                      <span className={`px-2 ${
                        isDark ? 'text-gray-500' : 'text-gray-400'
                      }`}>...</span>
                    )}
                  </>
                )}

                {pages.map(page => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`px-2 sm:px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      page === currentPage
                        ? isDark
                          ? 'bg-purple-500 text-white'
                          : 'bg-purple-600 text-white'
                        : isDark
                          ? 'text-gray-300 hover:text-white hover:bg-dark-800/50'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                {endPage < totalPages && (
                  <>
                    {endPage < totalPages - 1 && (
                      <span className={`px-2 ${
                        isDark ? 'text-gray-500' : 'text-gray-400'
                      }`}>...</span>
                    )}
                    <button
                      onClick={() => goToPage(totalPages)}
                      className={`px-2 sm:px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isDark
                          ? 'text-gray-300 hover:text-white hover:bg-dark-800/50'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>

              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={`inline-flex items-center px-2 sm:px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  currentPage === totalPages
                    ? isDark
                      ? 'text-gray-500 cursor-not-allowed'
                      : 'text-gray-400 cursor-not-allowed'
                    : isDark
                      ? 'text-gray-300 hover:text-white hover:bg-dark-800/50'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Load categories for filtering
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await categoryService.getAddressCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };
    
    loadCategories();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6 animate-fadeIn">
        <div className="animate-pulse">
          <div className={`h-6 sm:h-8 ${
            isDark ? 'bg-dark-600' : 'bg-gray-300'
          } rounded w-1/4 mb-4`}></div>
          <div className={`h-3 sm:h-4 ${
            isDark ? 'bg-dark-600' : 'bg-gray-300'
          } rounded w-1/2`}></div>
        </div>
        <div className={`${
          isDark ? 'glass-dark' : 'glass bg-white/70 border-gray-200/50'
        } rounded-2xl p-4 sm:p-6`}>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`h-16 ${
                isDark ? 'bg-dark-600' : 'bg-gray-300'
              } rounded`}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-4 sm:space-y-6 animate-fadeIn">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold gradient-text">Address Lists</h1>
            <p className={`mt-2 text-sm sm:text-base ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Manage your mailing addresses and business contacts
            </p>
          </div>
        </div>

        <div className={`${
          isDark ? 'glass-dark' : 'glass bg-white/70 border-gray-200/50'
        } rounded-2xl p-6 sm:p-8`}>
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
            <h3 className={`text-lg font-medium ${
              isDark ? 'text-white' : 'text-gray-900'
            } mb-2`}>Failed to load addresses</h3>
            <p className={`${
              isDark ? 'text-gray-400' : 'text-gray-600'
            } mb-4`}>
              There was an error loading your addresses. Please try again.
            </p>
            <p className={`text-sm ${
              isDark ? 'text-gray-500' : 'text-gray-500'
            }`}>
              Error: {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text">Address Lists</h1>
          <p className={`mt-2 text-sm sm:text-base ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Manage your mailing addresses and business contacts
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <label className={`inline-flex items-center justify-center px-4 py-2 border ${
            isDark 
              ? 'border-dark-600 text-gray-300 bg-dark-800/50 hover:bg-dark-700/50 hover:text-white' 
              : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:text-gray-900'
          } text-sm font-medium rounded-lg cursor-pointer transition-all duration-200`}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Excel
            <input
              type="file"
              accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          <button 
            disabled 
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-gray-400 cursor-not-allowed opacity-50"
            title="Coming Soon - We're working on improving this feature"
          >
            <User className="h-4 w-4 mr-2" />
            Add Address
          </button>
        </div>
      </div>

      <div className={`${
        isDark ? 'glass-dark' : 'glass bg-white/70 border-gray-200/50'
      } rounded-2xl`}>
        <div className="p-4 sm:p-6">
          <div className="relative">
            {loading ? (
              <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              } h-4 w-4`} />
            )}
            <input
              type="text"
              placeholder="Search businesses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={loading}
              className={`block w-full pl-10 pr-3 py-2 ${
                isDark 
                  ? 'bg-dark-800/50 border-dark-600 text-white placeholder-gray-500' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            />
            {searchTerm && !loading && (
              <button
                onClick={() => setSearchTerm('')}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                  isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                } transition-colors`}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Show data table only if there are addresses */}
        {addresses && addresses.length > 0 ? (
          <>
            <div className="w-full">
              <table className="w-full table-fixed">
                <thead className={`${
                  isDark ? 'bg-dark-800/50' : 'bg-gray-50'
                }`}>
                  <tr>
                    <th className={`px-2 sm:px-4 py-3 text-left text-xs font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-500'
                    } uppercase tracking-wider w-32 sm:w-40`}>
                      Business
                    </th>
                    <th className={`px-2 sm:px-4 py-3 text-left text-xs font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-500'
                    } uppercase tracking-wider hidden lg:table-cell w-32 xl:w-40`}>
                      Address
                    </th>
                    <th className={`px-2 sm:px-4 py-3 text-left text-xs font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-500'
                    } uppercase tracking-wider hidden md:table-cell w-28 lg:w-32`}>
                      Contact
                    </th>
                    <th className={`px-2 sm:px-4 py-3 text-left text-xs font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-500'
                    } uppercase tracking-wider hidden sm:table-cell w-20 md:w-24`}>
                      Rating
                    </th>
                    <th className={`px-2 sm:px-4 py-3 text-left text-xs font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-500'
                    } uppercase tracking-wider hidden xl:table-cell w-36 relative`}>
                      <div className="flex items-center justify-between">
                        <span>Category</span>
                        <div className="relative filter-dropdown">
                          <button
                            onClick={() => {
                              setCategoryDropdownOpen(!categoryDropdownOpen);
                            }}
                            className={`p-1 rounded transition-colors ${
                              categoryFilter !== 'all' 
                                ? 'text-purple-500' 
                                : isDark 
                                  ? 'text-gray-400 hover:text-gray-300' 
                                  : 'text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            <Filter className="h-3 w-3" />
                          </button>
                          {categoryDropdownOpen && (
                            <div className={`absolute right-0 top-full mt-1 w-48 ${
                              isDark ? 'bg-dark-800 border-dark-600' : 'bg-white border-gray-200'
                            } border rounded-lg shadow-lg z-50`}>
                              <div className="py-1">
                                <button
                                  onClick={() => {
                                    setCategoryFilter('all');
                                    setCategoryDropdownOpen(false);
                                  }}
                                  className={`block w-full text-left px-3 py-2 text-sm ${
                                    categoryFilter === 'all'
                                      ? isDark
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-purple-100 text-purple-900'
                                      : isDark
                                        ? 'text-gray-300 hover:bg-dark-700'
                                        : 'text-gray-700 hover:bg-gray-50'
                                  } transition-colors`}
                                >
                                  All Categories
                                </button>
                                {categories.map(category => (
                                  <button
                                    key={category.encrypted_id}
                                    onClick={() => {
                                      setCategoryFilter(category.name);
                                      setCategoryDropdownOpen(false);
                                    }}
                                    className={`block w-full text-left px-3 py-2 text-sm ${
                                      categoryFilter === category.name
                                        ? isDark
                                          ? 'bg-purple-600 text-white'
                                          : 'bg-purple-100 text-purple-900'
                                        : isDark
                                          ? 'text-gray-300 hover:bg-dark-700'
                                          : 'text-gray-700 hover:bg-gray-50'
                                    } transition-colors`}
                                  >
                                    {category.name && category.name.charAt(0).toUpperCase() + category.name.slice(1)}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </th>

                    <th className={`px-2 sm:px-4 py-3 text-left text-xs font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-500'
                    } uppercase tracking-wider hidden xl:table-cell w-24`}>
                      Added
                    </th>
                    <th className={`px-2 sm:px-3 py-3 text-left text-xs font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-500'
                    } uppercase tracking-wider w-20 sm:w-24`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${
                  isDark ? 'divide-dark-600' : 'divide-gray-200'
                }`}>
                  {addresses.map((address) => (
                    <React.Fragment key={address.encrypted_id}>
                      <tr className={`${
                        isDark ? 'hover:bg-dark-800/30' : 'hover:bg-gray-50'
                      } transition-colors ${
                        expandedRows.has(address.encrypted_id) ? (isDark ? 'bg-dark-800/20' : 'bg-gray-50/50') : ''
                      }`}>
                        <td className="px-2 sm:px-4 py-4 w-32 sm:w-40">
                          <div className={`text-sm font-medium truncate ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`} title={address.name}>
                            {address.name}
                          </div>
                          <div className={`text-xs ${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {address.reviews} reviews
                          </div>
                          {/* Show mobile info */}
                          <div className="mt-2 lg:hidden">
                            <div className={`text-xs ${
                              isDark ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              <MapPin className="h-3 w-3 inline mr-1" />
                              {address.city}, {address.state}
                            </div>
                            <div className="flex items-center mt-1 sm:hidden">
                              {getRatingStars(address.rating)}
                              <span className={`text-xs ${
                                isDark ? 'text-gray-400' : 'text-gray-600'
                              } ml-1`}>
                                {address.rating}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 sm:px-4 py-4 hidden lg:table-cell w-32 xl:w-40">
                          <div className={`text-sm truncate ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`} title={address.street}>
                            <MapPin className="h-3 w-3 inline mr-1" />
                            {address.street}
                          </div>
                          <div className={`text-xs truncate ${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                          }`} title={`${address.city}, ${address.state} ${address.postal_code}`}>
                            {address.city}, {address.state}
                          </div>
                        </td>
                        <td className="px-2 sm:px-4 py-4 hidden md:table-cell w-28 lg:w-32">
                          <div className={`text-sm truncate ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`} title={address.phone}>
                            <Phone className="h-3 w-3 inline mr-1" />
                            {address.phone || 'N/A'}
                          </div>
                          {address.website && (
                            <div className={`text-xs ${
                              isDark ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              <Globe className="h-3 w-3 inline mr-1" />
                              <a href={address.website} target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 truncate">
                                Website
                              </a>
                            </div>
                          )}
                        </td>
                        <td className="px-2 sm:px-4 py-4 hidden sm:table-cell w-20 md:w-24">
                          <div className="flex items-center space-x-1">
                            {getRatingStars(address.rating)}
                            <span className={`text-xs ${
                              isDark ? 'text-gray-400' : 'text-gray-600'
                            } ml-1`}>
                              {address.rating}
                            </span>
                          </div>
                        </td>
                        <td className="px-2 sm:px-4 py-4 hidden xl:table-cell w-36">
                          <div className="max-w-full">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getCategoryColor(address.category_name)} max-w-full`} title={address.category_name}>
                              <span className="truncate">{address.category_name || 'Other'}</span>
                            </span>
                          </div>
                        </td>

                        <td className="px-2 sm:px-4 py-4 hidden xl:table-cell w-24">
                          <div className={`text-xs ${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                          }`} title={formatRelativeTime(address.created_at)}>
                            {(() => {
                              // Debug logging to verify timezone fix
                              debugDateInfo(`Address: ${address.name}`, address.created_at);
                              return formatRelativeTime(address.created_at);
                            })()}
                          </div>
                        </td>
                        <td className="px-2 sm:px-3 py-4 whitespace-nowrap text-right text-sm font-medium w-20 sm:w-24">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => toggleRowExpansion(address.encrypted_id)}
                              className={`${
                                isDark 
                                  ? 'text-gray-400 hover:text-purple-400 hover:bg-dark-800/50' 
                                  : 'text-gray-500 hover:text-purple-500 hover:bg-gray-100'
                              } p-1 rounded transition-colors`}
                              title={expandedRows.has(address.encrypted_id) ? 'Collapse details' : 'View details'}
                            >
                              {expandedRows.has(address.encrypted_id) ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleDelete(address.encrypted_id, address.name)}
                              className={`${
                                isDark 
                                  ? 'text-gray-400 hover:text-red-400 hover:bg-dark-800/50' 
                                  : 'text-gray-500 hover:text-red-500 hover:bg-gray-100'
                              } p-1 rounded transition-colors`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedRows.has(address.encrypted_id) && renderExpandedRow(address)}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
            {renderPagination()}
          </>
        ) : null}

        {/* No data state */}
        {(!addresses || addresses.length === 0) && !loading && !error && !searchTerm && !categoryFilter && categoryFilter !== 'all' && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MailIcon className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className={`text-lg font-medium ${
                isDark ? 'text-white' : 'text-gray-900'
              } mb-2`}>No addresses found</h3>
              <p className={`${
                isDark ? 'text-gray-400' : 'text-gray-600'
              } mb-6`}>
                Get started by adding your first address or importing from Excel
              </p>
            </div>
          </div>
        )}

        {/* No search results state */}
        {(!addresses || addresses.length === 0) && !loading && !error && (searchTerm || (categoryFilter && categoryFilter !== 'all')) && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className={`text-lg font-medium ${
                isDark ? 'text-white' : 'text-gray-900'
              } mb-2`}>No matching addresses found</h3>
              <p className={`${
                isDark ? 'text-gray-400' : 'text-gray-600'
              } mb-6`}>
                {searchTerm && categoryFilter && categoryFilter !== 'all' 
                  ? `No addresses found matching "${searchTerm}" in category "${categoryFilter}"`
                  : searchTerm 
                    ? `No addresses found matching "${searchTerm}"`
                    : `No addresses found in category "${categoryFilter}"`
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      isDark 
                        ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                        : 'bg-brand-primary-600 hover:bg-brand-primary-700 text-white'
                    } transition-colors`}
                  >
                    Clear Search
                  </button>
                )}
                {categoryFilter && categoryFilter !== 'all' && (
                  <button
                    onClick={() => setCategoryFilter('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      isDark 
                        ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                        : 'bg-gray-600 hover:bg-gray-700 text-white'
                    } transition-colors`}
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* No results on current page */}
        {addresses && addresses.length === 0 && currentPage > 1 && !loading && !error && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className={`text-lg font-medium ${
                isDark ? 'text-white' : 'text-gray-900'
              } mb-2`}>No addresses found on this page</h3>
              <p className={`${
                isDark ? 'text-gray-400' : 'text-gray-600'
              } mb-6`}>
                You've reached beyond the available pages. Try going back to an earlier page.
              </p>
              <button
                onClick={() => goToPage(1)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  isDark 
                    ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                    : 'bg-brand-primary-600 hover:bg-brand-primary-700 text-white'
                } transition-colors`}
              >
                Go to First Page
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};