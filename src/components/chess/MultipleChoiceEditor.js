
import React, { useCallback } from 'react';
import { FaCheck } from 'react-icons/fa';

// Memoized answer option for performance and clarity
const AnswerOption = React.memo(function AnswerOption({
  answer,
  answerIndex,
  questionIndex,
  handleAnswerChange,
}) {
  // Mark as correct handler
  const handleMarkCorrect = useCallback(() => {
    handleAnswerChange(questionIndex, answerIndex, 'is_correct', true);
  }, [handleAnswerChange, questionIndex, answerIndex]);

  // Change answer text handler
  const handleTextChange = useCallback(e => {
    handleAnswerChange(questionIndex, answerIndex, 'answer_text', e.target.value);
  }, [handleAnswerChange, questionIndex, answerIndex]);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-2 mb-2" role="listitem">
      <button
        type="button"
        className={`w-6 h-6 rounded-full mr-3 flex items-center justify-center border-2 focus:outline-none focus:ring-2 focus:ring-accent ${
          answer.is_correct
            ? 'bg-green-600 text-white border-green-700'
            : 'bg-gray-light text-primary border-gray-dark hover:bg-gray-dark hover:text-white'
        }`}
        onClick={handleMarkCorrect}
        aria-label={answer.is_correct ? 'Correct answer' : 'Mark as correct'}
        aria-pressed={answer.is_correct}
        tabIndex={0}
      >
        {answer.is_correct && <FaCheck className="text-xs" aria-hidden="true" />}
      </button>
      <input
        type="text"
        value={answer.answer_text}
        onChange={handleTextChange}
        className="flex-1 p-2 border border-gray-light rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-white text-text-dark placeholder:text-gray-dark"
        placeholder={`Answer ${answerIndex + 1}`}
        aria-label={`Answer ${answerIndex + 1}`}
      />
    </div>
  );
});

export const MultipleChoiceEditor = React.memo(function MultipleChoiceEditor({ question, questionIndex, handleAnswerChange }) {
  return (
    <div className="mb-2" role="group" aria-label="Multiple choice answers">
      <label className="block text-sm font-medium text-text-dark mb-1">Answers</label>
      <p className="text-sm text-gray-dark mb-2">Select the correct answer</p>
      <div role="list">
        {question.answers && question.answers.map((answer, answerIndex) => (
          <AnswerOption
            key={answer.id || answer.tempId || answerIndex}
            answer={answer}
            answerIndex={answerIndex}
            questionIndex={questionIndex}
            handleAnswerChange={handleAnswerChange}
          />
        ))}
      </div>
    </div>
  );
});

export default MultipleChoiceEditor;
