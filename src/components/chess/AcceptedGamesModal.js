
import React, { useCallback, memo } from 'react';
import Modal from '../common/Modal';

// Action Button (memoized)
const ActionButton = memo(function ActionButton({ label, onClick, className, ariaLabel, type = 'button', disabled = false }) {
  return (
    <button
      type={type}
      className={`px-4 py-2 rounded-lg text-sm font-semibold shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all duration-200 ${className} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      onClick={onClick}
      aria-label={ariaLabel || label}
      disabled={disabled}
      tabIndex={0}
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
    <li className="py-4 px-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-background-light dark:bg-background-dark rounded-lg shadow-sm border border-gray-light hover:shadow-md transition-all duration-200" >
      <div className="flex flex-col gap-1 w-full md:w-auto">
        <span className="font-semibold text-primary text-base">Opponent: <span className="text-accent">{game.recipient?.name || game.challenger?.name || 'Unknown'}</span></span>
        <span className="text-sm text-gray-dark">Time Control: <span className="font-medium text-text-dark">{game.time_control}</span></span>
        <span className="text-xs text-gray-dark">Color: <span className="font-semibold text-secondary">{game.color}</span></span>
      </div>
      <div className="flex gap-2 w-full md:w-auto justify-end md:justify-start">
        <ActionButton
          label="Join"
          onClick={handleJoin}
          className="bg-accent text-white hover:bg-secondary focus:ring-accent"
          ariaLabel={`Join game with ${game.recipient?.name || game.challenger?.name || 'Unknown'}`}
        />
        <ActionButton
          label="Resign"
          onClick={handleResign}
          className="bg-highlight text-white hover:bg-red-700 focus:ring-highlight"
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
      <div className="space-y-6">
        <p className="text-lg text-gray-dark mb-2">One or more of your challenges have been <span className="text-success font-semibold">accepted</span>! Would you like to join any of these games?</p>
        <ul className="flex flex-col gap-4" aria-label="Accepted Games">
          {games.length === 0 ? (
            <li className="text-center text-gray-dark py-6">No accepted games available.</li>
          ) : (
            games.map((game) => (
              <GameListItem key={game.gameId} game={game} onJoin={onJoin} onResign={onResign} />
            ))
          )}
        </ul>
      </div>
    </Modal>
  );
});

export default AcceptedGamesModal;
