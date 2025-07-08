// Analytics and stats endpoints
import { get, post } from './utils';

export const AnalyticsApi = {
  getTeacherDashboardStats: () => get('/analytics/teacher-dashboard-stats.php'),
  getTeacherStats: (batchId = 'all') => get(`/analytics/teacher-stats.php?batch=${batchId}`),
  getStudentDashboardStats: () => get('/analytics/student-dashboard-stats.php'),
  getStudentPerformance: (studentId, timeframe = 'month', batchId = null) => {
    let url = `/analytics/student-performance.php?student_id=${studentId}&timeframe=${timeframe}`;
    if (batchId) url += `&batch_id=${batchId}`;
    return get(url);
  },
  getBatchAttendance: (batchId, startDate = null, endDate = null) => {
    let url = `/analytics/attendance.php?batch_id=${batchId}`;
    if (startDate) url += `&start_date=${startDate}`;
    if (endDate) url += `&end_date=${endDate}`;
    return get(url);
  },
  getQuizResults: (batchId = null, quizId = null) => {
    let url = '/analytics/quiz-results.php?';
    if (batchId) url += `batch_id=${batchId}&`;
    if (quizId) url += `quiz_id=${quizId}`;
    return get(url);
  },
  exportReport: (type, filters = {}) => post('/analytics/export.php', { type, filters }),
  getStudentProgress: (studentId, timeframe = 'month') => get(`/analytics/student-progress.php?student_id=${studentId}&timeframe=${timeframe}`),
  getBatchComparison: (batchIds = []) => post('/analytics/batch-comparison.php', { batch_ids: batchIds }),
  getPlatformStats: (range = 'month') => get(`/analytics/get-stats.php?range=${range}`),
};
