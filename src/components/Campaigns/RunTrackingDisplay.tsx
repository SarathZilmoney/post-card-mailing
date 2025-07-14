import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle, Eye, ChevronUp } from 'lucide-react';
import { Campaign, CampaignRun } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { formatDistanceToNow } from 'date-fns';

interface RunTrackingDisplayProps {
  campaign: Campaign;
  onGetRunHistory?: (campaignId: string) => Promise<CampaignRun[]>;
  showExpanded?: boolean;
}

export const RunTrackingDisplay: React.FC<RunTrackingDisplayProps> = ({ 
  campaign, 
  onGetRunHistory,
  showExpanded = false 
}) => {
  const { isDark } = useTheme();
  const [expanded, setExpanded] = useState(showExpanded);
  const [runHistory, setRunHistory] = useState<CampaignRun[]>(campaign.runHistory || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (expanded && onGetRunHistory && runHistory.length === 0) {
      loadRunHistory();
    }
  }, [expanded, onGetRunHistory]);

  const loadRunHistory = async () => {
    if (!onGetRunHistory) return;
    
    setLoading(true);
    try {
      const history = await onGetRunHistory(campaign.id);
      setRunHistory(history);
    } catch (error) {
      console.error('Failed to load run history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRunStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getRunStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return isDark 
          ? 'bg-green-500/20 text-green-300 border-green-400/30' 
          : 'bg-green-100/80 text-green-700 border-green-200';
      case 'running':
        return isDark 
          ? 'bg-blue-500/20 text-blue-300 border-blue-400/30' 
          : 'bg-blue-100/80 text-blue-700 border-blue-200';
      case 'failed':
        return isDark 
          ? 'bg-red-500/20 text-red-300 border-red-400/30' 
          : 'bg-red-100/80 text-red-700 border-red-200';
      case 'pending':
      default:
        return isDark 
          ? 'bg-gray-500/20 text-gray-300 border-gray-400/30' 
          : 'bg-gray-100/80 text-gray-700 border-gray-200';
    }
  };

  const getProgressPercentage = () => {
    // Ensure progress never exceeds 100% by capping at maxRuns
    const cappedCurrentRun = Math.min(campaign.currentRun, campaign.maxRuns);
    return Math.round((cappedCurrentRun / campaign.maxRuns) * 100);
  };

  const getProgressColor = () => {
    const percentage = getProgressPercentage();
    if (percentage === 100) return 'bg-green-500';
    if (percentage >= 66) return 'bg-blue-500';
    if (percentage >= 33) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  return (
    <div className={`${
      isDark ? 'bg-dark-800/30 border-dark-600' : 'bg-white border-gray-200'
    } rounded-lg p-4 border`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className={`text-sm font-semibold ${
          isDark ? 'text-white' : 'text-gray-900'
        } flex items-center`}>
          <Clock className="h-4 w-4 mr-2" />
          Run Progress
        </h4>
        <button
          onClick={() => setExpanded(!expanded)}
          className={`${
            isDark 
              ? 'text-gray-400 hover:text-white hover:bg-dark-700/50' 
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
          } p-1 rounded transition-colors`}
        >
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Progress Summary */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className={`${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Run {campaign.currentRun} of {campaign.maxRuns}
          </span>
          <span className={`${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {getProgressPercentage()}% Complete
          </span>
        </div>

        {/* Progress Bar */}
        <div className={`w-full ${
          isDark ? 'bg-dark-700' : 'bg-gray-200'
        } rounded-full h-2 mb-3`}>
          <div 
            className={`${getProgressColor()} h-2 rounded-full transition-all duration-300`}
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>

        {/* Next Scheduled Run - Show after 1st and 2nd runs */}
        {campaign.nextScheduledRunAt && campaign.currentRun > 0 && campaign.currentRun < campaign.maxRuns && (
          <div className={`${
            isDark 
              ? 'bg-blue-500/10 border-blue-400/20 text-blue-300' 
              : 'bg-blue-50 border-blue-200 text-blue-700'
          } border rounded-lg p-3 mb-3`}>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">
                Next run scheduled: {formatDistanceToNow(new Date(campaign.nextScheduledRunAt), { addSuffix: true })}
              </span>
            </div>
          </div>
        )}

        {/* Run completion message */}
        {campaign.currentRun >= campaign.maxRuns && (
          <div className={`${
            isDark 
              ? 'bg-green-500/10 border-green-400/20 text-green-300' 
              : 'bg-green-50 border-green-200 text-green-700'
          } border rounded-lg p-3 mb-3`}>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">
                Campaign completed all {campaign.maxRuns} runs
              </span>
            </div>
          </div>
        )}

        {/* Run Status Indicators */}
        <div className="flex items-center space-x-2 mb-3">
          {[...Array(campaign.maxRuns)].map((_, index) => {
            const runNumber = index + 1;
            const runData = runHistory.find(r => r.runNumber === runNumber);
            const isActive = runNumber === campaign.currentRun && campaign.currentRun < campaign.maxRuns;
            const isCompleted = runNumber <= campaign.currentRun;
            
            return (
              <div
                key={runNumber}
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-xs font-medium transition-colors ${
                  isCompleted
                    ? 'bg-green-500 border-green-500 text-white'
                    : isActive
                      ? isDark
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : 'bg-blue-500 border-blue-500 text-white'
                      : isDark
                        ? 'border-gray-600 text-gray-500'
                        : 'border-gray-300 text-gray-400'
                }`}
              >
                {runNumber}
              </div>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className={`font-medium ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>Total Sent:</span>
            <span className={`ml-2 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>{campaign.sentCount.toLocaleString()}</span>
          </div>
          <div>
            <span className={`font-medium ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>Total Cost:</span>
            <span className={`ml-2 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>${campaign.cost.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Expanded Run History */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h5 className={`text-sm font-medium ${
            isDark ? 'text-white' : 'text-gray-900'
          } mb-3`}>
            Run History
          </h5>
          
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto"></div>
            </div>
          ) : runHistory.length > 0 ? (
            <div className="space-y-3">
              {runHistory.map((run) => (
                <div
                  key={run.runNumber}
                  className={`${
                    isDark ? 'bg-dark-900/50 border-dark-600' : 'bg-gray-50 border-gray-200'
                  } rounded-lg p-3 border`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getRunStatusIcon(run.status)}
                      <span className={`text-sm font-medium ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        Run {run.runNumber}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                        getRunStatusColor(run.status)
                      }`}>
                        {run.status.toUpperCase()}
                      </span>
                    </div>
                    <span className={`text-xs ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {formatDistanceToNow(new Date(run.startedAt), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className={`font-medium ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>Sent:</span>
                      <span className={`ml-1 ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>{run.sentCount}</span>
                    </div>
                    <div>
                      <span className={`font-medium ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>Delivered:</span>
                      <span className={`ml-1 ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>{run.deliveredCount}</span>
                    </div>
                    <div>
                      <span className={`font-medium ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>Returned:</span>
                      <span className={`ml-1 ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>{run.returnedCount}</span>
                    </div>
                    <div>
                      <span className={`font-medium ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>Cost:</span>
                      <span className={`ml-1 ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>${run.cost.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  {run.errorMessage && (
                    <div className="mt-2 text-xs text-red-400">
                      Error: {run.errorMessage}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className={`text-center py-4 text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              No run history available
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 