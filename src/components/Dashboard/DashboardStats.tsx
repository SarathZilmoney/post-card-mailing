import React from 'react';
import { Mail, Users, TrendingUp } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useCampaigns } from '../../hooks/useCampaigns';
import { useAddresses } from '../../hooks/useAddresses';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative';
  icon: React.ComponentType<any>;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon 
}) => {
  const { isDark } = useTheme();

  return (
    <div className={`${
      isDark ? 'glass-dark' : 'glass-light'
    } rounded-2xl p-6 ${
      isDark ? 'hover:border-purple-500/30' : 'hover:border-brand-primary-300/50'
    } transition-all duration-300 group animate-slideUp`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className={`w-12 h-12 ${
            isDark 
              ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 group-hover:from-purple-500/30 group-hover:to-pink-500/30' 
              : 'bg-gradient-to-br from-brand-primary-100 to-brand-secondary-100 group-hover:from-brand-primary-150 group-hover:to-brand-secondary-150'
          } rounded-xl flex items-center justify-center transition-all duration-300`}>
            <Icon className={`h-6 w-6 ${
              isDark 
                ? 'text-purple-400 group-hover:text-purple-300' 
                : 'text-brand-primary-600 group-hover:text-brand-primary-700'
            } transition-colors`} />
          </div>
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className={`text-sm font-medium ${
              isDark ? 'text-gray-400' : 'text-light-600'
            } truncate`}>{title}</dt>
            <dd className="flex items-baseline">
              <div className={`text-2xl font-semibold ${
                isDark ? 'text-white' : 'text-light-900'
              }`}>{value}</div>
              {change && (
                <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                  changeType === 'positive' 
                    ? isDark ? 'text-green-400' : 'text-green-600'
                    : changeType === 'negative'
                      ? isDark ? 'text-red-400' : 'text-red-600'
                      : isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {change}
                </div>
              )}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  );
};

export const DashboardStats: React.FC = () => {
  const { campaigns, loading: campaignsLoading } = useCampaigns();
  const { total: totalAddresses, loading: addressesLoading } = useAddresses();

  // Calculate real metrics from campaign data
  const totalCampaigns = campaigns.length;
  
  const totalSent = campaigns.reduce((sum, campaign) => sum + campaign.sentCount, 0);
  const totalDelivered = campaigns.reduce((sum, campaign) => sum + campaign.deliveredCount, 0);
  const deliveryRate = totalSent > 0 ? ((totalDelivered / totalSent) * 100) : 0;
  
  // Calculate active campaigns
  const activeCampaigns = campaigns.filter(campaign => 
    campaign.status === 'in_progress'
  ).length;

  // Format numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Show loading state
  if (campaignsLoading || addressesLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl h-24"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <StatsCard
        title="Total Campaigns"
        value={totalCampaigns}
        change={activeCampaigns > 0 ? `${activeCampaigns} active` : undefined}
        changeType="positive"
        icon={Mail}
      />
      <StatsCard
        title="Total Addresses"
        value={formatNumber(totalAddresses)}
        change={totalAddresses > 0 ? "Ready to use" : "No addresses yet"}
        changeType={totalAddresses > 0 ? "positive" : undefined}
        icon={Users}
      />
      <StatsCard
        title="Delivery Rate"
        value={totalSent > 0 ? `${deliveryRate.toFixed(1)}%` : "0%"}
        change={totalSent > 0 ? `${formatNumber(totalDelivered)} delivered` : "No sends yet"}
        changeType={deliveryRate >= 90 ? "positive" : deliveryRate >= 80 ? undefined : "negative"}
        icon={TrendingUp}
      />
    </div>
  );
};