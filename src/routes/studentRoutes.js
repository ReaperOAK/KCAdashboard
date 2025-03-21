import StudentDashboard from '../pages/student/StudentDashboard';
import ClassroomPage from '../pages/student/ClassroomPage';
import ClassroomDetails from '../pages/student/ClassroomDetails';
import ResourceCenter from '../pages/student/ResourceCenter';
import ResourceDetails from '../pages/student/ResourceDetails';
import QuizPage from '../pages/student/QuizPage';
import TournamentsPage from '../pages/student/TournamentsPage';

const studentRoutes = [
  {
    path: '/student-dashboard',
    element: StudentDashboard,
    title: 'Dashboard'
  },
  {
    path: '/student/classes',
    element: ClassroomPage,
    title: 'Classes'
  },
  {
    path: '/student/classes/:id',
    element: ClassroomDetails,
    title: 'Class Details'
  },
  {
    path: '/student/resources',
    element: ResourceCenter,
    title: 'Resources'
  },
  {
    path: '/student/resources/:id',
    element: ResourceDetails,
    title: 'Resource Details'
  },
  {
    path: '/student/quiz',
    element: QuizPage,
    title: 'Quiz'
  },
  {
    path: '/student/tournaments',
    element: TournamentsPage,
    title: 'Tournaments'
  }
];

export default studentRoutes;
