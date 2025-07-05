import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit, MoreHorizontal } from 'lucide-react';
import { useCampaigns } from '../../hooks/useCampaigns';
import { useTheme } from '../../context/ThemeContext';
import { formatDistanceToNow } from 'date-fns';

export const RecentCampaigns: React.FC = () => {
  const { campaigns, loading } = useCampaigns();
  const { isDark } = useTheme();

  if (loading) {
    return (
      <div className={`${
        isDark ? 'glass-dark' : 'glass bg-white/70 border-gray-200/50'
      } rounded-2xl p-6 animate-slideUp`}>
        <div className="animate-pulse space-y-4">
          <div className={`h-4 ${
            isDark ? 'bg-dark-600' : 'bg-gray-300'
          } rounded w-1/4`}></div>
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

  return (
    <div className={`${
      isDark ? 'glass-dark' : 'glass bg-white/70 border-gray-200/50'
    } rounded-2xl hover:border-purple-500/30 transition-all duration-300 animate-slideUp`}>
      <div className={`px-6 py-4 border-b ${
        isDark ? 'border-dark-600' : 'border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <h3 className={`text-lg font-medium ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>Recent Campaigns</h3>
          <Link
            to="/campaigns"
            className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
          >
            View all
          </Link>
        </div>
      </div>
      <div className={`divide-y ${
        isDark ? 'divide-dark-600' : 'divide-gray-200'
      }`}>
        {campaigns.slice(0, 5).map((campaign) => (
          <div key={campaign.id} className={`px-6 py-4 ${
            isDark ? 'hover:bg-dark-800/30' : 'hover:bg-gray-50'
          } transition-colors`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h4 className={`text-sm font-medium ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {campaign.name}
                  </h4>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(campaign.status)}`}>
                    {campaign.status}
                  </span>
                </div>
                <p className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                } mt-1`}>
                  {campaign.description}
                </p>
                <div className={`flex items-center space-x-4 mt-2 text-xs ${
                  isDark ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  <span>{campaign.addressCount} addresses</span>
                  <span>{campaign.sentCount} sent</span>
                  <span>${campaign.cost.toFixed(2)} spent</span>
                  <span>{formatDistanceToNow(new Date(campaign.createdAt))} ago</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className={`p-1 ${
                  isDark 
                    ? 'text-gray-400 hover:text-purple-400 hover:bg-dark-800/50' 
                    : 'text-gray-500 hover:text-purple-500 hover:bg-gray-100'
                } rounded transition-colors`}>
                  <Eye className="h-4 w-4" />
                </button>
                <button className={`p-1 ${
                  isDark 
                    ? 'text-gray-400 hover:text-purple-400 hover:bg-dark-800/50' 
                    : 'text-gray-500 hover:text-purple-500 hover:bg-gray-100'
                } rounded transition-colors`}>
                  <Edit className="h-4 w-4" />
                </button>
                <button className={`p-1 ${
                  isDark 
                    ? 'text-gray-400 hover:text-purple-400 hover:bg-dark-800/50' 
                    : 'text-gray-500 hover:text-purple-500 hover:bg-gray-100'
                } rounded transition-colors`}>
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};