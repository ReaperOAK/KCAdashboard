import React from 'react';
import { FaEdit, FaTrash, FaChessBoard, FaEye } from 'react-icons/fa';

const QuizTableRow = React.memo(({ quiz, onEdit, onPublish, onDelete, onViewLeaderboard, getStatusClass, getDifficultyClass }) => (
  <tr className="border-t hover:bg-accent/10 transition-all duration-200">
    <td className="p-3 sm:p-4">
      <div className="font-medium text-secondary text-sm sm:text-base">{quiz.title}</div>
      <div className="text-xs text-gray-dark mt-1 line-clamp-1">{quiz.description}</div>
    </td>
    <td className="p-3 sm:p-4">
      <span className={`px-2 py-1 rounded-full text-xs ${getStatusClass(quiz.status)}`}>{quiz.status}</span>
    </td>
    <td className="p-3 sm:p-4">
      <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyClass(quiz.difficulty)}`}>{quiz.difficulty}</span>
    </td>
    <td className="p-3 sm:p-4">{quiz.question_count || '-'}</td>
    <td className="p-3 sm:p-4">{quiz.time_limit} mins</td>
    <td className="p-3 sm:p-4">{new Date(quiz.created_at).toLocaleDateString()}</td>
    <td className="p-3 sm:p-4">
      <div className="flex space-x-2">
        <button
          type="button"
          onClick={onEdit}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200"
          aria-label="Edit quiz"
        >
          <FaEdit />
        </button>
        {quiz.status === 'draft' && (
          <button
            type="button"
            onClick={onPublish}
            className="p-2 text-green-700 hover:bg-green-100 rounded focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200"
            aria-label="Publish quiz"
          >
            <FaEye />
          </button>
        )}
        <button
          type="button"
          onClick={onDelete}
          className="p-2 text-red-700 hover:bg-red-100 rounded focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200"
          aria-label="Delete quiz"
        >
          <FaTrash />
        </button>
        <button
          type="button"
          onClick={onViewLeaderboard}
          className="p-2 text-green-600 hover:bg-green-50 rounded focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200"
          aria-label="View leaderboard"
        >
          <FaChessBoard />
        </button>
      </div>
    </td>
  </tr>
));

export default QuizTableRow;
