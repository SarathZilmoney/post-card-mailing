import React, { useEffect, useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  X,
  Loader2 
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAlert } from '../../context/AlertContext';
import { Alert } from '../../types';

interface AlertModalProps {
  alert: Alert;
}

const AlertModal: React.FC<AlertModalProps> = ({ alert }) => {
  const { isDark } = useTheme();
  const { hideAlert } = useAlert();
  const [isProcessing, setIsProcessing] = useState(false);

  // Auto-close timer visualization for success and error alerts
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [totalDuration, setTotalDuration] = useState<number>(0);

  useEffect(() => {
    if (alert.type === 'success' || alert.type === 'error') {
      const duration = alert.duration !== undefined ? alert.duration : 3000;
      if (duration > 0) {
        setTotalDuration(duration);
        setTimeLeft(duration);
        
        const interval = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 100) {
              clearInterval(interval);
              return 0;
            }
            return prev - 100;
          });
        }, 100);

        return () => clearInterval(interval);
      }
    }
  }, [alert]);

  const getAlertIcon = () => {
    if (alert.icon) return alert.icon;
    
    const iconClass = "h-6 w-6";
    switch (alert.type) {
      case 'success':
        return <CheckCircle className={`${iconClass} text-green-500`} />;
      case 'error':
        return <XCircle className={`${iconClass} text-red-500`} />;
      case 'warning':
        return <AlertTriangle className={`${iconClass} text-yellow-500`} />;
      case 'info':
        return <Info className={`${iconClass} text-blue-500`} />;
      default:
        return <Info className={`${iconClass} text-blue-500`} />;
    }
  };

  const getAlertColors = () => {
    switch (alert.type) {
      case 'success':
        return {
          bg: isDark ? 'bg-green-500/10 border-green-400/20' : 'bg-green-50 border-green-200',
          text: isDark ? 'text-green-300' : 'text-green-800',
          titleText: isDark ? 'text-green-200' : 'text-green-900',
          progressBg: 'bg-green-500/20',
          progressFill: 'bg-green-500'
        };
      case 'error':
        return {
          bg: isDark ? 'bg-red-500/10 border-red-400/20' : 'bg-red-50 border-red-200',
          text: isDark ? 'text-red-300' : 'text-red-800',
          titleText: isDark ? 'text-red-200' : 'text-red-900',
          progressBg: 'bg-red-500/20',
          progressFill: 'bg-red-500'
        };
      case 'warning':
        return {
          bg: isDark ? 'bg-yellow-500/10 border-yellow-400/20' : 'bg-yellow-50 border-yellow-200',
          text: isDark ? 'text-yellow-300' : 'text-yellow-800',
          titleText: isDark ? 'text-yellow-200' : 'text-yellow-900',
          progressBg: 'bg-yellow-500/20',
          progressFill: 'bg-yellow-500'
        };
      case 'info':
        return {
          bg: isDark ? 'bg-blue-500/10 border-blue-400/20' : 'bg-blue-50 border-blue-200',
          text: isDark ? 'text-blue-300' : 'text-blue-800',
          titleText: isDark ? 'text-blue-200' : 'text-blue-900',
          progressBg: 'bg-blue-500/20',
          progressFill: 'bg-blue-500'
        };
      default:
        return {
          bg: isDark ? 'bg-gray-500/10 border-gray-400/20' : 'bg-gray-50 border-gray-200',
          text: isDark ? 'text-gray-300' : 'text-gray-800',
          titleText: isDark ? 'text-gray-200' : 'text-gray-900',
          progressBg: 'bg-gray-500/20',
          progressFill: 'bg-gray-500'
        };
    }
  };

  const handleClose = () => {
    hideAlert(alert.id);
  };

  const handleConfirm = async () => {
    if (alert.onConfirm) {
      setIsProcessing(true);
      try {
        await alert.onConfirm();
        hideAlert(alert.id);
      } catch (error) {
        console.error('Error in alert confirm handler:', error);
      } finally {
        setIsProcessing(false);
      }
    } else {
      hideAlert(alert.id);
    }
  };

  const handleCancel = async () => {
    if (alert.onCancel) {
      setIsProcessing(true);
      try {
        await alert.onCancel();
        hideAlert(alert.id);
      } catch (error) {
        console.error('Error in alert cancel handler:', error);
      } finally {
        setIsProcessing(false);
      }
    } else {
      hideAlert(alert.id);
    }
  };

  const colors = getAlertColors();
  const showButtons = alert.type === 'warning' || alert.type === 'info';
  const isAutoClose = alert.type === 'success' || alert.type === 'error';

  if (!alert.isVisible) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className={`${
        isDark ? 'glass-dark' : 'glass bg-white/90'
      } rounded-2xl shadow-2xl w-full max-w-md mx-4 relative animate-fadeIn border ${
        isDark ? 'border-white/10' : 'border-gray-200/50'
      }`}>
        {/* Progress bar for auto-close alerts */}
        {isAutoClose && totalDuration > 0 && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200/20 rounded-t-2xl overflow-hidden">
            <div 
              className={`h-full ${colors.progressFill} transition-all duration-100 ease-linear`}
              style={{ 
                width: `${(timeLeft / totalDuration) * 100}%` 
              }}
            />
          </div>
        )}

        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 ${
          isAutoClose && totalDuration > 0 ? 'pt-5' : ''
        }`}>
          <div className="flex items-center space-x-3">
            {getAlertIcon()}
            {alert.title && (
              <h2 className={`text-lg font-semibold ${colors.titleText}`}>
                {alert.title}
              </h2>
            )}
          </div>
          {!isAutoClose && (
            <button
              onClick={handleClose}
              disabled={isProcessing}
              className={`p-2 rounded-lg ${
                isDark 
                  ? 'hover:bg-white/10 text-gray-400 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
              } transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="px-6 pb-4">
          <div className={`p-4 rounded-lg border ${colors.bg}`}>
            <p className={`text-sm ${colors.text} leading-relaxed`}>
              {alert.message}
            </p>
          </div>
        </div>

        {/* Actions */}
        {showButtons && (
          <div className={`flex justify-end gap-3 px-6 py-4 border-t ${
            isDark ? 'border-white/10' : 'border-gray-200'
          }`}>
            {alert.type === 'warning' && (
              <>
                <button
                  onClick={handleCancel}
                  disabled={isProcessing}
                  className={`px-4 py-2 text-sm rounded-lg border ${
                    isDark 
                      ? 'border-white/10 text-gray-300 hover:bg-white/10' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                  } transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    alert.cancelText || 'Cancel'
                  )}
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isProcessing}
                  className="px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  {alert.confirmText || 'OK'}
                </button>
              </>
            )}
            {alert.type === 'info' && (
              <button
                onClick={handleConfirm}
                disabled={isProcessing}
                className="px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                {alert.confirmText || 'OK'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertModal; 