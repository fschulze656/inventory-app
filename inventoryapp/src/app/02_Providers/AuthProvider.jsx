import React, { createContext, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { AlertContext } from './AlertProvider';

import { userUrls } from '@urls';
import { get, post } from '../axiosClient';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const { showAlert } = useContext(AlertContext);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await get(userUrls.verify);
        setUser(data.user);
      } catch (err) {
        showAlert(err);
        try {
          await post(userUrls.refreshToken);
          const { data } = await get(userUrls.verify);
          setUser(data.user);
        } catch (error) {
          setUser(null);
          showAlert(error);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node,
};

export default AuthProvider;
