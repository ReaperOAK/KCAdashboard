import React, { useCallback } from 'react';
import { FaClock } from 'react-icons/fa';

/**
 * Timer bar for quiz.
 * @param {Object} props
 */
const TimerBar = React.memo(function TimerBar({ quizTitle, timeLeft }) {
  const formatTime = useCallback((seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);
  return (
    <div className="max-w-3xl mx-auto mb-4 bg-white p-4 rounded-lg shadow flex flex-col sm:flex-row justify-between items-center gap-4">
      <h1 className="text-xl font-bold text-primary truncate" title={quizTitle}>{quizTitle}</h1>
      <div className="flex items-center">
        <FaClock className="text-secondary mr-2" aria-hidden="true" />
        <span className={`font-mono text-xl font-semibold ${timeLeft < 60 ? 'text-red-600 animate-pulse' : 'text-gray-dark'}`}
          aria-live="polite"
        >
          {formatTime(timeLeft)}
        </span>
      </div>
    </div>
  );
});

export default TimerBar;
