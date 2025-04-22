import React, { useContext, useEffect, useState } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import {
  Box,
  Button,
  Card,
  FormControl,
  FormLabel,
  IconButton,
  InputAdornment,
  TextField,
  Typography
} from '@mui/material';

import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

import { changeLocation } from '../02_Navigation/navSlice';
import { AlertContext } from '../../02_Providers/AlertProvider';
import { AuthContext } from '../../02_Providers/AuthProvider';

import { userUrls } from '@urls';
import { get, post } from '../../axiosClient';

import './styles/Login.css'

const Login = () => {
  const dispatch = useDispatch();
  const [usernameError, setUsernameError] = useState(false);
  const [usernameErrorMessage, setUsernameErrorMessage] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const [content, setContent] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const { setUser } = useContext(AuthContext);
  const { showAlert } = useContext(AlertContext);
  const history = useHistory();
  const location = useLocation();

  const { from } = location.state || { from: { pathname: '/items' } };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (usernameError || passwordError) return;

    try {
      await post(userUrls.login, content);
    } catch (error) {
      return showAlert(error.response.data);
    }

    const { data } = await get(userUrls.verify);
    setUser(data.user);
    history.replace(from);
  };

  const validateInputs = () => {
    const { username, password } = content;
    let isValid = true;

    if (!username) {
      setUsernameError(true);
      setUsernameErrorMessage('Please enter a username');
      isValid = false;
    } else {
      setUsernameError(false);
      setUsernameErrorMessage('');
    }

    if (!password || password.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage('Password must be at least 6 characters long.');
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    return isValid;
  };

  useEffect(() => {
    dispatch(changeLocation('Login'));
  }, []);

  return (
    <Card className='login-container' variant='outlined'>
      <Typography
        className='login-title'
        component='h1'
        variant='h4'
      >
        Login
      </Typography>
      <Box
        className='login-form'
        component='form'
        onSubmit={handleSubmit}
        noValidate
      >
        <FormControl>
          <FormLabel htmlFor='username'>Username</FormLabel>
          <TextField
            error={usernameError}
            helperText={usernameErrorMessage}
            type='text'
            id='username'
            autoComplete='username'
            autoFocus
            required
            fullWidth
            variant='outlined'
            color={usernameError ? 'error' : 'primary'}
            onChange={(event) => setContent((prevContent) => ({ ...prevContent, username: event.target.value }))}
          />
        </FormControl>
        <FormControl>
          <FormLabel htmlFor='password'>Password</FormLabel>
          <TextField
            error={passwordError}
            helperText={passwordErrorMessage}
            type={showPassword ? 'text' : 'password'}
            id='password'
            autoComplete='current-password'
            required
            fullWidth
            variant='outlined'
            color={passwordError ? 'error' : 'primary'}
            onChange={(event) => setContent((prevContent) => ({ ...prevContent, password: event.target.value }))}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      edge='end'
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                )
              }
            }}
          />
        </FormControl>
        <Button
          type='submit'
          fullWidth
          variant='contained'
          onClick={validateInputs}
        >
          Log In
        </Button>
        <Typography align='center'>
          Don&apos;t have an account? <Link to='/register'>Register</Link>
        </Typography>
      </Box>
    </Card>
  );
};

export default Login;
