import React from 'react';
import { DashboardStats } from '../components/Dashboard/DashboardStats';
import { RecentCampaigns } from '../components/Dashboard/RecentCampaigns';
import { OutscrapperActivity } from '../components/Dashboard/OutscrapperActivity';

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
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