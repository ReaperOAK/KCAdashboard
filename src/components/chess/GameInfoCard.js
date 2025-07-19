import React from 'react';

// Optional: pass icon as prop for status/turn
const GameInfoCard = React.memo(({ gameData, lastMoveAt, formatIST, icon = null }) => (
  <section
    className="bg-background-light dark:bg-background-dark border border-gray-light shadow-md rounded-xl p-4 sm:p-6 max-w-2xl mx-auto mt-6 transition-all duration-200"
    aria-label="Game information panel"
  >
    <header className="flex items-center gap-2 mb-3 sm:mb-4">
      {icon && <span className="text-accent text-2xl" aria-hidden="true">{icon}</span>}
      <h2 className="text-lg sm:text-xl font-bold text-primary">Game Information</h2>
    </header>
    {gameData.status === 'abandoned' && (
      <div className="bg-warning/10 border border-warning p-4 rounded-lg mb-4 animate-pulse flex items-center gap-2">
        <span className="text-warning text-xl" aria-hidden="true">⏰</span>
        <div>
          <div className="text-warning font-semibold">Game Expired</div>
          <div className="text-warning text-sm">
            This game was automatically expired due to inactivity.
            {gameData.reason === 'inactivity timeout' && ' No moves were made for an extended period.'}
          </div>
        </div>
      </div>
    )}
    <div className="space-y-2">
      <p><strong className="text-gray-dark">Opponent:</strong> <span className="text-primary font-medium">{gameData.opponent && gameData.opponent.name}</span></p>
      <p><strong className="text-gray-dark">Your Color:</strong> <span className="text-secondary font-medium capitalize">{gameData.yourColor}</span></p>
      <p><strong className="text-gray-dark">Time Control:</strong> <span className="text-accent font-medium">{gameData.timeControl || 'Standard'}</span></p>
      <p>
        <strong className="text-gray-dark">Turn:</strong>
        <span className={`font-semibold px-2 py-1 rounded-full ml-2 inline-flex items-center gap-1 ${gameData.yourTurn ? 'bg-success/10 text-success' : 'bg-secondary/10 text-secondary'}`}
          aria-label={gameData.yourTurn ? 'Your move' : "Opponent's move"}
        >
          {gameData.yourTurn ? <span aria-hidden="true" className="text-success text-base">▶</span> : <span aria-hidden="true" className="text-secondary text-base">⏳</span>}
          {gameData.yourTurn ? 'Your move' : "Opponent's move"}
        </span>
      </p>
      {lastMoveAt && (
        <p>
          <strong className="text-gray-dark">Last Move:</strong>
          <span className="text-gray-dark ml-2">{formatIST(lastMoveAt)}</span>
        </p>
      )}
    </div>
  </section>
));

export default GameInfoCard;
