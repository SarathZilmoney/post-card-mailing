import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  FileText, 
  Tag, 
  Clock, 
  PlayCircle, 
  RotateCcw, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink, 
  Download,
  Mail,
  TrendingUp,
  Loader2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAlert } from '../context/AlertContext';
import { useCampaigns } from '../hooks/useCampaigns';
import { DetailedCampaign } from '../types';
import { formatRelativeTime } from '../utils/dateUtils';
import toast from 'react-hot-toast';

/**
 * Utility functions to handle flexible address formats in campaign responses.
 * 
 * The API can return addresses in two formats:
 * 1. Nested format (current): { address_id: 123, address: { name: "Company", city: "NYC", payee: {...} } }
 * 2. Flat format (fallback): { id: 123, name: "Company", city: "NYC", payee: {...} }
 * 
 * These utilities normalize both formats to a consistent structure.
 */

// Utility functions to handle both nested and flat address formats
const getAddressData = (campaignAddress: any) => {
  // If address is nested (current format)
  if (campaignAddress.address) {
    return {
      id: campaignAddress.address.id,
      name: campaignAddress.address.name,
      address_line_1: campaignAddress.address.address_line_1,
      city: campaignAddress.address.city,
      state: campaignAddress.address.state,
      postal_code: campaignAddress.address.postal_code,
      country: campaignAddress.address.country,
      phone: campaignAddress.address.phone,
      email: campaignAddress.address.email,
      payee: campaignAddress.address.payee
    };
  }
  
  // If address data is at root level (fallback format)
  return {
    id: campaignAddress.id,
    name: campaignAddress.name,
    address_line_1: campaignAddress.address_line_1,
    city: campaignAddress.city,
    state: campaignAddress.state,
    postal_code: campaignAddress.postal_code,
    country: campaignAddress.country,
    phone: campaignAddress.phone,
    email: campaignAddress.email,
    payee: campaignAddress.payee
  };
};

const getCampaignAddressId = (campaignAddress: any) => {
  return campaignAddress.address_id || campaignAddress.id;
};

