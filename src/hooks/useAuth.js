import { useState, useEffect, useContext, createContext } from 'react';
import ApiService from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Add token check on mount
  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Verify token validity
          await ApiService.get('/auth/verify-token.php');
        } catch (error) {
          // If token is invalid, clear auth data
          console.log('Token validation failed:', error);
          logout();
        }
      }
    };

    checkToken();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await ApiService.post('/auth/login.php', { email, password });
      
      // Store token with expiration
      const tokenData = {
        token: response.token,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
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
  };

  const register = async (userData) => {
    try {
      const response = await ApiService.post('/auth/register.php', userData);
      // Show alert if registration was successful and email verification is required
      if (response && response.message && response.message.toLowerCase().includes('verify your email')) {
        window.alert('Registration successful! Please check your email and verify your account before logging in.');
      }
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const requestPasswordReset = async (email) => {
    try {
      const response = await ApiService.post('/auth/request-reset.php', { email });
      return response;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      const response = await ApiService.post('/auth/reset-password.php', {
        token,
        password: newPassword
      });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to reset password');
    }
  };

  const updateProfile = async (userData) => {
    try {
      const response = await ApiService.put('/auth/update-profile.php', userData);
      setUser(response.user);
      return response;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        token, 
        login, 
        register, 
        logout,
        requestPasswordReset,
        resetPassword,
        updateProfile 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
