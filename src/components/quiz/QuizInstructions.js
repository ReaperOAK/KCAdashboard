import React from 'react';
import { FaClock, FaChessKnight } from 'react-icons/fa';

/**
 * Quiz instructions card.
 * @param {Object} props
 * @param {Object} props.quiz
 * @param {function} props.onStart
 */
const QuizInstructions = React.memo(({ quiz, onStart }) => (
  <div className="min-h-screen bg-background-light p-4 sm:p-8">
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-4 sm:p-8">
      <h1 className="text-3xl font-bold text-primary mb-4">{quiz.title}</h1>
      <div className="mb-6">
        <p className="text-gray-dark">{quiz.description}</p>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 p-4 bg-gray-light rounded-lg gap-4">
        <div className="flex items-center">
          <FaClock className="text-secondary mr-2" aria-hidden="true" />
          <span className="font-medium">Time Limit: {quiz.time_limit} minutes</span>
        </div>
        <div className="flex items-center">
          <FaChessKnight className="text-secondary mr-2" aria-hidden="true" />
          <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize
            ${quiz.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
            quiz.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'}`}
          >
            {quiz.difficulty}
          </span>
        </div>
      </div>
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Instructions:</h2>
        <ul className="list-disc pl-6 space-y-1 text-gray-700">
          <li>You have {quiz.time_limit} minutes to complete this quiz</li>
          <li>The quiz consists of {quiz.questions ? quiz.questions.length : 0} questions</li>
          <li>Each question has only one correct answer</li>
          <li>You can navigate between questions</li>
          <li>Once submitted, you cannot retake the quiz immediately</li>
        </ul>
      </div>
      <div className="flex justify-center">
        <button
          type="button"
          onClick={onStart}
          className="px-8 py-3 bg-secondary text-white rounded-lg hover:bg-accent transition-colors font-semibold text-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label="Start Quiz"
        >
          Start Quiz
        </button>
      </div>
    </div>
  </div>
));

export default QuizInstructions;
