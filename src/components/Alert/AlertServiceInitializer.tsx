import { useEffect } from 'react';
import { useAlert } from '../../context/AlertContext';
import { initializeAlertService } from '../../services/alertService';

const AlertServiceInitializer: React.FC = () => {
  const alertContext = useAlert();

  useEffect(() => {
    // Initialize the alert service with the context
    initializeAlertService(alertContext);
  }, [alertContext]);

  return null; // This component doesn't render anything
};

export default AlertServiceInitializer; 