
// src/api/notifications.js
// API module for notification preferences
import { get, post } from './utils';

export const NotificationsApi = {
  getNotifications: () => get('/notifications/get.php'),
  markAsRead: (id) => post('/notifications/mark-read.php', { id }),
  markAllAsRead: () => post('/notifications/mark-all-read.php'),
  deleteNotification: (id) => post('/notifications/delete.php', { id }),
  getPreferences: () => get('/notifications/get-preferences.php'),
  updatePreferences: (preferences) => post('/notifications/update-preferences.php', { preferences }),
};
