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
                    : isDark ? 'text-red-400' : 'text-red-600'
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