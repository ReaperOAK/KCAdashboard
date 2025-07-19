import React from 'react';

const GameSwitcher = React.memo(({ activeGames, currentId, onSwitch }) => (
  <nav
    className="mb-6 bg-background-light dark:bg-background-dark border border-gray-light shadow-md rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 transition-all duration-200"
    aria-label="Active games switcher"
    role="navigation"
  >
    <span className="font-semibold text-primary text-base sm:text-lg">Switch Game:</span>
    <label htmlFor="game-switcher" className="sr-only">Select active game</label>
    <select
      id="game-switcher"
      value={currentId}
      onChange={onSwitch}
      className="border border-accent rounded-lg px-3 py-2 bg-background-light dark:bg-background-dark text-primary font-medium focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200 min-w-[180px]"
      aria-label="Select active game"
      tabIndex={0}
    >
      {activeGames.map(game => (
        <option key={game.id} value={game.id} className="text-primary">
          vs {game.opponent?.name || 'Unknown'} ({game.yourColor})
          {game.status === 'active' ? '' : ' (ended)'}
        </option>
      ))}
    </select>
  </nav>
));

export default GameSwitcher;
