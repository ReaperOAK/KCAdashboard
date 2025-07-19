
import React from 'react';
import { Clock } from 'lucide-react';

/**
 * MoveTimer
 * Beautiful, accessible timer panel for chess moves.
 * - Responsive, centered card/panel
 * - Icon, label, and timer value
 * - Strict Tailwind color tokens and design system
 * - Accessibility: ARIA live, keyboard navigation
 */
const MoveTimer = React.memo(function MoveTimer({ timeLeft, formatTimer }) {
  let timerColor = 'text-accent';
  if (timeLeft <= 30) timerColor = 'text-error';
  else if (timeLeft <= 60) timerColor = 'text-warning';

  return (
    <section
      className="w-full max-w-xs sm:max-w-sm mx-auto bg-background-light dark:bg-background-dark border border-gray-light shadow-md rounded-xl flex items-center gap-3 px-4 py-3 sm:px-6 sm:py-4 text-lg font-mono font-bold transition-all duration-200"
      aria-label="Move Timer"
      aria-live="polite"
      aria-atomic="true"
      tabIndex={0}
    >
      <Clock className="w-6 h-6 text-accent mr-2 flex-shrink-0" aria-hidden="true" />
      <span className="text-primary font-medium">Your move timer:</span>
      <span className={timerColor + ' ml-2 font-semibold'}>{formatTimer(timeLeft)}</span>
    </section>
  );
});

export default MoveTimer;
