import React from 'react';
import { useAlert } from '../../context/AlertContext';
import AlertModal from './AlertModal';

const AlertContainer: React.FC = () => {
  const { alerts } = useAlert();

  return (
    <>
      {alerts.map((alert) => (
        <AlertModal key={alert.id} alert={alert} />
      ))}
    </>
  );
};

export default AlertContainer; 