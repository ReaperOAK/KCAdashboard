import AdminDashboard from '../pages/admin/AdminDashboard';
import UserManagement from '../pages/admin/UserManagement';
import BatchManagement from '../pages/admin/BatchManagement';
import AttendanceSystem from '../pages/admin/AttendanceSystem';
import PlatformAnalytics from '../pages/admin/PlatformAnalytics';
import SupportSystem from '../pages/admin/SupportSystem';

const adminRoutes = [
  {
    path: '/admin-dashboard',
    element: AdminDashboard,
    title: 'Dashboard'
  },
  {
    path: '/admin/users',
    element: UserManagement,
    title: 'User Management'
  },
  {
    path: '/admin/batches',
    element: BatchManagement,
    title: 'Batch Management'
  },
  {
    path: '/admin/attendance',
    element: AttendanceSystem,
    title: 'Attendance System'
  },
  {
    path: '/admin/analytics',
    element: PlatformAnalytics,
    title: 'Analytics'
  },
  {
    path: '/admin/support',
    element: SupportSystem,
    title: 'Support'
  }
];

export default adminRoutes;
