import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Route, Redirect } from 'react-router-dom';

import { CircularProgress } from '@mui/material';

import { AuthContext } from '../../02_Providers/AuthProvider';

/**
 * Redirects the user to the login page if they try to access protected routes while not logged in
 */
const ProtectedRoute = ({ component: Component, ...rest }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: 50 }}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <Route
      {...rest}
      render={(props) =>
        user ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: '/login',
              state: { from: props.location }
            }}
          />
        )
      }
    />
  );
};

ProtectedRoute.propTypes = {
  component: PropTypes.elementType,
  location: PropTypes.object
};

export default ProtectedRoute;
