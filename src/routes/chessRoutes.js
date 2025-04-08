import SimulGames from '../pages/chess/SimulGames';
import ChessStudies from '../pages/chess/ChessStudies';
import InteractiveBoard from '../pages/chess/InteractiveBoard';
import GameArea from '../pages/chess/GameArea';

const chessRoutes = [
  {
    path: '/chess/simul',
    element: SimulGames,
    title: 'Simul Games',
    roles: ['student', 'teacher', 'admin']
  },
  {
    path: '/chess/studies',
    element: ChessStudies,
    title: 'Chess Studies',
    roles: ['student', 'teacher', 'admin']
  },
  {
    path: '/chess/board',
    element: InteractiveBoard,
    title: 'Interactive Board',
    roles: ['student', 'teacher', 'admin']
  },
  {
    path: '/chess/games',
    element: GameArea,
    title: 'Game Area',
    roles: ['student', 'teacher', 'admin']
  }
];

export default chessRoutes;
