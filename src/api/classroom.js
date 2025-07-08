// Classroom endpoints
import { get, post, postFormData } from './utils';

export const ClassroomApi = {
  addSession: (data) => post('/classroom/add-session.php', data),
  addMaterial: (formData) => postFormData('/classroom/add-material.php', formData),
  rateClass: (classId, studentId, rating, comment) => post('/classroom/rate-class.php', { class_id: classId, student_id: studentId, rating, comment }),
  getClassroomDetails: (classroomId) => get(`/classroom/get-classroom-details.php?id=${classroomId}`),
  getClassroomMaterials: (classroomId) => get(`/classroom/get-materials.php?classroom_id=${classroomId}`),
  getClassroomAssignments: (classroomId) => get(`/classroom/get-assignments.php?classroom_id=${classroomId}`),
  getSessionStudents : (sessionId) => get(`/classroom/get-session-students.php?session_id=${sessionId}`),
  trackAttendance : (data) => post('/classroom/track-attendance.php', data),
  getClassroomSessions: (classroomId) => get(`/classroom/get-sessions.php?classroom_id=${classroomId}`),
  getClassroomDiscussions: (classroomId) => get(`/classroom/get-discussions.php?classroom_id=${classroomId}`),
  postClassroomDiscussion: (classroomId, discussionData) => post('/classroom/post-discussion.php', { classroom_id: classroomId, ...discussionData }),
  submitAssignment: (assignmentId, assignmentData) => {
    const formData = new FormData();
    formData.append('assignment_id', assignmentId);
    Object.keys(assignmentData).forEach(key => {
      formData.append(key, assignmentData[key]);
    });
    return postFormData('/classroom/submit-assignment.php', formData);
  },
  createAssignment: (assignmentData) => post('/classroom/create-assignment.php', assignmentData),
  getTeacherAssignments: (classroomId) => get(`/classroom/get-teacher-assignments.php?classroom_id=${classroomId}`),
  getAssignmentSubmissions: (assignmentId) => get(`/classroom/get-assignment-submissions.php?assignment_id=${assignmentId}`),
  gradeAssignment: (submissionId, grade, feedback) => post('/classroom/grade-assignment.php', { submission_id: submissionId, grade, feedback }),
  getStudentClasses: () => get('/classroom/get-student-classes.php'),
  getTeacherClasses: () => get('/classroom/get-teacher-classes.php'),
  addStudentToClassroom: (classroomId, studentId) => post('/classroom/add-student.php', { classroom_id: classroomId, student_id: studentId }),
  removeStudentFromClassroom: (classroomId, studentId) => post('/classroom/remove-student.php', { classroom_id: classroomId, student_id: studentId }),
  getClassroomStudents: (classroomId) => get(`/classroom/get-students.php?classroom_id=${classroomId}`),
  enrollInClassroom: (classroomId) => post('/classroom/enroll.php', { classroom_id: classroomId }),
};
