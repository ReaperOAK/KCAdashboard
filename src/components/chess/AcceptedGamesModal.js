
import React, { useCallback, memo } from 'react';
import Modal from '../common/Modal';

// Action Button (memoized)
const ActionButton = memo(function ActionButton({ label, onClick, className, ariaLabel, type = 'button' }) {
  return (
    <button
      type={type}
      className={`px-3 py-1 rounded text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors ${className}`}
      onClick={onClick}
      aria-label={ariaLabel || label}
    >
      {label}
    </button>
  );
});

// Game List Item (memoized)
const GameListItem = memo(function GameListItem({ game, onJoin, onResign }) {
  const handleJoin = useCallback(() => onJoin(game.gameId), [onJoin, game.gameId]);
  const handleResign = useCallback(() => {
    if (window.confirm('Are you sure you want to resign and end this game for both players?')) {
      onResign(game.gameId);
    }
  }, [onResign, game.gameId]);

  return (
    <li className="py-3 flex justify-between items-center" >
      <div>
        <div className="font-semibold text-primary">Opponent: {game.recipient?.name || game.challenger?.name || 'Unknown'}</div>
        <div className="text-sm text-gray-dark">Time Control: {game.time_control}</div>
        <div className="text-xs text-gray-dark">Color: {game.color}</div>
      </div>
      <div className="flex gap-2 ml-4">
        <ActionButton
          label="Join"
          onClick={handleJoin}
          className="bg-green-600 text-white hover:bg-green-700"
          ariaLabel={`Join game with ${game.recipient?.name || game.challenger?.name || 'Unknown'}`}
        />
        <ActionButton
          label="Resign"
          onClick={handleResign}
          className="bg-red-600 text-white hover:bg-red-700"
          ariaLabel={`Resign game with ${game.recipient?.name || game.challenger?.name || 'Unknown'}`}
        />
      </div>
    </li>
  );
});

// Main Modal
export const AcceptedGamesModal = memo(function AcceptedGamesModal({ games, onJoin, onResign, onClose }) {
  return (
    <Modal title="Accepted Chess Games" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-gray-dark mb-2">One or more of your challenges have been accepted! Would you like to join any of these games?</p>
        <ul className="divide-y divide-gray-light" aria-label="Accepted Games">
          {games.map((game) => (
            <GameListItem key={game.gameId} game={game} onJoin={onJoin} onResign={onResign} />
          ))}
        </ul>
      </div>
    </Modal>
  );
});

export default AcceptedGamesModal;
