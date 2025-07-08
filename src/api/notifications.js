
// src/api/notifications.js
// API module for notification preferences
import { get, post } from './utils';

export const NotificationsApi = {
  async getNotifications() {
    return get('/notifications/get.php');
  },
  async markAsRead(id) {
    return post('/notifications/mark-read.php', { id });
  },
  async markAllAsRead() {
    return post('/notifications/mark-all-read.php');
  },
  async deleteNotification(id) {
    return post('/notifications/delete.php', { id });
  },
  async getPreferences() {
    const response = await get('/notifications/get-preferences.php');
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch notification preferences');
    }
    return response;
  },
  async updatePreferences(preferences) {
    const response = await post('/notifications/update-preferences.php', { preferences });
    if (!response.success) {
      throw new Error(response.message || 'Failed to update notification preferences');
    }
    return response;
  }
};
