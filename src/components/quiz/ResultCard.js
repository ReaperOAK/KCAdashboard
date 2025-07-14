
import React from 'react';
import { FaRedo, FaList } from 'react-icons/fa';
import ResultStat from './ResultStat';

/**
 * ResultCard: Beautiful, accessible, and responsive card for quiz results.
 */
const ResultCard = React.memo(function ResultCard({ quizTitle, percentageScore, isPassing, resultData, timeTaken, onTryAgain, onViewHistory, onBackToQuizzes }) {
  return (
    <section className="bg-white dark:bg-background-dark rounded-2xl shadow-lg border border-gray-light overflow-hidden mb-8 max-w-2xl mx-auto ">
      <header className={`p-6 sm:p-8 text-center ${isPassing ? 'bg-green-50' : 'bg-red-50'}`}> 
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2 leading-tight">{quizTitle}</h1>
        <p className={`text-xl md:text-2xl font-semibold mb-4 ${isPassing ? 'text-green-700' : 'text-red-700'}`}
          aria-live="polite"
        >
          {isPassing ? 'Congratulations!' : 'Keep practicing!'}
        </p>
        <div className="flex justify-center">
          <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border-8 border-secondary flex items-center justify-center bg-white shadow-md">
            <span className="text-3xl md:text-4xl font-bold text-secondary">{percentageScore}%</span>
          </div>
        </div>
      </header>
      <div className="p-6 sm:p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <ResultStat icon="trophy" label="Score" value={`${resultData.score} / ${resultData.total_questions}`} />
          <ResultStat icon="clock" label="Time Taken" value={resultData.timeTakenFormatted} />
          <ResultStat icon="chart" label="Percentile" value={resultData.percentile || '-'} />
        </div>
        {resultData.feedback && (
          <div className="mb-6 p-4 bg-accent/10 rounded-lg border border-accent">
            <h3 className="font-semibold text-accent mb-1">Feedback</h3>
            <p className="text-accent text-sm">{resultData.feedback}</p>
          </div>
        )}
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            type="button"
            onClick={onTryAgain}
            className="px-4 py-2 rounded-lg bg-secondary text-white hover:bg-accent focus:bg-accent flex items-center gap-2 font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 transition-all text-base"
            aria-label="Try quiz again"
            tabIndex={0}
          >
            <FaRedo aria-hidden="true" /> Try Again
          </button>
          <button
            type="button"
            onClick={onViewHistory}
            className="px-4 py-2 rounded-lg border border-secondary text-secondary hover:bg-background-light focus:bg-background-light flex items-center gap-2 font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 transition-all text-base"
            aria-label="View quiz history"
            tabIndex={0}
          >
            <FaList aria-hidden="true" /> View History
          </button>
          <button
            type="button"
            onClick={onBackToQuizzes}
            className="px-4 py-2 rounded-lg border border-secondary text-secondary hover:bg-background-light focus:bg-background-light font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 transition-all text-base"
            aria-label="Back to quizzes"
            tabIndex={0}
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    </section>
  );
});

export default ResultCard;
