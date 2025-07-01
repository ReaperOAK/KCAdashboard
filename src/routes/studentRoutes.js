// Student dashboard route components (all are page-level, no logic here)
import StudentDashboard from '../pages/student/StudentDashboard';
import ClassroomPage from '../pages/student/ClassroomPage';
import ClassroomDetails from '../pages/student/ClassroomDetails';
import ResourceCenter from '../pages/student/ResourceCenter';
import ResourceDetails from '../pages/student/ResourceDetails';
import QuizPage from '../pages/student/QuizPage';
import QuizDetailPage from '../pages/student/QuizDetailPage';
import QuizResultsPage from '../pages/student/QuizResultsPage';
import QuizHistoryPage from '../pages/student/QuizHistoryPage';
import LeaderboardPage from '../pages/student/LeaderboardPage';
import TournamentsPage from '../pages/student/TournamentsPage';
import ReportCard from '../pages/student/ReportCard';
import FeedbackHistory from '../pages/student/FeedbackHistory';

// Route config for student dashboard
// Each route: { path, element, title }
export const studentRoutes = [
  {
    path: '/student-dashboard',
    element: StudentDashboard,
    title: 'Dashboard',
  },
  {
    path: '/student/classes',
    element: ClassroomPage,
    title: 'Classes',
  },
  {
    path: '/student/classes/:id',
    element: ClassroomDetails,
    title: 'Class Details',
  },
  {
    path: '/student/resources',
    element: ResourceCenter,
    title: 'Resources',
  },
  {
    path: '/student/resources/:id',
    element: ResourceDetails,
    title: 'Resource Details',
  },
  {
    path: '/student/quiz',
    element: QuizPage,
    title: 'Quizzes',
  },
  {
    path: '/student/quiz/:id',
    element: QuizDetailPage,
    title: 'Take Quiz',
  },
  {
    path: '/student/quiz-results/:id',
    element: QuizResultsPage,
    title: 'Quiz Results',
  },
  {
    path: '/student/quiz-history',
    element: QuizHistoryPage,
    title: 'Quiz History',
  },
  {
    path: '/student/leaderboard',
    element: LeaderboardPage,
    title: 'Leaderboard',
  },
  {
    path: '/student/tournaments',
    element: TournamentsPage,
    title: 'Tournaments',
  },
  {
    path: '/student/report-card',
    element: ReportCard,
    title: 'Report Cards',
  },
  {
    path: '/student/feedback-history',
    element: FeedbackHistory,
    title: 'Feedback & Grading',
  },
];
