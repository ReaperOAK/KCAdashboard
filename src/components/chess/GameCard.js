import React from 'react';

// Optional: pass icon as prop for game status/result
const statusConfig = {
  active: {
    label: 'Active',
    className: 'bg-success/10 text-success',
    icon: <span aria-hidden="true" className="inline-block text-success text-base mr-1">●</span>,
  },
  completed: {
    label: 'Completed',
    className: 'bg-gray-light text-gray-dark',
    icon: <span aria-hidden="true" className="inline-block text-gray-dark text-base mr-1">✔</span>,
  },
  abandoned: {
    label: 'Expired',
    className: 'bg-warning/10 text-warning',
    icon: <span aria-hidden="true" className="inline-block text-warning text-base mr-1">⏰</span>,
  },
  default: {
    label: 'Other',
    className: 'bg-accent/10 text-accent',
    icon: <span aria-hidden="true" className="inline-block text-accent text-base mr-1">★</span>,
  },
};

const GameCard = React.memo(({ game, onSelect, formatDate }) => {
  const status = statusConfig[game.status] || statusConfig.default;
  return (
    <button
      type="button"
      className="bg-background-light dark:bg-background-dark border border-gray-light shadow-md rounded-xl overflow-hidden transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent text-left w-full"
      onClick={() => onSelect(game)}
      aria-label={`View game between ${game.white_player.name} and ${game.black_player.name}`}
      tabIndex={0}
    >
      <div className="h-36 bg-background-light dark:bg-background-dark flex items-center justify-center border-b border-gray-light">
        {game.preview_url ? (
          <img
            src={game.preview_url}
            alt="Chess game preview"
            className="w-28 h-28 object-contain border border-gray-light rounded"
          />
        ) : (
          <div className="w-28 h-28 bg-gray-light border border-gray-light rounded flex items-center justify-center" aria-hidden="true">
            <span className="text-gray-dark text-2xl">♟️</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-primary font-semibold text-base sm:text-lg">{game.white_player.name}</span>
          <span className="text-gray-dark text-sm">vs</span>
          <span className="text-primary font-semibold text-base sm:text-lg">{game.black_player.name}</span>
        </div>
        <div className="flex justify-between items-center mb-3 text-sm text-gray-dark">
          <span>{game.time_control || 'Standard'}</span>
          <span>{formatDate(game.last_move_at)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize flex items-center gap-1 ${status.className}`}
            aria-label={status.label}
          >
            {status.icon}
            {status.label}
          </span>
          {game.result && (
            <span className="px-2 py-1 bg-accent text-white rounded-full text-xs font-semibold flex items-center gap-1" aria-label="Game result">
              <span aria-hidden="true" className="text-white text-base">🏆</span>
              {game.result}
            </span>
          )}
        </div>
      </div>
    </button>
  );
});

export default GameCard;
