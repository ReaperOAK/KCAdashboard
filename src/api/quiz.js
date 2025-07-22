// Quiz endpoints
import { get, post, del, put, postFormData } from './utils';

export const QuizApi = {
  // Teacher/creation endpoints
  create: (data) => post('/quiz/create.php', data),
  update: (id, data) => put(`/quiz/update.php?id=${id}`, data),
  reorderQuestions: (quizId, questions) => put(`/quiz/reorder-questions.php?id=${quizId}`, { questions }),
  saveDraft: (data) => post('/quiz/save-draft.php', data),
  uploadQuestionImage: (formData) => postFormData('/quiz/upload-question-image.php', formData),
  getLatestResult: (quizId) => get(`/quiz/get-latest-result.php?quiz_id=${quizId}`),
  getAll: (difficulty = null) => difficulty ? get(`/quiz/get-all.php?difficulty=${difficulty}`) : get('/quiz/get-all.php'),
  getByDifficulty: (difficulty) => get(`/quiz/get-by-difficulty.php?difficulty=${difficulty}`),
  getTeacherQuizzes: (difficulty = null) => difficulty ? get(`/quiz/get-teacher-quizzes.php?difficulty=${difficulty}`) : get('/quiz/get-teacher-quizzes.php'),
  getById: (id) => get(`/quiz/get-by-id.php?id=${id}`),
  getOverallLeaderboard: () => get('/quiz/get-overall-leaderboard.php'),
  getQuizLeaderboard: (quizId) => get(`/quiz/get-leaderboard.php?quiz_id=${quizId}`),
  submitQuiz: (data) => post('/quiz/submit-quiz.php', data),
  getUserHistory: (filter = 'all') => get(`/quiz/get-user-history.php?filter=${filter}`),
  deleteQuiz: (id) => del(`/quiz/delete.php?id=${id}`),
  publish: (id) => post('/quiz/publish.php', { id }),
};
