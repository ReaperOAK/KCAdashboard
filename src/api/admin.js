// Admin dashboard and batch endpoints
import { get } from './utils';

export const AdminApi = {
  getDashboardStats: () => get('/admin/dashboard-stats.php'),
  getBatchStats: () => get('/admin/batch-stats.php'),
  getAttendanceOverview: () => get('/admin/attendance-overview.php'),
};
