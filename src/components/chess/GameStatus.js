import React from 'react';
import { UserCheck, UserX } from 'lucide-react';

const GameStatus = React.memo(function GameStatus({ yourTurn, timeLeft, formatTimer }) {
  return (
    <section className="text-center text-lg font-semibold text-primary mt-4 " aria-live="polite" aria-atomic="true">
      {yourTurn ? (
        <span className="inline-flex items-center gap-2"><UserCheck className="w-5 h-5 text-success" />Your Turn</span>
      ) : (
        <span className="inline-flex items-center gap-2"><UserX className="w-5 h-5 text-error" />Opponent's Turn</span>
      )}
      <div className="text-2xl font-bold text-accent transition-all duration-200">{formatTimer(timeLeft)}</div>
    </section>
  );
});

export default GameStatus;
