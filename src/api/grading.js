// Grading & feedback endpoints
import { get, post, API_URL } from './utils';

export const GradingApi = {
  submitFeedback: (feedbackData) => post('/grading/submit-feedback.php', feedbackData),
  getFeedbackHistory: (studentId) => get(`/grading/get-student-feedback-history.php?student_id=${studentId}`),
  getPendingGradingSessions: (teacherId) => get('/grading/get-pending.php', { params: { teacher_id: teacherId } }),
  getAllStudents: () => get('/grading/get-all-students.php'),
  getStudentReportCards: () => get('/grading/get-student-report-cards.php'),
  uploadReportCard: async (studentId, file) => {
    const formData = new FormData();
    formData.append('student_id', studentId);
    formData.append('report_card', file);
    
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/grading/upload-report-card.php`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      credentials: 'include',
      mode: 'cors',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }
    return response.json();
  },
};
