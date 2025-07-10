# Alert System

A comprehensive alert system for the React application that provides different types of alerts with theme compatibility.

## Features

- **4 Alert Types**: Success, Error, Warning, and Info
- **Auto-close**: Success and Error alerts auto-close after 3 seconds
- **Action Buttons**: Warning alerts have OK/Cancel buttons, Info alerts have OK button
- **Theme Compatible**: Works with both light and dark themes
- **Progress Indicator**: Visual countdown for auto-closing alerts
- **Async Support**: Handles async operations in confirm/cancel handlers
- **Service Pattern**: Easy-to-use service API throughout the app

## Installation

The alert system is already integrated into the app. The components are located in:
- `src/components/Alert/`
- `src/context/AlertContext.tsx`
- `src/services/alertService.ts`

## Usage

### Using the Alert Service (Recommended)

```typescript
import { alertService } from './services/alertService';

// Success alert (auto-closes after 3 seconds)
alertService.success('Operation completed successfully!');

// Success alert with callback executed when alert is closed
alertService.success('Campaign created successfully!', {
  title: 'Success',
  duration: 4000,
  onClose: () => {
    // This runs when the alert is closed (auto-closed or manually dismissed)
    console.log('Alert closed, refreshing data...');
    // Refresh data, navigate, or perform other actions here
  }
});

// Error alert (auto-closes after 3 seconds)
alertService.error('Something went wrong. Please try again.');

// Warning alert (shows OK/Cancel buttons)
alertService.warning('Are you sure you want to delete this item?', {
  title: 'Confirm Delete',
  confirmText: 'Delete',
  cancelText: 'Cancel',
  onConfirm: async () => {
    // Perform delete operation
    await deleteItem();
    alertService.success('Item deleted successfully!');
  },
  onCancel: () => {
    console.log('Delete cancelled');
  }
});

// Info alert (shows OK button)
alertService.info('This is important information about your account.', {
  title: 'Account Information',
  confirmText: 'Got it'
});
```

### Using the Confirm Method

```typescript
// Shows a warning alert and returns a Promise<boolean>
const confirmed = await alertService.confirm(
  'This action cannot be undone. Are you sure you want to proceed?',
  {
    title: 'Confirm Action',
    confirmText: 'Proceed',
    cancelText: 'Cancel'
  }
);

if (confirmed) {
  // User clicked OK
  alertService.success('Action completed!');
} else {
  // User clicked Cancel
  alertService.info('Action cancelled.');
}
```

### Using the Hook Directly

```typescript
import { useAlert } from './context/AlertContext';

const MyComponent = () => {
  const alert = useAlert();

  const handleClick = () => {
    alert.success('This uses the hook directly!');
  };

  return <button onClick={handleClick}>Show Alert</button>;
};
```

### Custom Alerts

```typescript
alertService.custom({
  type: 'info',
  title: 'Custom Alert',
  message: 'This is a custom alert with a custom icon.',
  icon: <span className="text-2xl">🎉</span>,
  confirmText: 'Awesome!',
  onConfirm: () => {
    alertService.success('Thanks for checking out the custom alert!');
  }
});
```

## Alert Types

### Success Alert
- **Color**: Green
- **Icon**: CheckCircle
- **Auto-close**: 3 seconds (configurable)
- **Use case**: Operation completed successfully

### Error Alert
- **Color**: Red
- **Icon**: XCircle
- **Auto-close**: 3 seconds (configurable)
- **Use case**: Something went wrong

### Warning Alert
- **Color**: Yellow
- **Icon**: AlertTriangle
- **Buttons**: OK and Cancel
- **Use case**: Confirmation required for destructive actions

### Info Alert
- **Color**: Blue
- **Icon**: Info
- **Buttons**: OK
- **Use case**: Information that requires acknowledgment

## API Reference

### AlertService Methods

#### `success(message: string, options?: Partial<AlertOptions>): string | null`
Shows a success alert that auto-closes after 3 seconds.

#### `error(message: string, options?: Partial<AlertOptions>): string | null`
Shows an error alert that auto-closes after 3 seconds.

#### `warning(message: string, options?: Partial<AlertOptions>): string | null`
Shows a warning alert with OK and Cancel buttons.

#### `info(message: string, options?: Partial<AlertOptions>): string | null`
Shows an info alert with an OK button.

#### `confirm(message: string, options?: ConfirmOptions): Promise<boolean>`
Shows a confirmation dialog and returns a Promise that resolves to true/false.

#### `custom(options: AlertOptions): string | null`
Shows a custom alert with full control over all options.

#### `hide(id: string): void`
Hides a specific alert by its ID.

#### `clearAll(): void`
Clears all active alerts.

### AlertOptions Interface

```typescript
interface AlertOptions {
  id?: string;
  title?: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number; // in milliseconds, 0 means no auto-close
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void | Promise<void>;
  onClose?: () => void | Promise<void>; // Called when alert is closed/dismissed
  confirmText?: string;
  cancelText?: string;
  icon?: React.ReactNode;
}
```

## Design Guidelines

The alert system follows the existing design patterns:
- **Glass morphism**: Backdrop blur and semi-transparent backgrounds
- **Theme compatibility**: Automatic light/dark theme support
- **Gradient buttons**: Purple-to-pink gradient for primary actions
- **Consistent spacing**: Follows the app's spacing patterns
- **Smooth animations**: fadeIn animation for alert appearance

## Examples

See `src/components/Alert/AlertUsageExample.tsx` for complete usage examples.

## Best Practices

1. **Use appropriate alert types**: Success for confirmations, Error for failures, Warning for destructive actions, Info for general information
2. **Keep messages concise**: Clear, actionable messages work best
3. **Handle async operations**: Use try-catch blocks in confirm/cancel handlers
4. **Provide context**: Use titles to give additional context when needed
5. **Use onClose for post-alert actions**: When you need to perform actions after an alert is dismissed (like refreshing data), use the onClose callback instead of executing immediately
5. **Test different durations**: Default 3 seconds works for most cases, adjust as needed 