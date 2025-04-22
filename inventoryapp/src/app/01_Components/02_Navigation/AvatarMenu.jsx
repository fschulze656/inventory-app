import React, { useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import {
  Avatar,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem
} from '@mui/material';

import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';

import { AuthContext } from '../../02_Providers/AuthProvider';
import { toggleTheme } from '../../redux/slice/themeSlice';

import { userUrls } from '@urls';
import { post } from '../../axiosClient';

/**
 * Renders a small menu component when clicking the avatar in the navbar
 */
const AvatarMenu = () => {
  const dispatch = useDispatch();
  const { mode } = useSelector((state) => state.theme);
  const [anchor, setAnchor] = useState(null);
  const open = Boolean(anchor);
  const { user, setUser } = useContext(AuthContext);
  const history = useHistory();

  const handleLogout = async () => {
    await post(userUrls.logout);
    setUser(null);
    history.push('/login');
  };

  const handleClose = () => {
    setAnchor(null);
  };

  return (
    <>
      <IconButton
        size='large'
        edge='end'
        color='inherit'
        disableTouchRipple
        onClick={(event) => setAnchor(event.currentTarget)}
      >
        {user ? <Avatar>{user.username.charAt(0).toUpperCase()}</Avatar> : <Avatar><PersonIcon /></Avatar>}
      </IconButton>
      <Menu
        anchorEl={anchor}
        id='account-menu'
        open={open}
        onClose={handleClose}
        onClick={handleClose}
      >
        <MenuItem
          onClick={() => {
            handleClose();
            dispatch(toggleTheme());
          }}
        >
          <ListItemIcon>
            {mode === 'dark' ? <DarkModeIcon /> : <LightModeIcon />}
          </ListItemIcon>
          Toggle Theme
        </MenuItem>
        <Divider />
        {user
          ? <MenuItem
            onClick={() => {
              handleClose();
              handleLogout();
            }}
          >
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            Logout
          </MenuItem>
          : null}
      </Menu>
    </>
  );
};

export default AvatarMenu;
