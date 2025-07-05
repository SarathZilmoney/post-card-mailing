import React, { useState } from 'react';
import { Plus, Search, Filter, Eye, Edit, Trash2, Play, Pause, MoreHorizontal, Mail } from 'lucide-react';
import { useCampaigns } from '../hooks/useCampaigns';
import { useTheme } from '../context/ThemeContext';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { CampaignModal } from '../components/Campaigns/CampaignModal';

export const Campaigns: React.FC = () => {
  const { campaigns, loading, deleteCampaign, updateCampaign } = useCampaigns();
  const { isDark } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        await deleteCampaign(id);
        toast.success('Campaign deleted successfully');
      } catch (error) {
        toast.error('Failed to delete campaign');
      }
    }
  };

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    try {
      await updateCampaign(id, { status: newStatus });
      toast.success(`Campaign ${newStatus === 'active' ? 'activated' : 'paused'}`);
    } catch (error) {
      toast.error('Failed to update campaign status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
      case 'completed':
        return 'bg-green-500/20 text-green-300 border-green-400/30';
      case 'draft':
        return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
      case 'paused':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    }
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
      <div className="space-y-6 animate-fadeIn">
        <div className="animate-pulse">
          <div className={`h-8 ${
            isDark ? 'bg-dark-600' : 'bg-gray-300'
          } rounded w-1/4 mb-6`}></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`${
                isDark ? 'glass-dark' : 'glass bg-white/70 border-gray-200/50'
              } rounded-2xl p-6`}>
                <div className={`h-6 ${
                  isDark ? 'bg-dark-600' : 'bg-gray-300'
                } rounded mb-3`}></div>
                <div className={`h-4 ${
                  isDark ? 'bg-dark-600' : 'bg-gray-300'
                } rounded mb-2`}></div>
                <div className={`h-4 ${
                  isDark ? 'bg-dark-600' : 'bg-gray-300'
                } rounded w-3/4`}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            } h-4 w-4`} />
            <input
              type="text"
              placeholder="Search Campaigns"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-10 pr-4 py-2 ${
                isDark 
                  ? 'bg-dark-800/50 border-dark-600 text-white placeholder-gray-500' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 w-80 transition-all duration-200`}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className={`h-4 w-4 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`${
                isDark 
                  ? 'bg-dark-800/50 border-dark-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200`}
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="btn-gradient px-4 py-2 rounded-lg flex items-center space-x-2 font-medium text-white transition-all duration-200"
        >
          <Plus className="h-4 w-4" />
          <span>Create +</span>
        </button>
      </div>

      {/* Campaign Count */}
      <div>
        <h1 className={`text-2xl font-bold ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          {filteredCampaigns.length} Campaign{filteredCampaigns.length !== 1 ? 's' : ''}
        </h1>
      </div>

      {/* Campaign Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCampaigns.map((campaign) => (
          <div key={campaign.id} className={`${
            isDark ? 'glass-dark' : 'glass bg-white/70 border-gray-200/50'
          } rounded-2xl p-6 hover:border-purple-500/30 transition-all duration-300 group animate-slideUp`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(campaign.status)}`}>
                  {getStatusText(campaign.status)}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  className={`p-1 ${
                    isDark 
                      ? 'text-gray-400 hover:text-purple-400 hover:bg-dark-800/50' 
                      : 'text-gray-500 hover:text-purple-500 hover:bg-gray-100'
                  } rounded transition-colors`}
                  title="View Details"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  className={`p-1 ${
                    isDark 
                      ? 'text-gray-400 hover:text-purple-400 hover:bg-dark-800/50' 
                      : 'text-gray-500 hover:text-purple-500 hover:bg-gray-100'
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
              } mb-2`}>
                {campaign.name}
              </h3>
              <p className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              } mb-3`}>
                {campaign.description}
              </p>
              <p className={`text-xs ${
                isDark ? 'text-gray-500' : 'text-gray-500'
              }`}>
                {formatDistanceToNow(new Date(campaign.createdAt), { addSuffix: true })}
              </p>
            </div>

            <div className="mb-4">
              <div className={`text-sm ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              } mb-1`}>
                <span className="font-medium">LIST</span>
              </div>
              <div className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {campaign.addressCount} addresses
              </div>
            </div>

            <div className="mb-4">
              <div className={`text-sm ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              } mb-1`}>
                <span className="font-medium">KEYWORDS</span>
              </div>
              <div className="flex flex-wrap gap-1">
                <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs border border-purple-400/30">
                  POSTCARD
                </span>
                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs border border-blue-400/30">
                  MAIL
                </span>
              </div>
            </div>

            <div className={`flex justify-between items-center text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <div>
                <span className={`font-medium ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>{campaign.sentCount}</span> sent
              </div>
              <div>
                <span className={`font-medium ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>{campaign.deliveredCount}</span> delivered
              </div>
              <div>
                <span className={`font-medium ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>${campaign.cost.toFixed(2)}</span> cost
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredCampaigns.length === 0 && (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-purple-400" />
            </div>
            <h3 className={`text-lg font-medium ${
              isDark ? 'text-white' : 'text-gray-900'
            } mb-2`}>No campaigns found</h3>
            <p className={`${
              isDark ? 'text-gray-400' : 'text-gray-600'
            } mb-6`}>
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first campaign'}
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="btn-gradient px-6 py-3 rounded-lg flex items-center space-x-2 mx-auto font-medium text-white transition-all duration-200"
            >
              <Plus className="h-5 w-5" />
              <span>Create Campaign</span>
            </button>
          </div>
        </div>
      )}

      <CampaignModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};