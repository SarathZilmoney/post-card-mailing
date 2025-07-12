import React, { useState } from 'react';
import { Plus, Search, Filter, Eye, Edit, Trash2, MoreHorizontal, Mail, PlayCircle, Square, RotateCcw, CheckCircle } from 'lucide-react';
import { useCampaigns } from '../hooks/useCampaigns';
import { useTheme } from '../context/ThemeContext';
import { useAlert } from '../context/AlertContext';
import { Campaign } from '../types';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { CampaignModal } from '../components/Campaigns/CampaignModal';
import { RunTrackingDisplay } from '../components/Campaigns/RunTrackingDisplay';

export const Campaigns: React.FC = () => {
  const { campaigns, loading, deleteCampaign, updateCampaign, runCampaign, stopCampaign, refetch, getRunHistory } = useCampaigns();
  const { isDark } = useTheme();
  const alert = useAlert();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [expandedCampaigns, setExpandedCampaigns] = useState<Set<string>>(new Set());



  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id: string, campaignName: string) => {
    alert.showAlert({
      type: 'warning',
      title: 'Delete Campaign',
      message: `Are you sure you want to delete "${campaignName}"? This action cannot be undone.`,
      confirmText: 'Delete Campaign',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          const response = await deleteCampaign(id);
          const successMessage = response.message || 'Campaign deleted successfully';
          
          // Show both toast and success alert
          toast.success(successMessage);
          alert.success(successMessage, {
            title: 'Campaign Deleted',
            duration: 4000
          });
        } catch (error: any) {
          const errorMessage = error?.message || 'Failed to delete campaign';
          toast.error(errorMessage);
          alert.error(errorMessage, {
            title: 'Delete Failed',
            duration: 5000
          });
        }
      },
      onCancel: () => {
        // Do nothing on cancel
      }
    });
  };



  const handleRunCampaign = async (id: string, campaignName: string) => {
    const campaign = campaigns.find(c => c.id === id);
    if (!campaign) return;

    // Check if campaign can run again
    if (!campaign.canRunAgain) {
      alert.error('This campaign has already completed all 3 runs', {
        title: 'Campaign Completed',
        duration: 5000
      });
      return;
    }

    const runNumber = campaign.currentRun + 1;
    const isFirstRun = campaign.currentRun === 0;
    const isLastRun = runNumber === campaign.maxRuns;
    
    alert.showAlert({
      type: 'warning',
      title: isFirstRun ? 'Start Campaign' : `Start Run ${runNumber}`,
      message: `Are you sure you want to ${isFirstRun ? 'start' : `run ${runNumber} of`} "${campaignName}"? ${
        isLastRun ? 'This will be the final run.' : `This will be run ${runNumber} of ${campaign.maxRuns}.`
      } Postcards will be sent to the selected addresses.`,
      confirmText: isFirstRun ? 'Start Campaign' : `Start Run ${runNumber}`,
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          const response = await runCampaign(id);
          
          if (response.success) {
            const successMessage = response.message || `Campaign run ${runNumber} started successfully!`;
            
            // Show both toast and success alert
            toast.success(successMessage);
            alert.success(successMessage, {
              title: isFirstRun ? 'Campaign Started' : `Run ${runNumber} Started`,
              duration: 4000
            });
          } else {
            const errorMessage = response.message || `Failed to start campaign run ${runNumber}`;
            toast.error(errorMessage);
            alert.error(errorMessage, {
              title: 'Campaign Start Failed',
              duration: 5000
            });
          }
        } catch (error: any) {
          const errorMessage = error?.message || `Failed to start campaign run ${runNumber}`;
          toast.error(errorMessage);
          alert.error(errorMessage, {
            title: 'Campaign Start Failed',
            duration: 5000
          });
        }
      },
      onCancel: () => {
        // Do nothing on cancel
      }
    });
  };

  const handleStopCampaign = async (id: string, campaignName: string) => {
    alert.showAlert({
      type: 'warning',
      title: 'Stop Campaign',
      message: `Are you sure you want to stop "${campaignName}"? This will pause the campaign.`,
      confirmText: 'Stop Campaign',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          await stopCampaign(id);
          toast.success('Campaign stopped successfully!');
        } catch (error) {
          toast.error('Failed to stop campaign');
        }
      },
      onCancel: () => {
        // Do nothing on cancel
      }
    });
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setModalOpen(true);
  };



  const handleModalClose = () => {
    setModalOpen(false);
    setEditingCampaign(null);
  };

  const handleCampaignCreated = async () => {
    // This callback will be called by the modal after successful campaign creation
    try {
      await refetch(true);
    } catch (error) {
      console.error('Failed to refresh campaigns after creation:', error);
      alert.warning('Campaign was created successfully, but failed to refresh the list. Please refresh the page to see the new campaign.', {
        title: 'Refresh Failed',
        duration: 6000
      });
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: isDark 
        ? 'bg-blue-500/20 text-blue-300 border-blue-400/30' 
        : 'bg-blue-100/80 text-blue-700 border-blue-200',
      completed: isDark 
        ? 'bg-green-500/20 text-green-300 border-green-400/30' 
        : 'bg-green-100/80 text-green-700 border-green-200',
      draft: isDark 
        ? 'bg-gray-500/20 text-gray-300 border-gray-400/30' 
        : 'bg-light-200/80 text-light-700 border-light-300',
      paused: isDark 
        ? 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30' 
        : 'bg-yellow-100/80 text-yellow-700 border-yellow-200',
    } as const;
    return colors[status as keyof typeof colors] || colors.draft;
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'COMPLETE';
      case 'active':
        return 'RUNNING';
      case 'draft':
        return 'DRAFT';
      case 'paused':
        return 'PAUSED';
      default:
        return status.toUpperCase();
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6 animate-fadeIn">
        <div className="animate-pulse">
          <div className={`h-6 sm:h-8 ${
            isDark ? 'bg-dark-600' : 'bg-light-300'
          } rounded w-1/4 mb-6`}></div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`${
                isDark ? 'glass-dark' : 'glass-light'
              } rounded-2xl p-4 sm:p-6`}>
                <div className={`h-4 sm:h-6 ${
                  isDark ? 'bg-dark-600' : 'bg-light-300'
                } rounded mb-3`}></div>
                <div className={`h-3 sm:h-4 ${
                  isDark ? 'bg-dark-600' : 'bg-light-300'
                } rounded mb-2`}></div>
                <div className={`h-3 sm:h-4 ${
                  isDark ? 'bg-dark-600' : 'bg-light-300'
                } rounded w-3/4`}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-8">
      {/* Page Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className={`text-2xl sm:text-3xl font-bold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Campaigns
          </h1>
          <p className={`mt-1 text-sm ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {filteredCampaigns.length} campaign{filteredCampaigns.length !== 1 ? 's' : ''} found
          </p>
        </div>
        
        <button
          onClick={() => setModalOpen(true)}
          className={`${
            isDark 
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' 
              : 'bg-gradient-to-r from-brand-primary-600 to-brand-secondary-600 hover:from-brand-primary-700 hover:to-brand-secondary-700'
          } text-white px-4 sm:px-6 py-3 rounded-lg flex items-center justify-center space-x-2 font-medium transition-all duration-200 shadow-lg hover:shadow-xl`}
        >
          <Plus className="h-5 w-5" />
          <span className="hidden sm:inline">Create Campaign</span>
          <span className="sm:hidden">Create</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          } h-5 w-5`} />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 ${
              isDark 
                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } rounded-lg focus:ring-2 focus:ring-brand-primary-500 focus:border-brand-primary-500 transition-all duration-200`}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className={`h-5 w-5 ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`${
              isDark 
                ? 'bg-gray-800 border-gray-700 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } rounded-lg px-3 sm:px-4 py-3 focus:ring-2 focus:ring-brand-primary-500 focus:border-brand-primary-500 transition-all duration-200`}
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Campaign Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {filteredCampaigns.map((campaign) => (
          <div key={campaign.id} className={`${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } border rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all duration-300 group`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <span className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(campaign.status)}`}>
                  {getStatusText(campaign.status)}
                </span>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                {/* View Details Button */}
                <button
                  className={`p-1 ${
                    isDark 
                      ? 'text-gray-400 hover:text-purple-400 hover:bg-dark-800/50' 
                      : 'text-light-600 hover:text-brand-primary-600 hover:bg-light-200/60'
                  } rounded transition-colors`}
                  title="View Details"
                >
                  <Eye className="h-4 w-4" />
                </button>
                
                {/* Edit Button */}
                <button
                  onClick={() => handleEditCampaign(campaign)}
                  className={`p-1 ${
                    isDark 
                      ? 'text-gray-400 hover:text-blue-400 hover:bg-dark-800/50' 
                      : 'text-light-600 hover:text-blue-600 hover:bg-light-200/60'
                  } rounded transition-colors`}
                  title="Edit Campaign"
                >
                  <Edit className="h-4 w-4" />
                </button>
                
                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(campaign.id, campaign.name)}
                  className={`p-1 ${
                    isDark 
                      ? 'text-gray-400 hover:text-red-400 hover:bg-dark-800/50' 
                      : 'text-light-600 hover:text-red-600 hover:bg-light-200/60'
                  } rounded transition-colors`}
                  title="Delete Campaign"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                
                {/* More Options Button - Hidden on mobile */}
                <button
                  className={`hidden sm:block p-1 ${
                    isDark 
                      ? 'text-gray-400 hover:text-purple-400 hover:bg-dark-800/50' 
                      : 'text-light-600 hover:text-brand-primary-600 hover:bg-light-200/60'
                  } rounded transition-colors`}
                  title="More Options"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mb-4">
              <h3 className={`text-lg font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              } mb-2 line-clamp-1`}>
                {campaign.name}
              </h3>
              <p className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              } mb-3 line-clamp-2`}>
                {campaign.description}
              </p>
              <p className={`text-xs ${
                isDark ? 'text-gray-500' : 'text-gray-500'
              }`}>
                {formatDistanceToNow(new Date(campaign.createdAt), { addSuffix: true })}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center mb-4">
              <div>
                <div className={`text-base sm:text-lg font-semibold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {campaign.addressCount || 0}
                </div>
                <div className={`text-xs ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Addresses
                </div>
              </div>
              <div>
                <div className={`text-base sm:text-lg font-semibold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {campaign.sentCount || 0}
                </div>
                <div className={`text-xs ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Sent
                </div>
              </div>
              <div>
                <div className={`text-base sm:text-lg font-semibold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  ${campaign.cost || 0}
                </div>
                <div className={`text-xs ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Cost
                </div>
              </div>
            </div>

            {/* Run Progress Display */}
            <div className="mb-4">
              <RunTrackingDisplay 
                campaign={campaign} 
                onGetRunHistory={getRunHistory}
                showExpanded={expandedCampaigns.has(campaign.id)}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {campaign.status === 'draft' || campaign.status === 'paused' || (campaign.canRunAgain && campaign.nextRunAvailable) ? (
                (() => {
                  // Check if start date is in the future to determine button type
                  // Future date = "Start Early" (blue), Current/Past date = "Run Campaign" (green)
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const startDate = campaign.scheduledDate ? new Date(campaign.scheduledDate) : today;
                  const isFutureDate = startDate > today;
                  const isFirstRun = campaign.currentRun === 0;
                  const nextRunNumber = campaign.currentRun + 1;
                  
                  return (
                    <button
                      onClick={() => handleRunCampaign(campaign.id, campaign.name)}
                      className={`flex-1 flex items-center justify-center px-3 sm:px-4 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-sm ${
                        isFutureDate && isFirstRun
                          ? isDark
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/20 hover:shadow-blue-500/30'
                            : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-blue-500/20 hover:shadow-blue-500/30'
                          : isDark
                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-green-500/20 hover:shadow-green-500/30'
                            : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-green-500/20 hover:shadow-green-500/30'
                      } hover:shadow-lg transform hover:scale-105`}
                    >
                      {isFirstRun ? (
                        <PlayCircle className="h-4 sm:h-5 w-4 sm:w-5 mr-2" />
                      ) : (
                        <RotateCcw className="h-4 sm:h-5 w-4 sm:w-5 mr-2" />
                      )}
                      <span className="text-sm font-semibold">
                        {isFirstRun 
                          ? (isFutureDate ? 'Start Early' : 'Run')
                          : `Run ${nextRunNumber}`
                        }
                      </span>
                    </button>
                  );
                })()
              ) : campaign.status === 'active' ? (
                <button
                  onClick={() => handleStopCampaign(campaign.id, campaign.name)}
                  className={`flex-1 flex items-center justify-center px-3 sm:px-4 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-sm ${
                    isDark
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-red-500/20 hover:shadow-red-500/30'
                      : 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white shadow-red-500/20 hover:shadow-red-500/30'
                  } hover:shadow-lg transform hover:scale-105`}
                >
                  <Square className="h-4 sm:h-5 w-4 sm:w-5 mr-2" />
                  <span className="text-sm font-semibold">
                    <span className="hidden sm:inline">Stop Campaign</span>
                    <span className="sm:hidden">Stop</span>
                  </span>
                </button>
              ) : campaign.status === 'completed' ? (
                <div className={`flex-1 flex items-center justify-center px-3 sm:px-4 py-2.5 rounded-lg ${
                  isDark
                    ? 'bg-gray-700/50 text-gray-400 border border-gray-600'
                    : 'bg-gray-100 text-gray-500 border border-gray-200'
                }`}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">
                    <span className="hidden sm:inline">
                      {campaign.currentRun >= campaign.maxRuns ? 'All Runs Complete' : 'Campaign Completed'}
                    </span>
                    <span className="sm:hidden">Complete</span>
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredCampaigns.length === 0 && (
        <div className="text-center py-8 sm:py-12">
          <div className="max-w-md mx-auto px-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-purple-400" />
            </div>
            <h3 className={`text-lg font-medium ${
              isDark ? 'text-white' : 'text-gray-900'
            } mb-2`}>No campaigns found</h3>
            <p className={`text-sm sm:text-base ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            } mb-6`}>
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first campaign'}
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="btn-gradient px-4 sm:px-6 py-3 rounded-lg flex items-center space-x-2 mx-auto font-medium text-white transition-all duration-200"
            >
              <Plus className="h-5 w-5" />
              <span>Create Campaign</span>
            </button>
          </div>
        </div>
      )}

      <CampaignModal 
        open={modalOpen} 
        onClose={handleModalClose} 
        editCampaign={editingCampaign || undefined}
        onCampaignCreated={handleCampaignCreated}
      />
    </div>
  );
};