import { AlertOptions } from '../types';

// This will be injected when the service is initialized
let alertContext: any = null;

export const initializeAlertService = (context: any) => {
  alertContext = context;
};

class AlertService {
  private getContext() {
    if (!alertContext) {
      console.warn('AlertService: Context not initialized. Make sure to call initializeAlertService.');
      return null;
    }
    return alertContext;
  }

  /**
   * Show a success alert that auto-closes after 3 seconds
   */
  success(message: string, options?: Partial<AlertOptions>): string | null {
    const context = this.getContext();
    if (!context) return null;

    return context.success(message, {
      duration: 3000,
      ...options,
    });
  }

  /**
   * Show an error alert that auto-closes after 3 seconds
   */
  error(message: string, options?: Partial<AlertOptions>): string | null {
    const context = this.getContext();
    if (!context) return null;

    return context.error(message, {
      duration: 3000,
      ...options,
    });
  }

  /**
   * Show a warning alert with OK and Cancel buttons
   */
  warning(
    message: string, 
    options?: Partial<AlertOptions> & {
      onConfirm?: () => void | Promise<void>;
      onCancel?: () => void | Promise<void>;
    }
  ): string | null {
    const context = this.getContext();
    if (!context) return null;

    return context.warning(message, {
      confirmText: 'OK',
      cancelText: 'Cancel',
      ...options,
    });
  }

  /**
   * Show an info alert with OK button
   */
  info(message: string, options?: Partial<AlertOptions>): string | null {
    const context = this.getContext();
    if (!context) return null;

    return context.info(message, {
      confirmText: 'OK',
      ...options,
    });
  }

  /**
   * Show a custom alert with full control
   */
  custom(options: AlertOptions): string | null {
    const context = this.getContext();
    if (!context) return null;

    return context.showAlert(options);
  }

  /**
   * Hide a specific alert by ID
   */
  hide(id: string): void {
    const context = this.getContext();
    if (!context) return;

    context.hideAlert(id);
  }

  /**
   * Clear all alerts
   */
  clearAll(): void {
    const context = this.getContext();
    if (!context) return;

    context.clearAllAlerts();
  }

  /**
   * Confirm dialog - shows a warning alert with custom confirm/cancel actions
   */
  confirm(
    message: string,
    options?: {
      title?: string;
      confirmText?: string;
      cancelText?: string;
      onConfirm?: () => void | Promise<void>;
      onCancel?: () => void | Promise<void>;
    }
  ): Promise<boolean> {
    return new Promise((resolve) => {
      this.warning(message, {
        title: options?.title || 'Confirm Action',
        confirmText: options?.confirmText || 'Confirm',
        cancelText: options?.cancelText || 'Cancel',
        onConfirm: async () => {
          if (options?.onConfirm) {
            await options.onConfirm();
          }
          resolve(true);
        },
        onCancel: async () => {
          if (options?.onCancel) {
            await options.onCancel();
          }
          resolve(false);
        },
      });
    });
  }

  /**
   * Show loading alert that doesn't auto-close
   */
  loading(message: string = 'Loading...', options?: Partial<AlertOptions>): string | null {
    const context = this.getContext();
    if (!context) return null;

    return context.info(message, {
      duration: 0, // Don't auto-close
      ...options,
    });
  }
}

// Export singleton instance
export const alertService = new AlertService();

// Export default for easier imports
export default alertService; 