// Auth endpoints
import { get, post, put } from './utils';

export const AuthApi = {
  verifyToken: () => get('/auth/verify-token.php'),
  login: (email, password) => post('/auth/login.php', { email, password }),
  register: (userData) => post('/auth/register.php', userData),
  requestPasswordReset: (email) => post('/auth/request-reset.php', { email }),
  resetPassword: (token, newPassword) => post('/auth/reset-password.php', { token, password: newPassword }),
  updateProfile: (userData) => put('/auth/update-profile.php', userData),
  verifyEmail: (token) => get(`/auth/verify-email.php?token=${token}`),
};
