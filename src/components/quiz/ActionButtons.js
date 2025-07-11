import React from 'react';
import { FaTrophy, FaHistory } from 'react-icons/fa';

/**
 * Action buttons for quiz page (history, leaderboard).
 * @param {Object} props
 */
const ActionButtons = React.memo(function ActionButtons({ onHistory, onLeaderboard }) {
  return (
    <div className="flex space-x-2">
      <button
        onClick={onHistory}
        className="px-4 py-2 rounded-lg bg-white border border-secondary text-secondary hover:bg-background-light flex items-center focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200"
        aria-label="Quiz History"
      >
        <FaHistory className="mr-2" aria-hidden />
        Quiz History
      </button>
      <button
        onClick={onLeaderboard}
        className="px-4 py-2 rounded-lg bg-secondary text-white hover:bg-accent flex items-center focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200"
        aria-label="Leaderboard"
      >
        <FaTrophy className="mr-2" aria-hidden />
        Leaderboard
      </button>
    </div>
  );
});

export default ActionButtons;
