import React from 'react';
import { DashboardStats } from '../components/Dashboard/DashboardStats';
import { RecentCampaigns } from '../components/Dashboard/RecentCampaigns';
import { OutscrapperActivity } from '../components/Dashboard/OutscrapperActivity';
import { useTheme } from '../context/ThemeContext';

export const Dashboard: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-bold gradient-text mb-2">Dashboard</h1>
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Welcome back! Here's what's happening with your campaigns.
        </p>
      </div>

      <DashboardStats />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentCampaigns />
        <OutscrapperActivity />
      </div>
    </div>
  );
};