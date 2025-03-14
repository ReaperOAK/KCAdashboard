import StudentDashboard from '../pages/student/StudentDashboard';
import ClassroomPage from '../pages/student/ClassroomPage';
import ClassroomDetails from '../pages/student/ClassroomDetails';
import ResourceCenter from '../pages/student/ResourceCenter';
import QuizPage from '../pages/student/QuizPage';
import TournamentsPage from '../pages/student/TournamentsPage';
import SimulGamesPage from '../pages/student/SimulGamesPage';
import StudiesPage from '../pages/student/StudiesPage';
import InteractiveBoardPage from '../pages/student/InteractiveBoardPage';
import GamesPage from '../pages/student/GamesPage';

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
    path: '/student/quiz',
    element: QuizPage,
    title: 'Quiz'
  },
  {
    path: '/student/tournaments',
    element: TournamentsPage,
    title: 'Tournaments'
  },
  // New routes for additional student features
  {
    path: '/student/simul',
    element: SimulGamesPage,
    title: 'Simul Games'
  },
  {
    path: '/student/studies',
    element: StudiesPage,
    title: 'Chess Studies'
  },
  {
    path: '/student/board',
    element: InteractiveBoardPage,
    title: 'Interactive Board'
  },
  {
    path: '/student/games',
    element: GamesPage,
    title: 'Game Area'
  }
];

export default studentRoutes;
