import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import MenuIcon from '@mui/icons-material/Menu';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';

import { changeLocation } from './navSlice';
import AvatarMenu from './AvatarMenu';

/**
 * Navbar with a navigation drawer that opens when clicking the menu icon on the left side
 */
const Navigation = ({ contextList }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { location } = useSelector((state) => state.navigation);
  const { isMobile } = useSelector((state) => state.device);
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar>
          <Toolbar>
            <IconButton
              size='large'
              edge='start'
              color='inherit'
              aria-label='menu'
              disableRipple
              onClick={() => setOpen(!open)}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant='h6'
              component='div'
              sx={{
                flexGrow: 1,
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis'
              }}
            >
              {location}
            </Typography>
            <Link to='/createItem'>
              <Button
                variant='contained'
                disableElevation
                startIcon={<AddIcon />}
                sx={{ margin: '5px' }}
              >
                {isMobile ? 'Item' : 'Add Item'}
              </Button>
            </Link>
            {isMobile
              ? <Link to={'/scan'}>
                <IconButton size='large'>
                  <QrCodeScannerIcon fontSize='inherit' />
                </IconButton>
              </Link> : null}
            <AvatarMenu />
          </Toolbar>
        </AppBar>
        <Toolbar />
      </Box>
      <Drawer open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 250 }} role='presentation' onClick={() => setOpen(false)}>
          <List>
            {contextList.map((context) => (
              <ListItem key={context.text} disablePadding>
                <ListItemButton onClick={() => {
                  history.push(context.link);
                  dispatch(changeLocation(context.text));
                }}>
                  <ListItemIcon>{context.icon}</ListItemIcon>
                  <ListItemText primary={context.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </div>
  );
};

Navigation.propTypes = {
  contextList: PropTypes.array
}

export default Navigation;
