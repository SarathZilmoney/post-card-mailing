import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAlert } from '../../context/AlertContext';
import { alertService } from '../../services/alertService';

/**
 * Example component showing how to use the alert service
 * This component demonstrates all types of alerts
 */
const AlertUsageExample: React.FC = () => {
  const { isDark } = useTheme();
  const alert = useAlert(); // You can use either the hook or the service

  // Example using the alert service (recommended)
  const handleSuccessAlert = () => {
    alertService.success('Operation completed successfully!', {
      title: 'Success',
      duration: 3000 // Auto-close after 3 seconds
    });
  };

  const handleErrorAlert = () => {
    alertService.error('Something went wrong. Please try again.', {
      title: 'Error',
      duration: 5000 // Custom duration
    });
  };

  const handleWarningAlert = () => {
    alertService.warning('Are you sure you want to delete this item?', {
      title: 'Confirm Delete',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        // Perform delete operation
        console.log('Item deleted');
        alertService.success('Item deleted successfully!');
      },
      onCancel: () => {
        console.log('Delete cancelled');
      }
    });
  };

  const handleInfoAlert = () => {
    alertService.info('This is important information about your account.', {
      title: 'Account Information',
      confirmText: 'Got it'
    });
  };

  // Example using the confirm method
  const handleConfirmAction = async () => {
    const confirmed = await alertService.confirm(
      'This action cannot be undone. Are you sure you want to proceed?',
      {
        title: 'Confirm Action',
        confirmText: 'Proceed',
        cancelText: 'Cancel'
      }
    );

    if (confirmed) {
      alertService.success('Action completed!');
    } else {
      alertService.info('Action cancelled.');
    }
  };

  // Example using the hook directly
  const handleHookExample = () => {
    alert.success('This uses the hook directly!');
  };

  // Example with custom alert
  const handleCustomAlert = () => {
    alertService.custom({
      type: 'info',
      title: 'Custom Alert',
      message: 'This is a custom alert with a custom icon and actions.',
      icon: <span className="text-2xl">🎉</span>,
      confirmText: 'Awesome!',
      onConfirm: () => {
        alertService.success('Thanks for checking out the custom alert!');
      }
    });
  };

  return (
    <div className={`p-6 rounded-lg ${
      isDark ? 'bg-dark-800/50 border-dark-600' : 'bg-gray-50 border-gray-200'
    } border`}>
      <h3 className={`text-lg font-semibold mb-4 ${
        isDark ? 'text-white' : 'text-gray-900'
      }`}>
        Alert System Examples
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={handleSuccessAlert}
          className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors"
        >
          Show Success Alert
        </button>

        <button
          onClick={handleErrorAlert}
          className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
        >
          Show Error Alert
        </button>

        <button
          onClick={handleWarningAlert}
          className="px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white transition-colors"
        >
          Show Warning Alert
        </button>

        <button
          onClick={handleInfoAlert}
          className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
        >
          Show Info Alert
        </button>

        <button
          onClick={handleConfirmAction}
          className="px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white transition-colors"
        >
          Show Confirm Dialog
        </button>

        <button
          onClick={handleHookExample}
          className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white transition-colors"
        >
          Use Hook Directly
        </button>

        <button
          onClick={handleCustomAlert}
          className="px-4 py-2 rounded-lg bg-pink-500 hover:bg-pink-600 text-white transition-colors"
        >
          Show Custom Alert
        </button>

        <button
          onClick={() => alertService.clearAll()}
          className={`px-4 py-2 rounded-lg border transition-colors ${
            isDark 
              ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
              : 'border-gray-300 text-gray-700 hover:bg-gray-100'
          }`}
        >
          Clear All Alerts
        </button>
      </div>

      <div className={`mt-6 p-4 rounded-lg ${
        isDark ? 'bg-dark-700/50' : 'bg-gray-100'
      }`}>
        <h4 className={`font-medium mb-2 ${
          isDark ? 'text-gray-200' : 'text-gray-800'
        }`}>
          Usage Examples:
        </h4>
        <div className={`text-sm space-y-1 ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}>
          <div>• <code>alertService.success("Message")</code> - Auto-closes after 3s</div>
          <div>• <code>alertService.error("Message")</code> - Auto-closes after 3s</div>
          <div>• <code>alertService.warning("Message", {"{"} onConfirm: () => {"{}"} {"}"});</code> - Shows OK/Cancel</div>
          <div>• <code>alertService.info("Message")</code> - Shows OK button</div>
          <div>• <code>await alertService.confirm("Message")</code> - Returns Promise&lt;boolean&gt;</div>
        </div>
      </div>
    </div>
  );
};

export default AlertUsageExample; 