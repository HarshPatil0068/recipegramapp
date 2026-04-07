import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { 
  loginStart, 
  loginSuccess, 
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  getCurrentUserStart,
  getCurrentUserSuccess,
  getCurrentUserFailure,
  logout as logoutAction
} from '../store/slices/authSlice';
import { authService, userService } from '../services';

export const useAuth = () => {
  const dispatch = useDispatch();

  const login = useCallback(async (credentials) => {
    try {
      dispatch(loginStart());
      const response = await authService.login(credentials);
      dispatch(loginSuccess(response));
      return { success: true };
    } catch (error) {
      dispatch(loginFailure(error.message));
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  const register = useCallback(async (userData) => {
    try {
      dispatch(registerStart());
      const response = await authService.register(userData);
      dispatch(registerSuccess(response));
      return { success: true };
    } catch (error) {
      dispatch(registerFailure(error.message));
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  const getCurrentUser = useCallback(async () => {
    try {
      dispatch(getCurrentUserStart());
      const response = await userService.getCurrentUser();
      dispatch(getCurrentUserSuccess(response));
      return { success: true };
    } catch (error) {
      dispatch(getCurrentUserFailure(error.message));
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  const logout = useCallback(() => {
    authService.logout();
    dispatch(logoutAction());
  }, [dispatch]);

  return { login, register, getCurrentUser, logout };
};
