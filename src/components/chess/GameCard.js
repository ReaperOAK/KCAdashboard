import React from 'react';

const GameCard = React.memo(({ game, onSelect, formatDate }) => (
  <button
    type="button"
    className="bg-background-light rounded-lg overflow-hidden shadow-md transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent text-left"
    onClick={() => onSelect(game)}
    aria-label={`View game between ${game.white_player.name} and ${game.black_player.name}`}
  >
    <div className="h-36 bg-background-light flex items-center justify-center border-b border-gray-light">
      {game.preview_url ? (
        <img
          src={game.preview_url}
          alt="Chess game preview"
          className="w-28 h-28 object-contain border border-gray-light rounded"
        />
      ) : (
        <div className="w-28 h-28 bg-gray-light border border-gray-light rounded" aria-hidden="true" />
      )}
    </div>
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-primary font-semibold">{game.white_player.name}</span>
        <span className="text-gray-dark text-sm">vs</span>
        <span className="text-primary font-semibold">{game.black_player.name}</span>
      </div>
      <div className="flex justify-between items-center mb-3 text-sm text-gray-dark">
        <span>{game.time_control || 'Standard'}</span>
        <span>{formatDate(game.last_move_at)}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${
          game.status === 'active' ? 'bg-success/10 text-success' :
          game.status === 'completed' ? 'bg-gray-light text-gray-dark' :
          game.status === 'abandoned' ? 'bg-warning/10 text-warning' :
          'bg-accent/10 text-accent'
        }`}>
          {game.status === 'abandoned' ? 'Expired' : game.status}
        </span>
        {game.result && (
          <span className="px-2 py-1 bg-accent text-white rounded text-xs font-medium">{game.result}</span>
        )}
      </div>
    </div>
  </button>
));

export default GameCard;
