
import React from 'react';
import { FaChartLine, FaTrophy, FaEye } from 'react-icons/fa';

/**
 * StatsCards: Beautiful, accessible, and responsive stat summary cards for quiz history.
 */
const DIFFICULTY_BADGE = {
  beginner: 'bg-green-100 text-green-800 border-green-300',
  intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  advanced: 'bg-red-100 text-red-800 border-red-300',
};

const StatsCards = React.memo(function StatsCards({ stats }) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Total Quizzes */}
      <div className="bg-white dark:bg-background-dark rounded-xl shadow-md border border-gray-light p-4 flex flex-col justify-between min-h-[120px]">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-dark">Total Quizzes</span>
            <div className="text-2xl md:text-3xl font-bold text-secondary mt-1">{stats.total_attempts}</div>
          </div>
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent/10">
            <FaChartLine className="text-accent text-2xl" aria-hidden="true" />
          </span>
        </div>
      </div>
      {/* Average Score */}
      <div className="bg-white dark:bg-background-dark rounded-xl shadow-md border border-gray-light p-4 flex flex-col justify-between min-h-[120px]">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-dark">Average Score</span>
            <div className="text-2xl md:text-3xl font-bold text-secondary mt-1">{stats.average_score}%</div>
          </div>
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent/10">
            <FaTrophy className="text-accent text-2xl" aria-hidden="true" />
          </span>
        </div>
      </div>
      {/* Highest Score */}
      <div className="bg-white dark:bg-background-dark rounded-xl shadow-md border border-gray-light p-4 flex flex-col justify-between min-h-[120px]">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-dark">Highest Score</span>
            <div className="text-2xl md:text-3xl font-bold text-secondary mt-1">{stats.highest_score}%</div>
          </div>
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full capitalize border shadow-sm transition-colors ${DIFFICULTY_BADGE[stats.highest_difficulty] || DIFFICULTY_BADGE.beginner}`}
            aria-label={`Difficulty: ${stats.highest_difficulty}`}
          >
            {stats.highest_difficulty}
          </span>
        </div>
      </div>
      {/* Unique Quizzes */}
      <div className="bg-white dark:bg-background-dark rounded-xl shadow-md border border-gray-light p-4 flex flex-col justify-between min-h-[120px]">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-dark">Unique Quizzes</span>
            <div className="text-2xl md:text-3xl font-bold text-secondary mt-1">{stats.unique_quizzes}</div>
          </div>
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent/10">
            <FaEye className="text-accent text-2xl" aria-hidden="true" />
          </span>
        </div>
      </div>
    </section>
  );
});

export default StatsCards;
