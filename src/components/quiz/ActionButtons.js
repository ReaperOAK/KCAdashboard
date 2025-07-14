
import React from 'react';
import { FaTrophy, FaHistory } from 'react-icons/fa';

// Reusable button for quiz actions
const QuizActionButton = React.memo(function QuizActionButton({ onClick, icon: Icon, label, colorClass, ariaLabel, testId }) {
  return (
    <button
      onClick={onClick}
      className={`group flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all duration-200 ${colorClass}`}
      aria-label={ariaLabel || label}
      data-testid={testId}
      tabIndex={0}
    >
      <Icon className="text-lg md:text-xl group-hover:scale-110 transition-transform duration-200" aria-hidden />
      <span className="hidden sm:inline text-base md:text-lg">{label}</span>
    </button>
  );
});

/**
 * Action buttons for quiz page (history, leaderboard).
 * Responsive, accessible, beautiful UI.
 */
const ActionButtons = React.memo(function ActionButtons({ onHistory, onLeaderboard }) {
  return (
    <div className="flex flex-row gap-2 sm:gap-4 w-full justify-center sm:justify-end items-center mt-2 mb-2">
      <QuizActionButton
        onClick={onHistory}
        icon={FaHistory}
        label="Quiz History"
        ariaLabel="Open quiz history"
        testId="quiz-history-btn"
        colorClass="bg-white border border-secondary text-secondary hover:bg-background-light hover:text-accent focus-visible:ring-accent disabled:bg-gray-light disabled:text-gray-dark disabled:cursor-not-allowed"
      />
      <QuizActionButton
        onClick={onLeaderboard}
        icon={FaTrophy}
        label="Leaderboard"
        ariaLabel="Open leaderboard"
        testId="leaderboard-btn"
        colorClass="bg-secondary text-white hover:bg-accent focus-visible:ring-accent disabled:bg-gray-light disabled:text-gray-dark disabled:cursor-not-allowed"
      />
    </div>
  );
});

export default ActionButtons;
