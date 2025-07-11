import React from 'react';
import { FaRedo, FaList } from 'react-icons/fa';
import ResultStat from './ResultStat';

/**
 * Result card for quiz results page.
 */
const ResultCard = React.memo(function ResultCard({ quizTitle, percentageScore, isPassing, resultData, timeTaken, onTryAgain, onViewHistory, onBackToQuizzes }) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
      <div className={`p-6 text-center ${isPassing ? 'bg-green-50' : 'bg-red-50'}`}> 
        <h1 className="text-3xl font-bold text-primary mb-2">{quizTitle}</h1>
        <p className="text-xl font-semibold mb-4">
          {isPassing ? 'Congratulations!' : 'Keep practicing!'}
        </p>
        <div className="flex justify-center">
          <div className="w-32 h-32 rounded-full border-8 border-secondary flex items-center justify-center bg-white">
            <span className="text-4xl font-bold text-secondary">{percentageScore}%</span>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <ResultStat icon="trophy" label="Score" value={`${resultData.score} / ${resultData.total_questions}`} />
          <ResultStat icon="clock" label="Time Taken" value={resultData.timeTakenFormatted} />
          <ResultStat icon="chart" label="Percentile" value={resultData.percentile || '-'} />
        </div>
        {resultData.feedback && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-1">Feedback</h3>
            <p className="text-blue-700">{resultData.feedback}</p>
          </div>
        )}
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            type="button"
            onClick={onTryAgain}
            className="px-4 py-2 rounded-lg bg-secondary text-white hover:bg-accent flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Try quiz again"
          >
            <FaRedo className="mr-2" aria-hidden="true" /> Try Again
          </button>
          <button
            type="button"
            onClick={onViewHistory}
            className="px-4 py-2 rounded-lg border border-secondary text-secondary hover:bg-background-light flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="View quiz history"
          >
            <FaList className="mr-2" aria-hidden="true" /> View History
          </button>
          <button
            type="button"
            onClick={onBackToQuizzes}
            className="px-4 py-2 rounded-lg border border-secondary text-secondary hover:bg-background-light focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Back to quizzes"
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    </div>
  );
});

export default ResultCard;
