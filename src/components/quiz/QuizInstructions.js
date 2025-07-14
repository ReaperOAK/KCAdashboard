
import React from 'react';
import { FaClock, FaChessKnight } from 'react-icons/fa';

/**
 * QuizInstructions: Beautiful, accessible, and responsive quiz instructions card.
 * @param {Object} props
 * @param {Object} props.quiz
 * @param {function} props.onStart
 */
const DIFFICULTY_STYLES = {
  beginner: 'bg-green-100 text-green-800 border-green-300',
  intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  advanced: 'bg-red-100 text-red-800 border-red-300',
};

const QuizInstructions = React.memo(function QuizInstructions({ quiz, onStart }) {
  const difficulty = quiz.difficulty?.toLowerCase() || 'beginner';
  const badgeClass = DIFFICULTY_STYLES[difficulty] || DIFFICULTY_STYLES.beginner;
  return (
    <section className="min-h-screen bg-background-light flex items-center justify-center px-2 py-8 animate-fade-in">
      <div className="w-full max-w-3xl bg-white dark:bg-background-dark rounded-2xl shadow-xl border border-gray-light p-4 sm:p-8 transition-all">
        <header className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2 leading-tight">{quiz.title}</h1>
          <p className="text-gray-dark text-base md:text-lg">{quiz.description}</p>
        </header>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 p-4 bg-gray-light dark:bg-background-dark rounded-xl border border-gray-light">
          <div className="flex items-center gap-2 text-base md:text-lg">
            <FaClock className="text-secondary" aria-hidden="true" />
            <span className="font-medium text-text-dark">Time Limit: {quiz.time_limit} min</span>
          </div>
          <div className="flex items-center gap-2">
            <FaChessKnight className="text-secondary" aria-hidden="true" />
            <span
              className={`px-3 py-1 rounded-full border text-xs font-semibold capitalize shadow-sm transition-colors ${badgeClass}`}
              aria-label={`Difficulty: ${quiz.difficulty}`}
            >
              {quiz.difficulty}
            </span>
          </div>
        </div>
        <section className="mb-8">
          <h2 className="text-xl md:text-2xl font-semibold text-primary mb-2">Instructions</h2>
          <ul className="list-disc pl-6 space-y-1 text-gray-dark text-base">
            <li>You have <span className="font-semibold text-secondary">{quiz.time_limit} minutes</span> to complete this quiz.</li>
            <li>The quiz consists of <span className="font-semibold text-secondary">{quiz.questions ? quiz.questions.length : 0} questions</span>.</li>
            <li>Each question has only one correct answer.</li>
            <li>You can navigate between questions.</li>
            <li>Once submitted, you cannot retake the quiz immediately.</li>
          </ul>
        </section>
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onStart}
            className="px-8 py-3 bg-secondary text-white rounded-lg hover:bg-accent focus:bg-accent transition-all font-semibold text-lg shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:bg-gray-dark disabled:text-gray-light disabled:cursor-not-allowed"
            aria-label="Start Quiz"
            tabIndex={0}
          >
            Start Quiz
          </button>
        </div>
      </div>
    </section>
  );
});

export default QuizInstructions;
