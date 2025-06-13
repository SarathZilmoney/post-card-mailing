import React from 'react';
import { Mail, Users, TrendingUp, DollarSign } from 'lucide-react';

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
}) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <Icon className="h-8 w-8 text-blue-600" />
      </div>
      <div className="ml-5 w-0 flex-1">
        <dl>
          <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
          <dd className="flex items-baseline">
            <div className="text-2xl font-semibold text-gray-900">{value}</div>
            {change && (
              <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                changeType === 'positive' ? 'text-green-600' : 'text-red-600'
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

export const DashboardStats: React.FC = () => {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Campaigns"
        value={12}
        change="+2 this month"
        changeType="positive"
        icon={Mail}
      />
      <StatsCard
        title="Total Addresses"
        value="2,847"
        change="+12.5%"
        changeType="positive"
        icon={Users}
      />
      <StatsCard
        title="Delivery Rate"
        value="94.2%"
        change="+2.1%"
        changeType="positive"
        icon={TrendingUp}
      />
      <StatsCard
        title="Monthly Spend"
        value="$1,247"
        change="-8.2%"
        changeType="negative"
        icon={DollarSign}
      />
    </div>
  );
};