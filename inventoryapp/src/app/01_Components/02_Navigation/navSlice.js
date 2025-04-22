import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  location: ''
}

const navSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    changeLocation: (state, action) => {
      state.location = action.payload;
    }
  }
});

export const { changeLocation } = navSlice.actions;
export default navSlice.reducer;
