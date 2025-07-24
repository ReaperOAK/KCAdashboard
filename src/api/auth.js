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
  
  // Session management
  logout: () => post('/auth/logout.php'),
  getActiveSessions: () => get('/auth/get-active-sessions.php'),
  manageSessions: (action) => post('/auth/manage-sessions.php', { action }),
  
  // Enhanced profile features
  uploadDocument: (formData) => {
    const token = localStorage.getItem('token');
    return fetch('/api/auth/upload-document.php', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    }).then(response => response.json());
  },
  
  fideLookup: (fideId) => get(`/auth/fide-lookup.php?fide_id=${fideId}`),
  
  getProfileDocuments: () => get('/auth/get-documents.php'),
  
  deleteDocument: (documentId) => post('/auth/delete-document.php', { document_id: documentId })
};
