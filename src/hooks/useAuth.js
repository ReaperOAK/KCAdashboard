import { useState, useContext, createContext } from 'react';
import ApiService from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [token, setToken] = useState(localStorage.getItem('token'));

  const login = async (email, password) => {
    try {
      const response = await ApiService.post('/auth/login.php', { email, password });
      localStorage.setItem('token', response.token);
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
      throw new Error(error.message);
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
