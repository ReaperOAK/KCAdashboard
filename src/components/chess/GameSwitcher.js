import React from 'react';

const GameSwitcher = React.memo(({ activeGames, currentId, onSwitch }) => (
  <nav className="mb-6 flex flex-col xs:flex-row items-start xs:items-center gap-2" aria-label="Active games switcher">
    <span className="font-semibold">Switch Game:</span>
    <label htmlFor="game-switcher" className="sr-only">Select active game</label>
    <select
      id="game-switcher"
      value={currentId}
      onChange={onSwitch}
      className="border border-gray-light rounded px-2 py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all duration-200"
      aria-label="Select active game"
    >
      {activeGames.map(game => (
        <option key={game.id} value={game.id}>
          vs {game.opponent?.name || 'Unknown'} ({game.yourColor})
          {game.status === 'active' ? '' : ' (ended)'}
        </option>
      ))}
    </select>
  </nav>
));

export default GameSwitcher;
