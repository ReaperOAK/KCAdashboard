import React from 'react';
import { Clock } from 'lucide-react';

const MoveTimer = React.memo(function MoveTimer({ timeLeft, formatTimer }) {
  let timerColor = 'text-accent';
  if (timeLeft <= 30) timerColor = 'text-error';
  else if (timeLeft <= 60) timerColor = 'text-warning';

  return (
    <div
      className="flex items-center gap-2 bg-primary text-text-light px-6 py-2 rounded-lg text-lg font-mono font-bold shadow-md transition-all duration-200"
      aria-live="polite"
      aria-atomic="true"
    >
      <Clock className="w-5 h-5 text-accent mr-1" aria-hidden="true" />
      <span>Your move timer:</span>
      <span className={timerColor}>{formatTimer(timeLeft)}</span>
    </div>
  );
});

export default MoveTimer;
