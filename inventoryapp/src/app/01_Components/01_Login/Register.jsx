import React, { useContext, useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
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

import { userUrls } from '@urls';
import { post } from '../../axiosClient';

import './styles/Login.css'

const Register = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { showAlert } = useContext(AlertContext);
  const [usernameError, setUsernameError] = useState(false);
  const [usernameErrorMessage, setUsernameErrorMessage] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const [confirmPasswordErrorMessage, setConfirmPasswordErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [content, setContent] = useState({ username: '', password: '', confirmPassword: '' });

  const handleSubmit = async (event) => {
    if (usernameError || passwordError || confirmPasswordError) {
      event.preventDefault();
      return;
    }

    const { username, password } = content;

    event.preventDefault();

    try {
      const response = await post(userUrls.register, { username, password });
      showAlert(response.data, 'success');
      history.push('/login');
    } catch (error) {
      showAlert(error.response.data);
    }
  };

  const validateInputs = () => {
    const { username, password, confirmPassword } = content;
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

    if (!confirmPassword || confirmPassword.localeCompare(password)) {
      setConfirmPasswordError(true);
      setConfirmPasswordErrorMessage('Passwords must match');
      isValid = false;
    } else {
      setConfirmPasswordError(false);
      setConfirmPasswordErrorMessage('');
    }

    return isValid;
  };

  useEffect(() => {
    dispatch(changeLocation('Register'));
  }, []);

  return (
    <Card className='login-container' variant='outlined'>
      <Typography
        className='login-title'
        component='h1'
        variant='h4'
      >
        Register
      </Typography>
      <Box
        className='login-form'
        component='form'
        onSubmit={handleSubmit}
      >
        <FormControl>
          <FormLabel htmlFor='username'>Username</FormLabel>
          <TextField
            autoComplete='username'
            id='username'
            required
            fullWidth
            variant='outlined'
            error={usernameError}
            helperText={usernameErrorMessage}
            color={usernameError ? 'error' : 'primary'}
            onChange={(event) => setContent((prevContent) => ({ ...prevContent, username: event.target.value }))}
          />
        </FormControl>
        <FormControl>
          <FormLabel htmlFor='password'>Password</FormLabel>
          <TextField
            autoComplete='new-password'
            id='password'
            required
            fullWidth
            variant='outlined'
            type={showPassword ? 'text' : 'password'}
            error={passwordError || confirmPasswordError}
            helperText={passwordErrorMessage}
            color={passwordError ? 'error' : 'primary'}
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
            onChange={(event) => setContent((prevContent) => ({ ...prevContent, password: event.target.value }))}
          />
        </FormControl>
        <FormControl>
          <FormLabel htmlFor='confirmPassword'>Confirm Password</FormLabel>
          <TextField
            autoComplete='new-password'
            id='confirmPassword'
            required
            fullWidth
            variant='outlined'
            type={showPassword ? 'text' : 'password'}
            error={confirmPasswordError}
            helperText={confirmPasswordErrorMessage}
            color={confirmPasswordError ? 'error' : 'primary'}
            onChange={(event) => setContent((prevContent) => ({ ...prevContent, confirmPassword: event.target.value }))}
          />
        </FormControl>
        <Button
          type='submit'
          fullWidth
          variant='contained'
          onClick={validateInputs}
        >
          Register
        </Button>
        <Typography align='center'>
          Already have an account? <Link to='/login'>Log In</Link>
        </Typography>
      </Box>
    </Card>
  );
};

export default Register;
