
import InteractiveBoard from '../pages/chess/InteractiveBoard';
import GameArea from '../pages/chess/GameArea';
import PlayerVsPlayer from '../pages/chess/PlayerVsPlayer';
import ChessHome from '../pages/chess/ChessHome';
import PGNManagementPage from '../pages/chess/PGNManagementPage';

// Route config for chess module
export const chessRoutes = [
  {
    path: '/chess',
    element: ChessHome,
    name: 'Chess Home',
    hideInMenu: true,
  },
  {
    path: '/chess/play',
    element: PlayerVsPlayer,
    name: 'Play Chess',
    icon: 'chess-knight',
    description: 'Challenge other players to games',
  },
  {
    path: '/chess/board',
    element: InteractiveBoard,
    name: 'Interactive Board',
    icon: 'chess-board',
    description: 'Practice with an interactive chess board and engine analysis',
  },
  {
    path: '/chess/games',
    element: GameArea,
    name: 'Game Area',
    icon: 'trophy',
    description: 'View and manage your games and practice positions',
  },
  {
    path: '/chess/pgn-management',
    element: PGNManagementPage,
    name: 'PGN Management',
    icon: 'folder',
    description: 'Upload, manage and organize your PGN files',
  },
  // Specific routes for ongoing games and analysis
  {
    path: '/chess/game/:id',
    element: InteractiveBoard,
    name: 'Chess Game',
    hideInMenu: true,
  },
];

export default chessRoutes;