export const CampaignView: React.FC = () => {
  const { encryptedId } = useParams<{ encryptedId: string }>();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const alert = useAlert();
  const { getCampaign, runCampaign, retryCampaign, deleteCampaign } = useCampaigns();
  
  const [campaign, setCampaign] = useState<DetailedCampaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Pagination state for addresses
  const [currentPage, setCurrentPage] = useState(1);
  const [addressesPerPage, setAddressesPerPage] = useState(10);
  
  // State to track which addresses are expanded
  const [expandedAddresses, setExpandedAddresses] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (encryptedId) {
      fetchCampaign();
    }
  }, [encryptedId]);

  // Reset to first page when per-page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [addressesPerPage]);

  const fetchCampaign = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCampaign(encryptedId!);
      setCampaign(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleRunCampaign = async () => {
    if (!campaign) return;
    
    try {
      setIsRunning(true);
      const response = await runCampaign(encryptedId!);
      
      alert.success(response.message || 'Campaign started successfully!', {
        title: 'Success',
        duration: 4000
      });
      
      // Refresh campaign data
      await fetchCampaign();
    } catch (err) {
      alert.error(err instanceof Error ? err.message : 'Failed to start campaign', {
        title: 'Error',
        duration: 5000
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleRetryCampaign = async () => {
    if (!campaign) return;
    
    // Show confirmation modal before retrying
    alert.showAlert({
      type: 'warning',
      title: 'Retry Campaign',
      message: `Are you sure you want to retry "${campaign.campaign_name}"? This will attempt to run the campaign again.`,
      confirmText: 'Retry Campaign',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          setIsRetrying(true);
          const response = await retryCampaign(encryptedId!);
          
          alert.success(response.message || 'Campaign retry started successfully!', {
            title: 'Success',
            duration: 4000
          });
          
          // Refresh campaign data
          await fetchCampaign();
        } catch (err) {
          alert.error(err instanceof Error ? err.message : 'Failed to retry campaign', {
            title: 'Error',
            duration: 5000
          });
        } finally {
          setIsRetrying(false);
        }
      },
      onCancel: () => {
        // Do nothing on cancel
      }
    });
  };

  const handleDeleteCampaign = () => {
    if (!campaign) return;
    
    alert.showAlert({
      type: 'warning',
      title: 'Delete Campaign',
      message: `Are you sure you want to delete "${campaign.campaign_name}"? This action cannot be undone.`,
      confirmText: 'Delete Campaign',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          setIsDeleting(true);
          const response = await deleteCampaign(encryptedId!);
          
          const successMessage = response.message || 'Campaign deleted successfully!';
          
          // Show both toast and success alert
          toast.success(successMessage);
          alert.success(successMessage, {
            title: 'Campaign Deleted',
            duration: 3000,
            onClose: () => {
              // Navigate back to campaigns list
              navigate('/campaigns');
            }
          });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to delete campaign';
          toast.error(errorMessage);
          alert.error(errorMessage, {
            title: 'Delete Failed',
            duration: 5000
          });
        } finally {
          setIsDeleting(false);
        }
      },
      onCancel: () => {
        // Do nothing on cancel
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return isDark ? 'text-yellow-400' : 'text-yellow-600';
      case 'in_progress':
        return isDark ? 'text-blue-400' : 'text-blue-600';
      case 'completed':
        return isDark ? 'text-green-400' : 'text-green-600';
      default:
        return isDark ? 'text-gray-400' : 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'in_progress':
        return <PlayCircle className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getAddressStatusColor = (status: number, failureReason: string | null) => {
    if (failureReason) {
      return isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800';
    }
    return status === 1 
      ? isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
      : isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800';
  };

  const getAddressStatusText = (status: number, failureReason: string | null) => {
    if (failureReason) {
      return 'Failed';
    }
    return status === 1 ? 'Active' : 'Inactive';
  };

  const getRemainingDays = (nextScheduledRunAt: string | null) => {
    if (!nextScheduledRunAt) {
      return 'Not scheduled';
    }
    
    const now = new Date();
    const nextRun = new Date(nextScheduledRunAt);
    
    // Calculate difference in days
    const diffTime = nextRun.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'Overdue';
    } else if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Tomorrow';
    } else {
      return `${diffDays} days`;
    }
  };

  // Pagination calculations
  const totalAddresses = campaign?.addresses.length || 0;
  const totalPages = Math.ceil(totalAddresses / addressesPerPage);
  const startIndex = (currentPage - 1) * addressesPerPage;
  const endIndex = startIndex + addressesPerPage;
  const currentAddresses = campaign?.addresses.slice(startIndex, endIndex) || [];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const toggleAddressExpansion = (addressId: number) => {
    setExpandedAddresses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(addressId)) {
        newSet.delete(addressId);
      } else {
        newSet.add(addressId);
      }
      return newSet;
    });
  };

  const Pagination = () => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5;
      
      if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 4; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
          pages.push(1);
          pages.push('...');
          for (let i = totalPages - 3; i <= totalPages; i++) {
            pages.push(i);
          }
        } else {
          pages.push(1);
          pages.push('...');
          for (let i = currentPage - 1; i <= currentPage + 1; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(totalPages);
        }
      }
      
      return pages;
    };

    return (
      <div className="flex items-center justify-between mt-6">
        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Showing {startIndex + 1} to {Math.min(endIndex, totalAddresses)} of {totalAddresses.toLocaleString()} addresses
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`p-2 rounded-lg ${
              currentPage === 1
                ? 'text-gray-400 cursor-not-allowed'
                : isDark
                  ? 'text-gray-300 hover:text-white hover:bg-dark-800'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            } transition-colors`}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <div className="flex items-center space-x-1">
            {getPageNumbers().map((page, index) => (
              <React.Fragment key={index}>
                {page === '...' ? (
                  <span className={`px-3 py-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    ...
                  </span>
                ) : (
                  <button
                    onClick={() => handlePageChange(page as number)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === page
                        ? isDark
                          ? 'bg-purple-600 text-white'
                          : 'bg-brand-primary-600 text-white'
                        : isDark
                          ? 'text-gray-300 hover:text-white hover:bg-dark-800'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-lg ${
              currentPage === totalPages
                ? 'text-gray-400 cursor-not-allowed'
                : isDark
                  ? 'text-gray-300 hover:text-white hover:bg-dark-800'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            } transition-colors`}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
            Loading campaign details...
          </span>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96">
        <AlertCircle className={`h-12 w-12 ${isDark ? 'text-red-400' : 'text-red-600'} mb-4`} />
        <h2 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Campaign Not Found
        </h2>
        <p className={`text-center mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {error || 'The campaign you are looking for does not exist or you do not have permission to view it.'}
        </p>
        <button
          onClick={() => navigate('/campaigns')}
          className={`px-4 py-2 rounded-lg ${
            isDark 
              ? 'bg-purple-600 hover:bg-purple-700 text-white' 
              : 'bg-brand-primary-600 hover:bg-brand-primary-700 text-white'
          } transition-colors`}
        >
          Back to Campaigns
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/campaigns')}
            className={`p-2 rounded-lg ${
              isDark 
                ? 'hover:bg-dark-800 text-gray-300 hover:text-white' 
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            } transition-colors`}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {campaign.campaign_name}
            </h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Created {formatRelativeTime(campaign.created_at)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleDeleteCampaign}
            disabled={isDeleting}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              isDeleting
                ? 'bg-gray-400 cursor-not-allowed'
                : isDark 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
            } transition-colors`}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
          </button>
        </div>
      </div>

      {/* Campaign Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`${
          isDark ? 'glass-dark' : 'glass-light'
        } rounded-2xl p-6 ${
          isDark ? 'hover:border-purple-500/30' : 'hover:border-brand-primary-300/50'
        } transition-all duration-300`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className={`w-12 h-12 ${
                isDark 
                  ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20' 
                  : 'bg-gradient-to-br from-brand-primary-100 to-brand-secondary-100'
              } rounded-xl flex items-center justify-center`}>
                <Users className={`h-6 w-6 ${
                  isDark ? 'text-purple-400' : 'text-brand-primary-600'
                }`} />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className={`text-sm font-medium ${
                  isDark ? 'text-gray-400' : 'text-light-600'
                } truncate`}>Total Addresses</dt>
                <dd className={`text-2xl font-semibold ${
                  isDark ? 'text-white' : 'text-light-900'
                }`}>{campaign.addresses.length}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className={`${
          isDark ? 'glass-dark' : 'glass-light'
        } rounded-2xl p-6 ${
          isDark ? 'hover:border-purple-500/30' : 'hover:border-brand-primary-300/50'
        } transition-all duration-300`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className={`w-12 h-12 ${
                isDark 
                  ? 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20' 
                  : 'bg-gradient-to-br from-blue-100 to-cyan-100'
              } rounded-xl flex items-center justify-center`}>
                <PlayCircle className={`h-6 w-6 ${
                  isDark ? 'text-blue-400' : 'text-blue-600'
                }`} />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className={`text-sm font-medium ${
                  isDark ? 'text-gray-400' : 'text-light-600'
                } truncate`}>Execution Count</dt>
                <dd className={`text-2xl font-semibold ${
                  isDark ? 'text-white' : 'text-light-900'
                }`}>{campaign.execution_count}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className={`${
          isDark ? 'glass-dark' : 'glass-light'
        } rounded-2xl p-6 ${
          isDark ? 'hover:border-purple-500/30' : 'hover:border-brand-primary-300/50'
        } transition-all duration-300`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className={`w-12 h-12 ${
                isDark 
                  ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20' 
                  : 'bg-gradient-to-br from-green-100 to-emerald-100'
              } rounded-xl flex items-center justify-center`}>
                <Mail className={`h-6 w-6 ${
                  isDark ? 'text-green-400' : 'text-green-600'
                }`} />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className={`text-sm font-medium ${
                  isDark ? 'text-gray-400' : 'text-light-600'
                } truncate`}>Sends Per Cycle</dt>
                <dd className={`text-2xl font-semibold ${
                  isDark ? 'text-white' : 'text-light-900'
                }`}>{campaign.sends_per_cycle}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className={`${
          isDark ? 'glass-dark' : 'glass-light'
        } rounded-2xl p-6 ${
          isDark ? 'hover:border-purple-500/30' : 'hover:border-brand-primary-300/50'
        } transition-all duration-300`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className={`w-12 h-12 ${
                isDark 
                  ? 'bg-gradient-to-br from-orange-500/20 to-red-500/20' 
                  : 'bg-gradient-to-br from-orange-100 to-red-100'
              } rounded-xl flex items-center justify-center`}>
                <Clock className={`h-6 w-6 ${
                  isDark ? 'text-orange-400' : 'text-orange-600'
                }`} />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className={`text-sm font-medium ${
                  isDark ? 'text-gray-400' : 'text-light-600'
                } truncate`}>Next Run In</dt>
                <dd className={`text-2xl font-semibold ${
                  isDark ? 'text-white' : 'text-light-900'
                }`}>{getRemainingDays(campaign.next_scheduled_run_at)}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className={`${
            isDark ? 'glass-dark' : 'glass-light'
          } rounded-2xl p-6`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Description
            </h3>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
              {campaign.description || 'No description provided.'}
            </p>
          </div>

          {/* Schedule Information */}
          <div className={`${
            isDark ? 'glass-dark' : 'glass-light'
          } rounded-2xl p-6`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Schedule Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Start Date
                </label>
                <p className={`mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {new Date(campaign.start_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Next Scheduled Run
                </label>
                <p className={`mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {campaign.next_scheduled_run_at ? new Date(campaign.next_scheduled_run_at).toLocaleDateString() : 'Not scheduled'}
                </p>
              </div>
              <div>
                <label className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Category
                </label>
                <p className={`mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {campaign.category.name}
                </p>
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div className={`${
            isDark ? 'glass-dark' : 'glass-light'
          } rounded-2xl p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Addresses ({campaign.addresses.length})
              </h3>
              
              {/* Per Page Selector */}
              <div className="flex items-center space-x-2">
                <label className={`text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Show:
                </label>
                <select
                  value={addressesPerPage}
                  onChange={(e) => setAddressesPerPage(Number(e.target.value))}
                  className={`px-3 py-1 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 ${
                    isDark 
                      ? 'bg-dark-800/50 border-dark-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={500}>500</option>
                </select>
                <span className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  per page
                </span>
              </div>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
              {currentAddresses.map((campaignAddress) => {
                const addressData = getAddressData(campaignAddress);
                const addressId = getCampaignAddressId(campaignAddress);
                
                return (
                <div
                  key={campaignAddress.id}
                  className={`p-4 rounded-lg border ${
                    isDark 
                      ? 'border-dark-700 bg-dark-800/50' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div 
                    className="flex items-center justify-between mb-3 cursor-pointer"
                    onClick={() => toggleAddressExpansion(campaignAddress.id)}
                  >
                    <div className="flex-1">
                      <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {addressData.name}
                      </h4>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        ID: {addressId}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${getAddressStatusColor(campaignAddress.status, campaignAddress.failure_reason || null)}`}>
                        {getAddressStatusText(campaignAddress.status, campaignAddress.failure_reason || null)}
                      </div>
                      {expandedAddresses.has(campaignAddress.id) ? (
                        <ChevronUp className={`h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                      ) : (
                        <ChevronDown className={`h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                      )}
                    </div>
                  </div>
                  
                  {/* Payee Information - Only show when expanded */}
                  {expandedAddresses.has(campaignAddress.id) && addressData.payee && (
                    <div className={`mt-3 p-3 rounded-lg ${
                      isDark ? 'bg-green-900/20 border border-green-800/30' : 'bg-green-50 border border-green-200'
                    }`}>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className={`h-4 w-4 flex-shrink-0 ${
                            isDark ? 'text-green-400' : 'text-green-600'
                          }`} />
                          <h5 className={`text-sm font-medium ${
                            isDark ? 'text-green-400' : 'text-green-800'
                          }`}>
                            Payee Information
                          </h5>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              Name:
                            </span>
                            <span className={`ml-2 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                              {addressData.payee?.payee_name}
                            </span>
                          </div>
                          <div>
                            <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              Email:
                            </span>
                            <span className={`ml-2 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                              {addressData.payee?.payee_email || 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              Phone:
                            </span>
                            <span className={`ml-2 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                              {addressData.payee?.payee_phone || 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              Address:
                            </span>
                            <span className={`ml-2 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                              {addressData.payee?.payee_address_line_1}
                            </span>
                          </div>
                          <div>
                            <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              City:
                            </span>
                            <span className={`ml-2 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                              {addressData.payee?.payee_city}
                            </span>
                          </div>
                          <div>
                            <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              State:
                            </span>
                            <span className={`ml-2 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                              {addressData.payee?.payee_state}
                            </span>
                          </div>
                          <div>
                            <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              ZIP:
                            </span>
                            <span className={`ml-2 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                              {addressData.payee?.payee_zip}
                            </span>
                          </div>
                          <div>
                            <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              Country:
                            </span>
                            <span className={`ml-2 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                              {addressData.payee?.payee_country}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Address Details - Only show when expanded */}
                  {expandedAddresses.has(campaignAddress.id) && (
                    <div className={`mt-3 p-3 rounded-lg ${
                      isDark ? 'bg-blue-900/20 border border-blue-800/30' : 'bg-blue-50 border border-blue-200'
                    }`}>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Mail className={`h-4 w-4 flex-shrink-0 ${
                            isDark ? 'text-blue-400' : 'text-blue-600'
                          }`} />
                          <h5 className={`text-sm font-medium ${
                            isDark ? 'text-blue-400' : 'text-blue-800'
                          }`}>
                            Address Details
                          </h5>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          {addressData.address_line_1 && (
                            <div>
                              <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                Address:
                              </span>
                              <span className={`ml-2 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                                {addressData.address_line_1}
                              </span>
                            </div>
                          )}
                          {addressData.city && (
                            <div>
                              <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                City:
                              </span>
                              <span className={`ml-2 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                                {addressData.city}
                              </span>
                            </div>
                          )}
                          {addressData.state && (
                            <div>
                              <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                State:
                              </span>
                              <span className={`ml-2 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                                {addressData.state}
                              </span>
                            </div>
                          )}
                          {addressData.postal_code && (
                            <div>
                              <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                ZIP:
                              </span>
                              <span className={`ml-2 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                                {addressData.postal_code}
                              </span>
                            </div>
                          )}
                          {addressData.country && (
                            <div>
                              <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                Country:
                              </span>
                              <span className={`ml-2 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                                {addressData.country}
                              </span>
                            </div>
                          )}
                          {addressData.phone && (
                            <div>
                              <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                Phone:
                              </span>
                              <span className={`ml-2 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                                {addressData.phone}
                              </span>
                            </div>
                          )}
                          {addressData.email && (
                            <div>
                              <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                Email:
                              </span>
                              <span className={`ml-2 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                                {addressData.email}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* No Payee Information - Only show when expanded */}
                  {expandedAddresses.has(campaignAddress.id) && !addressData.payee && (
                    <div className={`mt-3 p-3 rounded-lg ${
                      isDark ? 'bg-yellow-900/20 border border-yellow-800/30' : 'bg-yellow-50 border border-yellow-200'
                    }`}>
                      <div className="flex items-center space-x-2">
                        <AlertCircle className={`h-4 w-4 flex-shrink-0 ${
                          isDark ? 'text-yellow-400' : 'text-yellow-600'
                        }`} />
                        <div>
                          <p className={`text-sm font-medium ${
                            isDark ? 'text-yellow-400' : 'text-yellow-800'
                          }`}>
                            No Payee Information Available
                          </p>
                          <p className={`text-sm mt-1 ${
                            isDark ? 'text-yellow-300' : 'text-yellow-700'
                          }`}>
                            This address does not have associated payee details.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Failure Reason - Only show when expanded */}
                  {expandedAddresses.has(campaignAddress.id) && campaignAddress.failure_reason && (
                    <div className={`mt-3 p-3 rounded-lg ${
                      isDark ? 'bg-red-900/20 border border-red-800/30' : 'bg-red-50 border border-red-200'
                    }`}>
                      <div className="flex items-start space-x-2">
                        <AlertCircle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                          isDark ? 'text-red-400' : 'text-red-600'
                        }`} />
                        <div>
                          <p className={`text-sm font-medium ${
                            isDark ? 'text-red-400' : 'text-red-800'
                          }`}>
                            Failure Reason:
                          </p>
                          <p className={`text-sm mt-1 ${
                            isDark ? 'text-red-300' : 'text-red-700'
                          }`}>
                            {campaignAddress.failure_reason}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                );
              })}
            </div>
            
            {/* Pagination */}
            <Pagination />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status and Actions */}
          <div className={`${
            isDark ? 'glass-dark' : 'glass-light'
          } rounded-2xl p-6`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Status & Actions
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                {getStatusIcon('in_progress')}
                <span className={`font-medium ${getStatusColor('in_progress')}`}>
                  Active
                </span>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={handleRunCampaign}
                  disabled={isRunning}
                  className={`w-full px-4 py-2 rounded-lg flex items-center justify-center space-x-2 ${
                    isRunning
                      ? 'bg-gray-400 cursor-not-allowed'
                      : isDark 
                        ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                        : 'bg-brand-primary-600 hover:bg-brand-primary-700 text-white'
                  } transition-colors`}
                >
                  {isRunning ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <PlayCircle className="h-4 w-4" />
                  )}
                  <span>{isRunning ? 'Starting...' : 'Run Campaign'}</span>
                </button>
                
                {/* Retry button - show when addresses exist or execution count > 0, and before max runs */}
                {(campaign.addresses.length > 0 || campaign.execution_count > 0) && campaign.execution_count < 3 && (
                  <button
                    onClick={handleRetryCampaign}
                    disabled={isRetrying}
                    className={`w-full px-4 py-2 rounded-lg flex items-center justify-center space-x-2 ${
                      isRetrying
                        ? 'bg-gray-400 cursor-not-allowed'
                        : isDark 
                          ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                          : 'bg-orange-500 hover:bg-orange-600 text-white'
                    } transition-colors`}
                  >
                    {isRetrying ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RotateCcw className="h-4 w-4" />
                    )}
                    <span>{isRetrying ? 'Retrying...' : 'Retry Campaign'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Attachments */}
          {campaign.attachments.length > 0 && (
            <div className={`${
              isDark ? 'glass-dark' : 'glass-light'
            } rounded-2xl p-6`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Attachments ({campaign.attachments.length})
              </h3>
              <div className="space-y-3">
                {campaign.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className={`p-4 rounded-lg border ${
                      isDark 
                        ? 'border-dark-700 bg-dark-800/50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {attachment.file_nick_name.split('/').pop()}
                        </h4>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {attachment.page_count} pages • {new Date(attachment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => window.open(attachment.public_url, '_blank')}
                          className={`p-2 rounded-lg ${
                            isDark 
                              ? 'hover:bg-dark-700 text-gray-300 hover:text-white' 
                              : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                          } transition-colors`}
                          title="Open attachment"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 