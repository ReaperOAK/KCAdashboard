
import React, { useCallback } from 'react';
import { FaClock } from 'react-icons/fa';

/**
 * TimerBar: Beautiful, accessible, and responsive timer bar for quiz.
 */
const TimerBar = React.memo(function TimerBar({ quizTitle, timeLeft }) {
  const formatTime = useCallback((seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);
  return (
    <section className="max-w-3xl mx-auto mb-4 bg-white dark:bg-background-dark p-3 sm:p-4 rounded-xl shadow-md border border-gray-light flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 animate-fade-in">
      <h1 className="text-base sm:text-xl font-semibold text-primary truncate w-full sm:w-auto" title={quizTitle}>{quizTitle}</h1>
      <div className="flex items-center gap-2 bg-background-light px-3 py-1 rounded-lg border border-gray-light">
        <FaClock className="text-secondary w-5 h-5" aria-hidden="true" />
        <span
          className={`font-mono text-lg sm:text-xl font-bold ${timeLeft < 60 ? 'text-highlight animate-pulse' : 'text-gray-dark'}`}
          aria-live="polite"
        >
          {formatTime(timeLeft)}
        </span>
      </div>
    </section>
  );
});

export default TimerBar;
