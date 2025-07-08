// User-related endpoints
import { get, post } from './utils';

export const UsersApi = {
  getTeachers: () => get('/users/get-teachers.php'),
  getDetails: (id) => get(`/users/get-details.php?id=${id}`),
  getActivityLog: (user_id) => get(`/users/activity-log.php?user_id=${user_id}`),
  getActivityLogs: ({ page = 1, limit = 20, filter = 'all' } = {}) =>
    get(`/users/activity-log.php?page=${page}&limit=${limit}&filter=${filter}`),
  getAll: (filter = 'all', search = '') => get(`/users/get-all.php?filter=${filter}&search=${search}`),
  updateStatus: (user_id, status) => post('/users/update-status.php', { user_id, status }),
  updateRole: (user_id, role, current_user_id) => post('/users/update-role.php', { user_id, role, current_user_id }),
  update: (user) => post('/users/update.php', user),
  bulkUpdateStatus: (user_ids, status) => post('/users/bulk-update-status.php', { user_ids, status }),
  bulkDelete: (user_ids) => post('/users/bulk-delete.php', { user_ids }),
  updatePermissions: (user_id, permissions) => post('/users/update-permissions.php', { user_id, permissions }),
  delete: (user_id, current_user_id) => post('/users/delete.php', { user_id, current_user_id }),

  // Added: Get shareable users for classroom/PGN sharing
  getShareableUsers: () => get('/users/get-shareable-users.php'),
};
