import React from 'react';

const GameInfoCard = React.memo(({ gameData, lastMoveAt, formatIST }) => (
  <section className="bg-white rounded-lg p-4 sm:p-6 shadow-md max-w-2xl mx-auto mt-6 transition-all duration-200 animate-fade-in">
    <header>
      <h2 className="text-lg sm:text-xl font-bold text-primary mb-3 sm:mb-4">Game Information</h2>
    </header>
    {gameData.status === 'abandoned' && (
      <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg mb-4 animate-pulse">
        <div className="text-orange-800 font-semibold">Game Expired</div>
        <div className="text-orange-700 text-sm">
          This game was automatically expired due to inactivity.
          {gameData.reason === 'inactivity timeout' && ' No moves were made for an extended period.'}
        </div>
      </div>
    )}
    <div className="space-y-2">
      <p><strong className="text-gray-dark">Opponent:</strong> <span className="text-gray-900">{gameData.opponent && gameData.opponent.name}</span></p>
      <p><strong className="text-gray-dark">Your Color:</strong> <span className="text-gray-900 capitalize">{gameData.yourColor}</span></p>
      <p><strong className="text-gray-dark">Time Control:</strong> <span className="text-gray-900">{gameData.timeControl || 'Standard'}</span></p>
      <p><strong className="text-gray-dark">Turn:</strong> <span className={`font-semibold ${gameData.yourTurn ? 'text-green-600' : 'text-blue-600'}`}>{gameData.yourTurn ? 'Your move' : "Opponent's move"}</span></p>
      {lastMoveAt && (
        <p>
          <strong className="text-gray-dark">Last Move:</strong>
          <span className="text-gray-900">{formatIST(lastMoveAt)}</span>
        </p>
      )}
    </div>
  </section>
));

export default GameInfoCard;
