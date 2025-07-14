

import React, { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaClock, FaChess, FaTrophy, FaUser } from 'react-icons/fa';

// DifficultyBadge: Pure, focused, beautiful, responsive
const DIFFICULTY_STYLES = {
  beginner: { bg: 'bg-green-100', text: 'text-green-800' },
  intermediate: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  advanced: { bg: 'bg-red-100', text: 'text-red-800' },
  default: { bg: 'bg-gray-light', text: 'text-gray-dark' },
};

const DifficultyBadge = React.memo(function DifficultyBadge({ difficulty }) {
  const { bg, text } = useMemo(() => DIFFICULTY_STYLES[difficulty] || DIFFICULTY_STYLES.default, [difficulty]);
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${bg} ${text} shadow-sm border border-gray-light`}
      aria-label={`Difficulty: ${difficulty}`}
    >
      {difficulty}
    </span>
  );
});

DifficultyBadge.displayName = 'DifficultyBadge';

// QuizMeta: Pure, focused, beautiful, responsive
const QuizMeta = React.memo(function QuizMeta({ quiz }) {
  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 mb-4">
      <div className="flex items-center text-xs sm:text-sm text-gray-dark" aria-label={`Time limit: ${quiz.time_limit} minutes`}>
        <FaClock className="mr-1 text-accent" aria-hidden="true" />
        {quiz.time_limit} mins
      </div>
      <div className="flex items-center text-xs sm:text-sm text-gray-dark" aria-label={`Questions: ${quiz.questions ? quiz.questions.length : '?'}`}> 
        <FaChess className="mr-1 text-accent" aria-hidden="true" />
        {quiz.questions ? quiz.questions.length : '?'} Questions
      </div>
      <div className="flex items-center text-xs sm:text-sm text-gray-dark" aria-label={`Highest score: ${quiz.highest_score ? quiz.highest_score + '%' : 'No attempts'}`}> 
        <FaTrophy className="mr-1 text-accent" aria-hidden="true" />
        {quiz.highest_score ? `${quiz.highest_score}%` : 'No attempts'}
      </div>
      <div className="flex items-center text-xs sm:text-sm text-gray-dark truncate" aria-label={`Created by: ${quiz.creator_name}`}> 
        <FaUser className="mr-1 text-accent" aria-hidden="true" />
        {quiz.creator_name}
      </div>
    </div>
  );
});

QuizMeta.displayName = 'QuizMeta';

// QuizCard: handles layout, navigation, and composition only
const QuizCard = React.memo(function QuizCard({ quiz }) {
  const navigate = useNavigate();

  const handleStartQuiz = useCallback(() => {
    navigate(`/student/quiz/${quiz.id}`);
  }, [navigate, quiz.id]);

  return (
    <section
      className="bg-background-light dark:bg-background-dark rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-200 border border-gray-light  w-full max-w-xl mx-auto"
      aria-label={`Quiz card: ${quiz.title}`}
      tabIndex={0}
    >
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 sm:mb-3 gap-2">
          <h3 className="text-base sm:text-xl font-semibold text-primary truncate" title={quiz.title}>
            <span className="inline-block align-middle mr-2 text-accent" aria-hidden="true"><FaChess /></span>
            {quiz.title}
          </h3>
          <DifficultyBadge difficulty={quiz.difficulty} />
        </div>
        <p className="text-xs sm:text-gray-dark mb-2 sm:mb-4 line-clamp-2" title={quiz.description}>
          {quiz.description}
        </p>
        <QuizMeta quiz={quiz} />
      </div>
      <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-light/40 border-t border-gray-light">
        <button
          type="button"
          onClick={handleStartQuiz}
          className="w-full text-center bg-primary text-white hover:bg-secondary font-semibold flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 transition-all duration-200 rounded-md py-2 text-base"
          aria-label={`Start quiz: ${quiz.title}`}
        >
          Start Quiz <span className="ml-2" aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  );
});

QuizCard.displayName = 'QuizCard';

export { QuizCard };
export default QuizCard;
