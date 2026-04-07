import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      const payload = action.payload?.data || action.payload;
      state.loading = false;
      state.isAuthenticated = true;
      state.user = payload?.user || null;
      state.token = payload?.token || null;
      state.error = null;
      if (payload?.token) {
        localStorage.setItem('token', payload.token);
      }
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    registerStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    registerSuccess: (state, action) => {
      const payload = action.payload?.data || action.payload;
      state.loading = false;
      state.isAuthenticated = true;
      state.user = payload?.user || null;
      state.token = payload?.token || null;
      state.error = null;
      if (payload?.token) {
        localStorage.setItem('token', payload.token);
      }
    },
    registerFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    getCurrentUserStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    getCurrentUserSuccess: (state, action) => {
      state.loading = false;
      state.user = action.payload?.data || action.payload;
      state.isAuthenticated = true;
    },
    getCurrentUserFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      // If token is invalid, clear auth state
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('token');
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  getCurrentUserStart,
  getCurrentUserSuccess,
  getCurrentUserFailure,
  logout,
  updateUser,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;
