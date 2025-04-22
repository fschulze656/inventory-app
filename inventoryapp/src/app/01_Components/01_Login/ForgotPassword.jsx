import React from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  OutlinedInput
} from '@mui/material';

/**
 * Unused currently
 *
 * Opens a dialog to let the user reset their password in case they forgor
 */
const ForgotPassword = ({ open, handleClose }) => {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        component: 'form',
        onSubmit: (event) => {
          event.preventDefault();
          handleClose();
        },
        sx: { backgroundImage: 'none' }
      }}
    >
      <DialogTitle>Reset password</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
        <OutlinedInput
          autoFocus
          required
          margin='dense'
          placeholder='Email address'
          type='email'
          fullWidth
        />
      </DialogContent>
      <DialogActions sx={{ pb: 3, px: 3 }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant='contained' type='submit'>
          Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
};

ForgotPassword.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
};

export default ForgotPassword;
