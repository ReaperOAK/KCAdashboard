
import { useState, useEffect, useContext, createContext, useCallback, useMemo } from 'react';
import { AuthApi } from '../api/auth';

const AuthContext = createContext(null);

function useProvideAuth() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  // Token check on mount
  useEffect(() => {
    async function checkToken() {
      const token = localStorage.getItem('token');
      if (token) {
        try {
      await AuthApi.verifyToken();
        } catch (error) {
          // If token is invalid, clear auth data
          // eslint-disable-next-line no-console
          
          logout();
        }
      }
    }
    checkToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const response = await AuthApi.login(email, password);
      const tokenData = {
        token: response.token,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };
      localStorage.setItem('token', response.token);
      localStorage.setItem('tokenData', JSON.stringify(tokenData));
      localStorage.setItem('user', JSON.stringify(response.user));
      setToken(response.token);
      setUser(response.user);
      return response.user;
    } catch (error) {
      throw new Error(error.message);
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      const response = await AuthApi.register(userData);
      if (response && response.message && response.message.toLowerCase().includes('verify your email')) {
        window.alert('Registration successful! Please check your email and verify your account before logging in.');
      }
      return response;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Registration error:', error);
      throw new Error(error.message || 'Registration failed');
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Try to logout from server (invalidate token)
      await AuthApi.logout();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Server logout failed, proceeding with local logout:', error);
    } finally {
      // Always clear local storage regardless of server response
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
    }
  }, []);

  const requestPasswordReset = useCallback(async (email) => {
    try {
      const response = await AuthApi.requestPasswordReset(email);
      return response;
    } catch (error) {
      throw new Error(error.message);
    }
  }, []);

  const resetPassword = useCallback(async (token, newPassword) => {
    try {
      const response = await AuthApi.resetPassword(token, newPassword);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to reset password');
    }
  }, []);

  const updateProfile = useCallback(async (userData) => {
    try {
      const response = await AuthApi.updateProfile(userData);
      setUser(response.user);
      return response;
    } catch (error) {
      throw new Error(error.message);
    }
  }, []);

  return useMemo(() => ({
    user,
    token,
    login,
    register,
    logout,
    requestPasswordReset,
    resetPassword,
    updateProfile,
  }), [user, token, login, register, logout, requestPasswordReset, resetPassword, updateProfile]);
}

export function AuthProvider({ children }) {
  const auth = useProvideAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
