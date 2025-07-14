import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Alert, AlertOptions, AlertContextType } from '../types';

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

interface AlertProviderProps {
  children: ReactNode;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const generateId = useCallback(() => {
    return `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const showAlert = useCallback((options: AlertOptions): string => {
    const id = options.id || generateId();
    const newAlert: Alert = {
      ...options,
      id,
      createdAt: new Date(),
      isVisible: true,
    };

    setAlerts(prev => [...prev, newAlert]);

    // Auto-close for success and error alerts
    if (options.type === 'success' || options.type === 'error') {
      const duration = options.duration !== undefined ? options.duration : 3000;
      if (duration > 0) {
        // Capture the onClose callback in a closure to avoid stale reference issues
        const onCloseCallback = options.onClose;
        setTimeout(() => {
          hideAlert(id, onCloseCallback);
        }, duration);
      }
    }

    return id;
  }, [generateId]);

  const hideAlert = useCallback((id: string, onCloseCallback?: () => void | Promise<void>) => {
    // If onCloseCallback is not provided, try to find it in the alerts array
    let finalOnCloseCallback = onCloseCallback;
    if (!finalOnCloseCallback) {
      const targetAlert = alerts.find(a => a.id === id);
      finalOnCloseCallback = targetAlert?.onClose;
    }
    
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === id ? { ...alert, isVisible: false } : alert
      )
    );
    
    // Remove from DOM after animation and call onClose callback
    setTimeout(() => {
      setAlerts(prev => prev.filter(alert => alert.id !== id));
      
      // Call onClose callback if it exists
      if (finalOnCloseCallback) {
        try {
          finalOnCloseCallback();
        } catch (error) {
          // Error in alert onClose callback - silently fail
        }
      }
    }, 300);
  }, [alerts]);

  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Convenience methods
  const success = useCallback((message: string, options?: Partial<AlertOptions>): string => {
    return showAlert({
      ...options,
      message,
      type: 'success',
    });
  }, [showAlert]);

  const error = useCallback((message: string, options?: Partial<AlertOptions>): string => {
    return showAlert({
      ...options,
      message,
      type: 'error',
    });
  }, [showAlert]);

  const warning = useCallback((message: string, options?: Partial<AlertOptions>): string => {
    return showAlert({
      ...options,
      message,
      type: 'warning',
      duration: 0, // Warnings don't auto-close
    });
  }, [showAlert]);

  const info = useCallback((message: string, options?: Partial<AlertOptions>): string => {
    return showAlert({
      ...options,
      message,
      type: 'info',
      duration: 0, // Info alerts don't auto-close
    });
  }, [showAlert]);

  const value: AlertContextType = {
    alerts,
    showAlert,
    hideAlert,
    clearAllAlerts,
    success,
    error,
    warning,
    info,
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
    </AlertContext.Provider>
  );
}; 