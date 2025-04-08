import SimulGames from '../pages/chess/SimulGames';
import ChessStudies from '../pages/chess/ChessStudies';
import InteractiveBoard from '../pages/chess/InteractiveBoard';
import GameArea from '../pages/chess/GameArea';

const chessRoutes = [
  {
    path: '/chess/simul',
    element: SimulGames,
    title: 'Simultaneous Games'
  },
  {
    path: '/chess/studies',
    element: ChessStudies,
    title: 'Chess Studies'
  },
  {
    path: '/chess/board',
    element: InteractiveBoard,
    title: 'Interactive Board'
  },
  {
    path: '/chess/games',
    element: GameArea,
    title: 'Game Area'
  }
];

export default chessRoutes;
