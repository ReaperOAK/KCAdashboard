import ChessStudies from '../pages/chess/ChessStudies';
import InteractiveBoard from '../pages/chess/InteractiveBoard';
import SimulGames from '../pages/chess/SimulGames';
import GameArea from '../pages/chess/GameArea';
import PlayerVsPlayer from '../pages/chess/PlayerVsPlayer';
import ChessHome from '../pages/chess/ChessHome';

const chessRoutes = [
  {
    path: '/chess',
    element: ChessHome,
    name: 'Chess Home',
    hideInMenu: true // Hide this route from navigation menus
  },
  {
    path: '/chess/studies',
    element: ChessStudies,
    name: 'Chess Studies',
    icon: 'book',
    description: 'Create and analyze chess positions, share studies with others'
  },
  {
    path: '/chess/play',
    element: PlayerVsPlayer,
    name: 'Play Chess',
    icon: 'chess-knight',
    description: 'Challenge other players to games'
  },
  {
    path: '/chess/board',
    element: InteractiveBoard,
    name: 'Interactive Board',
    icon: 'chess-board',
    description: 'Practice with an interactive chess board and engine analysis'
  },
  {
    path: '/chess/simuls',
    element: SimulGames,
    name: 'Simultaneous Exhibitions',
    icon: 'users',
    description: 'Play or participate in simultaneous exhibitions'
  },
  {
    path: '/chess/games',
    element: GameArea,
    name: 'Game Area',
    icon: 'trophy',
    description: 'View and manage your games and practice positions'
  },
  // Specific routes for ongoing games and analysis
  {
    path: '/chess/game/:id',
    element: InteractiveBoard,
    name: 'Chess Game',
    hideInMenu: true // Hide this route from navigation menus
  }
];

export default chessRoutes;
