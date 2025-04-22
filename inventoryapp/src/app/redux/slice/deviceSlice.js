import { createSlice } from '@reduxjs/toolkit';

const deviceSlice = createSlice({
  name: 'device',
  initialState: { isMobile: false },
  reducers: {
    setDeviceType: (state, action) => {
      state.isMobile = action.payload;
    }
  }
});

export const { setDeviceType } = deviceSlice.actions;
export default deviceSlice.reducer;
