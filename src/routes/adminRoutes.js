export const adminRoutes = [
  {
    path: '/admin-dashboard',
    element: require('../pages/admin/AdminDashboard').default,
    title: 'Dashboard',
  },
  {
    path: '/admin/users',
    element: require('../pages/admin/UserManagement').default,
    title: 'User Management',
  },
  {
    path: '/admin/users/activity',
    element: require('../pages/admin/UserActivityPage').default,
    title: 'Activity Logs',
  },
  {
    path: '/admin/users/activity/:userId',
    element: require('../pages/admin/UserActivity').default,
    title: 'User Activity',
  },
  {
    path: '/admin/batches',
    element: require('../pages/admin/BatchManagement').default,
    title: 'Batch Management',
  },
  {
    path: '/admin/attendance',
    element: require('../pages/admin/AttendanceSystem').default,
    title: 'Attendance System',
  },
  {
    path: '/admin/attendance-settings',
    element: require('../pages/admin/AttendanceSettings').default,
    title: 'Attendance Settings',
  },
  {
    path: '/admin/students/attendance',
    element: require('../pages/admin/StudentAttendanceList').default,
    title: 'Student Attendance List',
  },
  {
    path: '/admin/student/:studentId/attendance',
    element: require('../pages/admin/StudentAttendanceHistory').default,
    title: 'Student Attendance History',
  },
  {
    path: '/admin/analytics',
    element: require('../pages/admin/PlatformAnalytics').default,
    title: 'Analytics',
  },
  {
    path: '/admin/support',
    element: require('../pages/admin/SupportSystem').default,
    title: 'Support',
  },
  {
    path: '/admin/tournaments',
    element: require('../pages/admin/TournamentManagement').default,
    title: 'Tournament Management',
  },
  {
    path: '/admin/tournaments/:id/registrations',
    element: require('../pages/admin/TournamentRegistrations').default,
    title: 'Tournament Registrations',
  },
  {
    path: '/admin/quizzes',
    element: require('../pages/admin/QuizManagement').default,
    title: 'Quiz Management',
  },
];
