import AdminDashboard from '../pages/admin/AdminDashboard';
import UserManagement from '../pages/admin/UserManagement';
import UserActivityPage from '../pages/admin/UserActivityPage';
import UserActivity from '../pages/admin/UserActivity';
import BatchManagement from '../pages/admin/BatchManagement';
import AttendanceSystem from '../pages/admin/AttendanceSystem';
import AttendanceSettings from '../pages/admin/AttendanceSettings';
import StudentAttendanceHistory from '../pages/admin/StudentAttendanceHistory';
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
    path: '/admin/users/activity',
    element: UserActivityPage,
    title: 'Activity Logs'
  },
  {
    path: '/admin/users/activity/:userId',
    element: UserActivity,
    title: 'User Activity'
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
    path: '/admin/attendance-settings',
    element: AttendanceSettings,
    title: 'Attendance Settings'
  },
  {
    path: '/admin/student/:studentId/attendance',
    element: StudentAttendanceHistory,
    title: 'Student Attendance'
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
