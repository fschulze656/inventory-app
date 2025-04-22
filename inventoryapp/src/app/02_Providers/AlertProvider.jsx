import React, { createContext, useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { Alert, Snackbar } from '@mui/material';


export const AlertContext = createContext();

const AlertProvider = ({ children }) => {
  const [alertQueue, setAlertQueue] = useState([]);
  const [currentAlert, setCurrentAlert] = useState(null);

  const showAlert = useCallback((message, severity = 'error', duration = 5000) => {
    setAlertQueue((prev) => [...prev, { message, severity, duration }]);
  }, []);

  const dismissAlert = useCallback(() => {
    setCurrentAlert(null);
  }, []);

  useEffect(() => {
    if (!currentAlert && alertQueue.length > 0) {
      const [nextAlert, ...remainingAlerts] = alertQueue;
      setCurrentAlert(nextAlert);
      setAlertQueue(remainingAlerts);
    }
  }, [currentAlert, alertQueue]);

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <Snackbar
        open={Boolean(currentAlert)}
        autoHideDuration={currentAlert?.duration || 5000}
        onClose={dismissAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {currentAlert && (
          <Alert
            onClose={dismissAlert}
            severity={currentAlert.severity}
            variant='filled'
          >
            {currentAlert.message}
          </Alert>
        )}
      </Snackbar>
    </AlertContext.Provider>
  );
};

AlertProvider.propTypes = {
  children: PropTypes.node,
}

export default AlertProvider;
