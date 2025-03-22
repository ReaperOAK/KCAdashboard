import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaClock, FaChess, FaTrophy, FaUser } from 'react-icons/fa';

const QuizCard = ({ quiz }) => {
  const navigate = useNavigate();

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'beginner':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800'
        };
      case 'intermediate':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800'
        };
      case 'advanced':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800'
        };
    }
  };

  const difficultyStyles = getDifficultyColor(quiz.difficulty);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-semibold text-[#461fa3]">
            {quiz.title}
          </h3>
          <span className={`px-3 py-1 rounded-full text-xs ${difficultyStyles.bg} ${difficultyStyles.text}`}>
            {quiz.difficulty}
          </span>
        </div>
        
        <p className="text-gray-600 mb-4 line-clamp-2">{quiz.description}</p>
        
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <FaClock className="mr-1" /> {quiz.time_limit} mins
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <FaChess className="mr-1" /> {quiz.questions ? quiz.questions.length : '?'} Questions
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <FaTrophy className="mr-1" /> {quiz.highest_score ? `${quiz.highest_score}%` : 'No attempts'}
          </div>
          <div className="flex items-center text-sm text-gray-500 truncate">
            <FaUser className="mr-1" /> {quiz.creator_name}
          </div>
        </div>
      </div>
      <div className="px-6 py-4 bg-gray-50 border-t">
        <button 
          onClick={() => navigate(`/student/quiz/${quiz.id}`)}
          className="w-full text-center text-[#461fa3] hover:text-[#7646eb] font-medium flex items-center justify-center"
        >
          Start Quiz <span className="ml-2">→</span>
        </button>
      </div>
    </div>
  );
};

export default QuizCard;
