import React, { useEffect, useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  X,
  Loader2,
  Sparkles,
  Zap,
  Shield
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
  const [isAnimatingIn, setIsAnimatingIn] = useState(true);

  // Auto-close timer visualization for success and error alerts
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [totalDuration, setTotalDuration] = useState<number>(0);

  useEffect(() => {
    // Trigger entrance animation
    setIsAnimatingIn(true);
    const animationTimer = setTimeout(() => setIsAnimatingIn(false), 500);

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

        return () => {
          clearInterval(interval);
          clearTimeout(animationTimer);
        };
      }
    }

    return () => clearTimeout(animationTimer);
  }, [alert]);

  const getAlertIcon = () => {
    if (alert.icon) return alert.icon;
    
    const iconClass = "h-7 w-7";
    const animations = "drop-shadow-lg animate-pulse";
    switch (alert.type) {
      case 'success':
        return (
          <div className="relative">
            <CheckCircle className={`${iconClass} text-emerald-400 ${animations}`} />
            <div className="absolute -top-1 -right-1">
              <Sparkles className="h-4 w-4 text-emerald-300 animate-bounce" />
            </div>
          </div>
        );
      case 'error':
        return (
          <div className="relative">
            <XCircle className={`${iconClass} text-red-400 ${animations}`} />
            <div className="absolute -top-1 -right-1">
              <Zap className="h-4 w-4 text-red-300 animate-bounce" />
            </div>
          </div>
        );
      case 'warning':
        return (
          <div className="relative">
            <AlertTriangle className={`${iconClass} text-amber-400 ${animations}`} />
            <div className="absolute -top-1 -right-1">
              <Shield className="h-4 w-4 text-amber-300 animate-bounce" />
            </div>
          </div>
        );
      case 'info':
        return (
          <div className="relative">
            <Info className={`${iconClass} text-blue-400 ${animations}`} />
            <div className="absolute -top-1 -right-1">
              <Sparkles className="h-4 w-4 text-blue-300 animate-bounce" />
            </div>
          </div>
        );
      default:
        return <Info className={`${iconClass} text-blue-400`} />;
    }
  };

  const getAlertColors = () => {
    switch (alert.type) {
      case 'success':
        return {
          backdrop: 'bg-gradient-to-br from-emerald-500/10 via-green-500/5 to-teal-500/10',
          bg: isDark 
            ? 'bg-gradient-to-br from-gray-800/95 via-gray-900/95 to-gray-800/95 border-emerald-400/30 shadow-emerald-500/20' 
            : 'bg-gradient-to-br from-white/98 via-emerald-50/80 to-green-50/60 border-emerald-300/50 shadow-emerald-500/20',
          text: isDark ? 'text-emerald-100' : 'text-emerald-800',
          titleText: isDark ? 'text-emerald-200' : 'text-emerald-900',
          progressBg: 'bg-emerald-500/20',
          progressFill: 'bg-gradient-to-r from-emerald-400 to-green-500',
          glow: 'shadow-emerald-500/30',
          particle: 'bg-emerald-400'
        };
      case 'error':
        return {
          backdrop: 'bg-gradient-to-br from-red-500/10 via-rose-500/5 to-pink-500/10',
          bg: isDark 
            ? 'bg-gradient-to-br from-gray-800/95 via-gray-900/95 to-gray-800/95 border-red-400/30 shadow-red-500/20' 
            : 'bg-gradient-to-br from-white/98 via-red-50/80 to-rose-50/60 border-red-300/50 shadow-red-500/20',
          text: isDark ? 'text-red-100' : 'text-red-800',
          titleText: isDark ? 'text-red-200' : 'text-red-900',
          progressBg: 'bg-red-500/20',
          progressFill: 'bg-gradient-to-r from-red-400 to-rose-500',
          glow: 'shadow-red-500/30',
          particle: 'bg-red-400'
        };
      case 'warning':
        return {
          backdrop: 'bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-orange-500/10',
          bg: isDark 
            ? 'bg-gradient-to-br from-gray-800/95 via-gray-900/95 to-gray-800/95 border-amber-400/30 shadow-amber-500/20' 
            : 'bg-gradient-to-br from-white/98 via-amber-50/80 to-yellow-50/60 border-amber-300/50 shadow-amber-500/20',
          text: isDark ? 'text-amber-100' : 'text-amber-800',
          titleText: isDark ? 'text-amber-200' : 'text-amber-900',
          progressBg: 'bg-amber-500/20',
          progressFill: 'bg-gradient-to-r from-amber-400 to-orange-500',
          glow: 'shadow-amber-500/30',
          particle: 'bg-amber-400'
        };
      case 'info':
        return {
          backdrop: 'bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-purple-500/10',
          bg: isDark 
            ? 'bg-gradient-to-br from-gray-800/95 via-gray-900/95 to-gray-800/95 border-blue-400/30 shadow-blue-500/20' 
            : 'bg-gradient-to-br from-white/98 via-blue-50/80 to-indigo-50/60 border-blue-300/50 shadow-blue-500/20',
          text: isDark ? 'text-blue-100' : 'text-blue-800',
          titleText: isDark ? 'text-blue-200' : 'text-blue-900',
          progressBg: 'bg-blue-500/20',
          progressFill: 'bg-gradient-to-r from-blue-400 to-indigo-500',
          glow: 'shadow-blue-500/30',
          particle: 'bg-blue-400'
        };
      default:
        return {
          backdrop: 'bg-gradient-to-br from-gray-500/10 via-slate-500/5 to-gray-500/10',
          bg: isDark 
            ? 'bg-gradient-to-br from-gray-800/95 via-gray-900/95 to-gray-800/95 border-gray-400/30' 
            : 'bg-gradient-to-br from-white/98 via-gray-50/80 to-slate-50/60 border-gray-300/50',
          text: isDark ? 'text-gray-100' : 'text-gray-800',
          titleText: isDark ? 'text-gray-200' : 'text-gray-900',
          progressBg: 'bg-gray-500/20',
          progressFill: 'bg-gradient-to-r from-gray-400 to-slate-500',
          glow: 'shadow-gray-500/30',
          particle: 'bg-gray-400'
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
        // Error in alert confirm handler - silently fail
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
        // Error in alert cancel handler - silently fail
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
    <div className={`fixed inset-0 z-[99999] flex items-center justify-center ${colors.backdrop} backdrop-blur-md transition-all duration-500`}>
      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 ${colors.particle} rounded-full opacity-20 animate-ping`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className={`
        ${colors.bg} 
        rounded-3xl 
        shadow-2xl 
        ${colors.glow}
        w-full 
        max-w-md 
        mx-4 
        relative 
        border-2
        backdrop-blur-xl
        transform transition-all duration-700 ease-out
        ${isAnimatingIn ? 'scale-95 opacity-0 translate-y-8' : 'scale-100 opacity-100 translate-y-0'}
        hover:scale-[1.02] hover:shadow-3xl
      `}>
        
        {/* Animated border glow */}
        <div className={`absolute inset-0 rounded-3xl ${colors.glow} opacity-50 animate-pulse`} />
        {/* Progress bar for auto-close alerts with enhanced styling */}
        {isAutoClose && totalDuration > 0 && (
          <div className="absolute top-0 left-0 right-0 h-2 bg-black/10 rounded-t-3xl overflow-hidden">
            <div 
              className={`h-full ${colors.progressFill} transition-all duration-100 ease-linear shadow-lg`}
              style={{ 
                width: `${(timeLeft / totalDuration) * 100}%` 
              }}
            />
            {/* Glowing dot at the end of progress bar */}
            <div 
              className={`absolute top-0 h-2 w-1 bg-white shadow-lg transition-all duration-100 ease-linear`}
              style={{ 
                left: `${(timeLeft / totalDuration) * 100}%` 
              }}
            />
          </div>
        )}

        {/* Header with enhanced styling */}
        <div className={`flex items-center justify-between px-8 py-6 ${
          isAutoClose && totalDuration > 0 ? 'pt-8' : ''
        }`}>
          <div className="flex items-center space-x-4">
            <div className="transform hover:scale-110 transition-transform duration-300">
              {getAlertIcon()}
            </div>
            {alert.title && (
              <h2 className={`text-xl font-bold ${colors.titleText} leading-tight tracking-wide`}>
                {alert.title}
              </h2>
            )}
          </div>
          {!isAutoClose && (
            <button
              onClick={handleClose}
              disabled={isProcessing}
              className={`p-3 rounded-full ${
                isDark 
                  ? 'hover:bg-white/10 text-gray-400 hover:text-white hover:shadow-lg' 
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700 hover:shadow-lg'
              } transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-110 hover:rotate-90`}
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Content with enhanced card styling */}
        <div className="px-8 pb-6">
          <div className={`
            p-6 
            rounded-2xl 
            border-2 
            ${isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}
            backdrop-blur-sm
            shadow-inner
            hover:shadow-lg
            transition-all duration-300
            group
          `}>
            <p className={`text-base ${colors.text} leading-relaxed font-medium tracking-wide group-hover:scale-[1.01] transition-transform duration-300`}>
              {alert.message}
            </p>
          </div>
        </div>

        {/* Enhanced action buttons */}
        {showButtons && (
          <div className={`flex justify-end gap-4 px-8 py-6 border-t-2 ${
            isDark ? 'border-white/10' : 'border-black/10'
          }`}>
            {alert.type === 'warning' && (
              <>
                <button
                  onClick={handleCancel}
                  disabled={isProcessing}
                  className={`px-6 py-3 text-sm font-semibold rounded-xl border-2 ${
                    isDark 
                      ? 'border-white/20 text-gray-300 hover:bg-white/10 hover:border-white/30 hover:text-white' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 hover:text-gray-900'
                  } transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 hover:shadow-lg backdrop-blur-sm`}
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
                  className="px-6 py-3 text-sm font-semibold rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white hover:from-purple-600 hover:via-pink-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2 transform hover:scale-105 hover:shadow-xl shadow-lg backdrop-blur-sm border-2 border-white/20"
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
                className="px-6 py-3 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2 transform hover:scale-105 hover:shadow-xl shadow-lg backdrop-blur-sm border-2 border-white/20"
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