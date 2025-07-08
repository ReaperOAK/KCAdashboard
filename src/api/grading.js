// Grading & feedback endpoints
import { get, post } from './utils';

export const GradingApi = {
  submitFeedback: (feedbackData) => post('/grading/submit-feedback.php', feedbackData),
  getFeedbackHistory: (studentId) => get(`/grading/get-student-feedback-history.php?student_id=${studentId}`),
  getPendingGradingSessions: (teacherId) => get('/grading/get-pending.php', { params: { teacher_id: teacherId } }),
  getStudentReportCards: () => get('/grading/get-student-report-cards.php'),
  uploadReportCard: (studentId, file) => {
    const formData = new FormData();
    formData.append('student_id', studentId);
    formData.append('report_card', file);
    return fetch('/grading/upload-report-card.php', { method: 'POST', body: formData });
  },
};
