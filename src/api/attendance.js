
// Attendance-related endpoints
import { get, post } from './utils';

export const AttendanceApi = {
  getStudentsAttendance: (batchId = 'all') => get(`/attendance/get-students-attendance.php?batch=${batchId}`),
  getUserAttendance: (userId) => get(`/attendance/get-user-attendance.php?user_id=${userId}`),
  markAttendance: (attendanceRecords) => post('/attendance/mark-attendance.php', { attendance: attendanceRecords }),
  getPendingAttendanceSessions: (teacherId) => get('/attendance/get-pending.php', { params: { teacher_id: teacherId } }),
  getSettings: () => get('/attendance/get-settings.php'),
  updateSettings: (settings) => post('/attendance/update-settings.php', settings),
  getAll: (batchId) => get(`/attendance/get-all.php?batch=${batchId}`),
  exportReport: async ({ format, batch_id, start_date, end_date }) => {
    const queryString = new URLSearchParams({
      format,
      batch_id,
      start_date,
      end_date,
    }).toString();
    const response = await fetch(`/attendance/export.php?${queryString}`, {
      method: 'GET',
      headers: {
        'Accept': format === 'pdf' ? 'application/pdf' : 'text/csv',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });
    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Export failed');
      }
      throw new Error(`Export failed with status: ${response.status}`);
    }
    return await response.blob();
  },
};
