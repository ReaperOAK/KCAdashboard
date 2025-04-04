import TeacherDashboard from '../pages/teacher/TeacherDashboard';
import BatchManagement from '../pages/teacher/BatchManagement';
import BatchDetail from '../pages/teacher/BatchDetail';
import ReportsAnalytics from '../pages/teacher/ReportsAnalytics';
import GradingFeedback from '../pages/teacher/GradingFeedback';
import PGNDatabase from '../pages/teacher/PGNDatabase';
import ClassroomManagement from '../pages/teacher/ClassroomManagement';
import ClassroomDetail from '../pages/teacher/ClassroomDetail';
import QuizManagement from '../pages/teacher/QuizManagement';
import QuizCreator from '../pages/teacher/QuizCreator';

const teacherRoutes = [
  {
    path: '/teacher-dashboard',
    element: TeacherDashboard,
    title: 'Dashboard'
  },
  {
    path: '/teacher/batches',
    element: BatchManagement,
    title: 'Batch Management'
  },
  {
    path: '/teacher/batches/:id',
    element: BatchDetail,
    title: 'Batch Details'
  },
  {
    path: '/teacher/analytics',
    element: ReportsAnalytics,
    title: 'Analytics'
  },
  {
    path: '/teacher/grading',
    element: GradingFeedback,
    title: 'Grading'
  },
  {
    path: '/teacher/pgn',
    element: PGNDatabase,
    title: 'PGN Database'
  },
  {
    path: '/teacher/classroom',
    element: ClassroomManagement,
    title: 'Classroom'
  },
  {
    path: '/teacher/classroom/:id',
    element: ClassroomDetail,
    title: 'Classroom Details'
  },
  // New quiz routes
  {
    path: '/teacher/quizzes',
    element: QuizManagement,
    title: 'Quiz Management'
  },
  {
    path: '/teacher/quiz/create',
    element: QuizCreator,
    title: 'Create Quiz'
  },
  {
    path: '/teacher/quiz/edit/:id',
    element: QuizCreator,
    title: 'Edit Quiz'
  }
];

export default teacherRoutes;
