
import React from 'react';
import { FaEdit, FaTrash, FaChessBoard, FaEye } from 'react-icons/fa';

/**
 * QuizTableRow: Beautiful, accessible, and responsive table row for quiz list.
 * @param {Object} props
 * @param {Object} props.quiz
 * @param {function} props.onEdit
 * @param {function} props.onPublish
 * @param {function} props.onDelete
 * @param {function} props.onViewLeaderboard
 * @param {function} props.getStatusClass
 * @param {function} props.getDifficultyClass
 */
const QuizTableRow = React.memo(function QuizTableRow({ quiz, onEdit, onPublish, onDelete, onViewLeaderboard, getStatusClass, getDifficultyClass }) {
  return (
    <tr className="border-b border-gray-light hover:bg-accent/10 transition-all duration-200 group">
      <td className="p-2 sm:p-3 align-middle min-w-[120px]">
        <div className="font-semibold text-secondary text-xs sm:text-sm truncate" title={quiz.title}>{quiz.title}</div>
        <div className="text-xs text-gray-dark mt-0.5 line-clamp-1" title={quiz.description}>{quiz.description}</div>
      </td>
      <td className="p-2 sm:p-3 align-middle">
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusClass(quiz.status)}`}>{quiz.status}</span>
      </td>
      <td className="p-2 sm:p-3 align-middle">
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getDifficultyClass(quiz.difficulty)}`}>{quiz.difficulty}</span>
      </td>
      <td className="p-2 sm:p-3 align-middle text-center">{quiz.question_count || '-'}</td>
      <td className="p-2 sm:p-3 align-middle text-center">{quiz.time_limit} <span className="text-xs text-gray-dark">mins</span></td>
      <td className="p-2 sm:p-3 align-middle text-center">{new Date(quiz.created_at).toLocaleDateString()}</td>
      <td className="p-2 sm:p-3 align-middle">
        <div className="flex flex-wrap gap-1.5 justify-center">
          <button
            type="button"
            onClick={onEdit}
            className="p-2 text-primary hover:bg-primary/10 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all duration-200"
            aria-label="Edit quiz"
            tabIndex={0}
          >
            <FaEdit className="w-4 h-4" />
          </button>
          {quiz.status === 'draft' && (
            <button
              type="button"
              onClick={onPublish}
              className="p-2 text-accent hover:bg-accent/10 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all duration-200"
              aria-label="Publish quiz"
              tabIndex={0}
            >
              <FaEye className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onDelete}
            className="p-2 text-highlight hover:bg-highlight/10 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all duration-200"
            aria-label="Delete quiz"
            tabIndex={0}
          >
            <FaTrash className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onViewLeaderboard}
            className="p-2 text-secondary hover:bg-secondary/10 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all duration-200"
            aria-label="View leaderboard"
            tabIndex={0}
          >
            <FaChessBoard className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
});

export default QuizTableRow;
