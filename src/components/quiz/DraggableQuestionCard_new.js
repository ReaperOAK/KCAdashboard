import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FaGripVertical, FaTrash, FaChess } from 'react-icons/fa';

/**
 * DraggableQuestionCard - A draggable wrapper for quiz questions
 * Provides drag handle, question header, and delete functionality
 */
const DraggableQuestionCard = React.memo(function DraggableQuestionCard({
  question,
  questionIndex,
  children,
  handleRemoveQuestion,
  isDragDisabled = false
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: question.id || question.tempId,
    disabled: isDragDisabled
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative bg-white rounded-xl border transition-all duration-200 ${
        isDragging 
          ? 'shadow-2xl border-accent/50 scale-105 rotate-2' 
          : 'border-gray-200 shadow-md hover:shadow-lg hover:border-accent/30'
      }`}
    >
      {/* Question Header with Drag Handle */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-r from-primary to-secondary rounded-t-xl p-3 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          {/* Drag Handle */}
          <button
            {...attributes}
            {...listeners}
            className={`flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200 ${
              isDragDisabled 
                ? 'bg-gray-400 cursor-not-allowed opacity-50' 
                : 'bg-white/20 hover:bg-white/30 cursor-grab active:cursor-grabbing hover:scale-110'
            }`}
            aria-label="Drag to reorder question"
            disabled={isDragDisabled}
          >
            <FaGripVertical className="text-white text-sm" />
          </button>
          
          {/* Question Number and Type */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg">
              Question {questionIndex + 1}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
              question.type === 'chess'
                ? 'bg-blue-500 text-white'
                : 'bg-green-500 text-white'
            }`}>
              {question.type === 'chess' && <FaChess className="text-xs" />}
              {question.type === 'chess' ? 'Chess' : 'Multiple Choice'}
            </span>
          </div>
        </div>

        {/* Delete Button */}
        <button
          onClick={() => handleRemoveQuestion(questionIndex)}
          className="flex items-center justify-center w-8 h-8 bg-red-500 hover:bg-red-600 rounded-md transition-all duration-200 hover:scale-110 group"
          aria-label="Remove question"
        >
          <FaTrash className="text-white text-sm group-hover:animate-pulse" />
        </button>
      </div>

      {/* Question Content */}
      <div className={`transition-opacity duration-200 ${isDragging ? 'opacity-75' : 'opacity-100'}`}>
        {children}
      </div>

      {/* Drag Overlay Indicator */}
      {isDragging && (
        <div className="absolute inset-0 bg-accent/10 border-2 border-dashed border-accent rounded-xl pointer-events-none flex items-center justify-center">
          <div className="bg-accent text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg">
            <FaGripVertical className="text-white" />
            Moving Question {questionIndex + 1}
          </div>
        </div>
      )}
    </div>
  );
});

export default DraggableQuestionCard;
