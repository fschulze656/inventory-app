import { configureStore } from '@reduxjs/toolkit';

import deviceReducer from './slice/deviceSlice';
import themeReducer from './slice/themeSlice';

import navigationReducer from '../01_Components/02_Navigation/navSlice';


export default configureStore({
  reducer: {
    device: deviceReducer,
    theme: themeReducer,
    navigation: navigationReducer
  }
});
