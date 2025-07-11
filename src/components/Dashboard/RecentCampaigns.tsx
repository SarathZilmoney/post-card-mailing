import React from 'react';
import { Link } from 'react-router-dom';
import { useCampaigns } from '../../hooks/useCampaigns';
import { useTheme } from '../../context/ThemeContext';
import { formatDistanceToNow } from 'date-fns';
import { Clock } from 'lucide-react';

export const RecentCampaigns: React.FC = () => {
  const { campaigns, loading } = useCampaigns();
  const { isDark } = useTheme();

  if (loading) {
    return (
      <div className={`${
        isDark ? 'glass-dark' : 'glass-light'
      } rounded-2xl p-6 animate-slideUp`}>
        <div className="animate-pulse space-y-4">
          <div className={`h-4 ${
            isDark ? 'bg-dark-600' : 'bg-light-300'
          } rounded w-1/4`}></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`h-4 ${
                isDark ? 'bg-dark-600' : 'bg-light-300'
              } rounded`}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

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

  return (
    <div className={`${
      isDark ? 'glass-dark' : 'glass-light'
    } rounded-2xl ${
      isDark ? 'hover:border-purple-500/30' : 'hover:border-brand-primary-300/50'
    } transition-all duration-300 animate-slideUp`}>
      <div className={`px-6 py-4 border-b ${
        isDark ? 'border-dark-600' : 'border-light-300'
      }`}>
        <div className="flex items-center justify-between">
          <h3 className={`text-lg font-medium ${
            isDark ? 'text-white' : 'text-light-900'
          }`}>Recent Campaigns</h3>
          <Link
            to="/campaigns"
            className={`text-sm font-medium ${
              isDark ? 'text-purple-400 hover:text-purple-300' : 'text-brand-primary-600 hover:text-brand-primary-700'
            } transition-colors`}
          >
            View all
          </Link>
        </div>
      </div>
      <div className={`divide-y ${
        isDark ? 'divide-dark-600' : 'divide-light-300'
      }`}>
        {campaigns.slice(0, 5).map((campaign) => (
          <div key={campaign.id} className="px-6 py-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(campaign.status)}`}>
                  {campaign.status.toUpperCase()}
                </span>
                <h4 className={`text-sm font-medium ${
                  isDark ? 'text-white' : 'text-light-900'
                } truncate`}>
                  {campaign.name}
                </h4>
              </div>
              <p className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-light-600'
              } mb-1`}>
                {campaign.description}
              </p>
              <div className="flex items-center justify-between">
                <p className={`text-xs ${
                  isDark ? 'text-gray-500' : 'text-light-500'
                }`}>
                  {formatDistanceToNow(new Date(campaign.createdAt), { addSuffix: true })}
                </p>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-gray-400" />
                  <span className={`text-xs ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Run {campaign.currentRun} of {campaign.maxRuns}
                  </span>
                  {campaign.canRunAgain && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'
                    }`}>
                      Can run again
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