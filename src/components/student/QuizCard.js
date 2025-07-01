
import React, { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaClock, FaChess, FaTrophy, FaUser } from 'react-icons/fa';

// Accessibility: ARIA label for the card, button, and semantic structure
const DIFFICULTY_STYLES = {
  beginner: { bg: 'bg-green-100', text: 'text-green-800' },
  intermediate: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  advanced: { bg: 'bg-red-100', text: 'text-red-800' },
  default: { bg: 'bg-gray-100', text: 'text-gray-800' },
};

const DifficultyBadge = React.memo(({ difficulty }) => {
  const { bg, text } = useMemo(() => DIFFICULTY_STYLES[difficulty] || DIFFICULTY_STYLES.default, [difficulty]);
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${bg} ${text}`}
      aria-label={`Difficulty: ${difficulty}`}
    >
      {difficulty}
    </span>
  );
});

const QuizMeta = React.memo(({ quiz }) => (
  <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 mb-4">
    <div className="flex items-center text-xs sm:text-sm text-gray-500" aria-label={`Time limit: ${quiz.time_limit} minutes`}>
      <FaClock className="mr-1" aria-hidden="true" />
      {quiz.time_limit} mins
    </div>
    <div className="flex items-center text-xs sm:text-sm text-gray-500" aria-label={`Questions: ${quiz.questions ? quiz.questions.length : '?'}`}> 
      <FaChess className="mr-1" aria-hidden="true" />
      {quiz.questions ? quiz.questions.length : '?'} Questions
    </div>
    <div className="flex items-center text-xs sm:text-sm text-gray-500" aria-label={`Highest score: ${quiz.highest_score ? quiz.highest_score + '%' : 'No attempts'}`}> 
      <FaTrophy className="mr-1" aria-hidden="true" />
      {quiz.highest_score ? `${quiz.highest_score}%` : 'No attempts'}
    </div>
    <div className="flex items-center text-xs sm:text-sm text-gray-500 truncate" aria-label={`Created by: ${quiz.creator_name}`}> 
      <FaUser className="mr-1" aria-hidden="true" />
      {quiz.creator_name}
    </div>
  </div>
));

const QuizCard = React.memo(function QuizCard({ quiz }) {
  const navigate = useNavigate();

  const handleStartQuiz = useCallback(() => {
    navigate(`/student/quiz/${quiz.id}`);
  }, [navigate, quiz.id]);

  return (
    <section
      className="bg-background-light rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-gray-light"
      aria-label={`Quiz card: ${quiz.title}`}
      tabIndex={0}
    >
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 sm:mb-3 gap-2">
          <h3 className="text-base sm:text-xl font-semibold text-primary truncate" title={quiz.title}>
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
          className="w-full text-center text-secondary hover:text-accent font-medium flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 transition-colors rounded-md py-2"
          aria-label={`Start quiz: ${quiz.title}`}
        >
          Start Quiz <span className="ml-2" aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  );
});

export { QuizCard };
export default QuizCard;
