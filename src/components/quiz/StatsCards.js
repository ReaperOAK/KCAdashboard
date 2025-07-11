import React from 'react';
import { FaChartLine, FaTrophy, FaEye } from 'react-icons/fa';

/**
 * Stats summary cards for quiz history.
 * @param {Object} props
 * @param {Object} props.stats
 */
const StatsCards = React.memo(function StatsCards({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-dark">Total Quizzes</p>
            <p className="text-3xl font-bold text-secondary">{stats.total_attempts}</p>
          </div>
          <FaChartLine className="text-4xl text-gray-light" aria-hidden="true" />
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-dark">Average Score</p>
            <p className="text-3xl font-bold text-secondary">{stats.average_score}%</p>
          </div>
          <FaTrophy className="text-4xl text-gray-light" aria-hidden="true" />
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-dark">Highest Score</p>
            <p className="text-3xl font-bold text-secondary">{stats.highest_score}%</p>
          </div>
          <div className={`text-lg font-bold px-3 py-1 rounded-full capitalize
            ${stats.highest_difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
            stats.highest_difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'}`}
          >
            {stats.highest_difficulty}
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-dark">Unique Quizzes</p>
            <p className="text-3xl font-bold text-secondary">{stats.unique_quizzes}</p>
          </div>
          <FaEye className="text-4xl text-gray-light" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
});

export default StatsCards;
