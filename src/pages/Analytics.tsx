import React from 'react';
import { BarChart } from 'recharts';
import { TrendingUp, DollarSign, Mail, Users, Target } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

// Dummy data - replace with real data from your API
const monthlyData = [
  { month: 'Jan', sent: 2400, delivered: 2280 },
  { month: 'Feb', sent: 1398, delivered: 1320 },
  { month: 'Mar', sent: 9800, delivered: 9310 },
  { month: 'Apr', sent: 3908, delivered: 3712 },
  { month: 'May', sent: 4800, delivered: 4560 },
  { month: 'Jun', sent: 3800, delivered: 3610 },
];

const dummyStats = [
  { label: 'Total Campaigns', value: '24', change: '+12%' },
  { label: 'Total Sent', value: '26.1K', change: '+8%' },
  { label: 'Delivery Rate', value: '95.2%', change: '+2.1%' },
];

const campaignData = [
  { name: 'Summer Sale', sent: 1200, delivered: 1140, deliveryRate: 95 },
  { name: 'Back to School', sent: 800, delivered: 760, deliveryRate: 95 },
  { name: 'Holiday Special', sent: 1500, delivered: 1425, deliveryRate: 95 },
  { name: 'Spring Collection', sent: 600, delivered: 570, deliveryRate: 95 },
  { name: 'Winter Clearance', sent: 900, delivered: 855, deliveryRate: 95 },
];

