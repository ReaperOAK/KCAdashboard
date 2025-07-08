// Admin dashboard and batch endpoints
import { get } from './utils';

export const AdminApi = {
  getDashboardStats: async () => {
    const response = await get('/admin/dashboard-stats.php');
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch dashboard stats');
    }
    return response;
  },
  getBatchStats: () => get('/admin/batch-stats.php'),
  getAttendanceOverview: () => get('/admin/attendance-overview.php'),
};
