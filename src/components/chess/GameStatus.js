import React from 'react';
import { UserCheck, UserX } from 'lucide-react';

const GameStatus = React.memo(function GameStatus({ yourTurn, timeLeft, formatTimer }) {
  return (
    <section
      className="bg-background-light dark:bg-background-dark border border-gray-light shadow-md rounded-xl max-w-md mx-auto mt-4 p-4 sm:p-6 flex flex-col items-center justify-center text-center transition-all duration-200"
      aria-live="polite"
      aria-atomic="true"
      role="status"
    >
      <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full font-semibold text-lg mb-2 ${yourTurn ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}
        aria-label={yourTurn ? 'Your Turn' : "Opponent's Turn"}
      >
        {yourTurn ? (
          <UserCheck className="w-5 h-5 text-success" aria-hidden="true" />
        ) : (
          <UserX className="w-5 h-5 text-error" aria-hidden="true" />
        )}
        {yourTurn ? 'Your Turn' : "Opponent's Turn"}
      </div>
      <div className="text-2xl font-bold text-accent transition-all duration-200" aria-label="Time left">
        {formatTimer(timeLeft)}
      </div>
    </section>
  );
});

export default GameStatus;