export const Analytics: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <div className="space-y-4 sm:space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold gradient-text mb-2">Analytics</h1>
        <p className={`text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Track your campaign performance and spending insights.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className={`${
          isDark ? 'glass-dark' : 'glass bg-white/70 border-gray-200/50'
        } rounded-2xl p-4 sm:p-6 hover:border-purple-500/30 transition-all duration-300 group animate-slideUp`}>
          <dt className="text-sm font-medium text-gray-400 truncate">Total Sent</dt>
          <dd className="mt-1 flex items-baseline">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center group-hover:from-blue-500/30 group-hover:to-blue-600/30 transition-all duration-300">
              <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
            </div>
            <div className="ml-3 sm:ml-4">
              <dd className={`text-xl sm:text-2xl font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>12,847</dd>
              <dd className="text-sm font-medium text-green-400">+12.3%</dd>
            </div>
          </dd>
        </div>

        <div className={`${
          isDark ? 'glass-dark' : 'glass bg-white/70 border-gray-200/50'
        } rounded-2xl p-4 sm:p-6 hover:border-purple-500/30 transition-all duration-300 group animate-slideUp`}>
          <dt className="text-sm font-medium text-gray-400 truncate">Delivery Rate</dt>
          <dd className="mt-1 flex items-baseline">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center group-hover:from-green-500/30 group-hover:to-green-600/30 transition-all duration-300">
              <Target className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
            </div>
            <div className="ml-3 sm:ml-4">
              <dd className={`text-xl sm:text-2xl font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>94.2%</dd>
              <dd className="text-sm font-medium text-green-400">+2.1%</dd>
            </div>
          </dd>
        </div>

        <div className={`${
          isDark ? 'glass-dark' : 'glass bg-white/70 border-gray-200/50'
        } rounded-2xl p-4 sm:p-6 hover:border-purple-500/30 transition-all duration-300 group animate-slideUp`}>
          <dt className="text-sm font-medium text-gray-400 truncate">Total Spend</dt>
          <dd className="mt-1 flex items-baseline">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl flex items-center justify-center group-hover:from-purple-500/30 group-hover:to-purple-600/30 transition-all duration-300">
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
            </div>
            <div className="ml-3 sm:ml-4">
              <dd className={`text-xl sm:text-2xl font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>$19,284</dd>
              <dd className="text-sm font-medium text-red-400">-8.2%</dd>
            </div>
          </dd>
        </div>


      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Monthly Performance Chart */}
        <div className={`${
          isDark ? 'glass-dark' : 'glass bg-white/70 border-gray-200/50'
        } rounded-2xl p-4 sm:p-6 hover:border-purple-500/30 transition-all duration-300 animate-slideUp`}>
          <h3 className={`text-base sm:text-lg font-medium ${
            isDark ? 'text-white' : 'text-gray-900'
          } mb-4`}>Monthly Campaign Performance</h3>
          <div className="h-64 sm:h-80 flex items-center justify-center">
            <div className={`text-center ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <BarChart className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-purple-400" />
              <p className="text-sm">Chart visualization would go here</p>
              <p className="text-xs mt-2">Showing sent vs delivered trends</p>
            </div>
          </div>
        </div>

        {/* Delivery Trend Chart */}
        <div className={`${
          isDark ? 'glass-dark' : 'glass bg-white/70 border-gray-200/50'
        } rounded-2xl p-4 sm:p-6 hover:border-purple-500/30 transition-all duration-300 animate-slideUp`}>
          <h3 className={`text-base sm:text-lg font-medium ${
            isDark ? 'text-white' : 'text-gray-900'
          } mb-4`}>Delivery Trend</h3>
          <div className="h-64 sm:h-80 flex items-center justify-center">
            <div className={`text-center ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <TrendingUp className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-green-400" />
              <p className="text-sm">Line chart would go here</p>
              <p className="text-xs mt-2">Showing delivery rate over time</p>
            </div>
          </div>
        </div>

        {/* Address Sources Chart */}
        <div className={`${
          isDark ? 'glass-dark' : 'glass bg-white/70 border-gray-200/50'
        } rounded-2xl p-4 sm:p-6 hover:border-purple-500/30 transition-all duration-300 animate-slideUp`}>
          <h3 className={`text-base sm:text-lg font-medium ${
            isDark ? 'text-white' : 'text-gray-900'
          } mb-4`}>Address Sources</h3>
          <div className="h-64 sm:h-80 flex items-center justify-center">
            <div className={`text-center ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <Users className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-blue-400" />
              <p className="text-sm">Pie chart would go here</p>
              <p className="text-xs mt-2">Manual vs CSV vs Outscrapper</p>
            </div>
          </div>
        </div>

        {/* Monthly Spend Analysis */}
        <div className={`${
          isDark ? 'glass-dark' : 'glass bg-white/70 border-gray-200/50'
        } rounded-2xl p-4 sm:p-6 hover:border-purple-500/30 transition-all duration-300 animate-slideUp`}>
          <h3 className={`text-base sm:text-lg font-medium ${
            isDark ? 'text-white' : 'text-gray-900'
          } mb-4`}>Monthly Spend Analysis</h3>
          <div className="h-64 sm:h-80 flex items-center justify-center">
            <div className={`text-center ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <DollarSign className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-purple-400" />
              <p className="text-sm">Area chart would go here</p>
              <p className="text-xs mt-2">Budget vs actual spending</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Performance Table */}
      <div className={`${
        isDark ? 'glass-dark' : 'glass bg-white/70 border-gray-200/50'
      } rounded-2xl hover:border-purple-500/30 transition-all duration-300 animate-slideUp`}>
        <div className={`px-4 sm:px-6 py-4 border-b ${
          isDark ? 'border-dark-600' : 'border-gray-200'
        }`}>
          <h3 className={`text-base sm:text-lg font-medium ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>Delivery Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className={`${
              isDark ? 'bg-dark-800/50' : 'bg-gray-50'
            }`}>
              <tr>
                <th className={`px-4 sm:px-6 py-3 text-left text-xs font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-500'
                } uppercase tracking-wider`}>Month</th>
                <th className={`px-4 sm:px-6 py-3 text-left text-xs font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-500'
                } uppercase tracking-wider`}>Sent</th>
                <th className={`px-4 sm:px-6 py-3 text-left text-xs font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-500'
                } uppercase tracking-wider`}>Delivered</th>
                <th className={`px-4 sm:px-6 py-3 text-left text-xs font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-500'
                } uppercase tracking-wider`}>Rate</th>

              </tr>
            </thead>
            <tbody className={`divide-y ${
              isDark ? 'divide-dark-600' : 'divide-gray-200'
            }`}>
              {monthlyData.map((row, index) => (
                <tr key={index} className={`${
                  isDark ? 'hover:bg-dark-800/30' : 'hover:bg-gray-50'
                } transition-colors`}>
                  <td className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {row.month}
                  </td>
                  <td className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {row.sent.toLocaleString()}
                  </td>
                  <td className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {row.delivered.toLocaleString()}
                  </td>
                  <td className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {((row.delivered / row.sent) * 100).toFixed(1)}%
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};