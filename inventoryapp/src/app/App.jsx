import React, { useEffect } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import {
  createTheme,
  Box,
  CssBaseline,
  ThemeProvider
} from '@mui/material';

import AccountTreeIcon from '@mui/icons-material/AccountTree';
import CategoryIcon from '@mui/icons-material/Category';
import WarehouseIcon from '@mui/icons-material/Warehouse';

import { QueryParamProvider } from 'use-query-params';
import { ReactRouter5Adapter } from 'use-query-params/adapters/react-router-5';

import { ProtectedRoute, QRScanner } from './01_Components/00_UniversalComponents';
import { Login, Register } from './01_Components/01_Login';
import Navigation from './01_Components/02_Navigation/Navigation';
import { Items, ItemCreator, ItemDetail, ItemOverview } from './01_Components/04_Item';
import { Projects, ProjectCreator, ProjectDetail } from './01_Components/05_Project';
import { Categories, CategoryCreator } from './01_Components/06_Category';

import { setDeviceType } from './redux/slice/deviceSlice.js';

const detectMobileDevie = {
  Android: () => {
    return navigator.userAgent.match(/Android/i);
  },
  BlackBerry: () => {
    return navigator.userAgent.match(/BlackBerry/i);
  },
  iOS: () => {
    return navigator.userAgent.match(/iPhone|iPad|iPod/i);
  },
  Opera: () => {
    return navigator.userAgent.match(/Opera Mini/i);
  },
  Windows: () => {
    return navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i);
  },
  any: () => {
    return (detectMobileDevie.Android()
      || detectMobileDevie.BlackBerry()
      || detectMobileDevie.iOS()
      || detectMobileDevie.Opera()
      || detectMobileDevie.Windows());
  }
};

const contextList = [
  { text: 'Items', link: '/items', icon: <WarehouseIcon /> },
  { text: 'Projects', link: '/projects', icon: <AccountTreeIcon /> },
  { text: 'Categories', link: '/categories', icon: <CategoryIcon /> }
];

const App = () => {
  const dispatch = useDispatch();
  const { mode } = useSelector((state) => state.theme);

  const theme = createTheme({
    palette: {
      mode
    }
  });

  useEffect(() => {
    const isMobile = detectMobileDevie.any();
    dispatch(setDeviceType(isMobile));

    const handleResize = () => {
      dispatch(setDeviceType(detectMobileDevie.any()));
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [dispatch]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <QueryParamProvider adapter={ReactRouter5Adapter}>
          <Navigation contextList={contextList} />
          <Box>
            <Switch>
              <Route
                exact
                path='/login'
                component={Login}
              />
              <Route
                exact
                path='/register'
                component={Register}
              />
              <ProtectedRoute
                exact
                path='/'
                component={Items}
              />
              <ProtectedRoute
                exact
                path='/projects'
                component={Projects}
              />
              <ProtectedRoute
                exact
                path='/projectDetail'
                component={ProjectDetail}
              />
              <ProtectedRoute
                exact
                path='/createProject'
                component={ProjectCreator}
              />
              <ProtectedRoute
                exact
                path='/categories'
                component={Categories}
              />
              <ProtectedRoute
                exact
                path='/createCategory'
                component={CategoryCreator}
              />
              <ProtectedRoute
                exact
                path='/items'
                component={Items}
              />
              <ProtectedRoute
                exact
                path='/itemOverview'
                component={ItemOverview}
              />
              <ProtectedRoute
                exact
                path='/itemDetail'
                component={ItemDetail}
              />
              <ProtectedRoute
                exact
                path='/createItem'
                component={ItemCreator}
              />
              <ProtectedRoute
                exact
                path='/scan'
                component={QRScanner}
              />
            </Switch>
          </Box>
        </QueryParamProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
