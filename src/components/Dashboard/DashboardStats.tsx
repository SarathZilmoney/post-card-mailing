import React from 'react';
import { Mail, Users, TrendingUp, DollarSign } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

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
      isDark ? 'glass-dark' : 'glass bg-white/70 border-gray-200/50'
    } rounded-2xl p-6 hover:border-purple-500/30 transition-all duration-300 group animate-slideUp`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-all duration-300">
            <Icon className="h-6 w-6 text-purple-400 group-hover:text-purple-300 transition-colors" />
          </div>
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className={`text-sm font-medium ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            } truncate`}>{title}</dt>
            <dd className="flex items-baseline">
              <div className={`text-2xl font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>{value}</div>
              {change && (
                <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                  changeType === 'positive' ? 'text-green-400' : 'text-red-400'
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