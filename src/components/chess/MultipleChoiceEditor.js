

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
    <div className="flex flex-col sm:flex-row items-center gap-2 mb-3" role="listitem">
      <button
        type="button"
        className={`w-7 h-7 rounded-full mr-3 flex items-center justify-center border-2 focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200 shadow-sm ${
          answer.is_correct
            ? 'bg-success text-white border-success'
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
        className="flex-1 p-2 border border-gray-light rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-background-light dark:bg-background-dark text-text-dark placeholder:text-gray-dark text-sm transition-all duration-200"
        placeholder={`Answer ${answerIndex + 1}`}
        aria-label={`Answer ${answerIndex + 1}`}
      />
    </div>
  );
});

export const MultipleChoiceEditor = React.memo(function MultipleChoiceEditor({ question, questionIndex, handleAnswerChange }) {
  return (
    <section
      className="bg-background-light dark:bg-background-dark border border-gray-light shadow-md rounded-xl p-4 sm:p-6 w-full max-w-2xl mx-auto mb-4"
      role="group"
      aria-label="Multiple choice answers"
      tabIndex={0}
    >
      <label className="block text-lg font-medium text-primary mb-2">Answers</label>
      <p className="text-sm text-gray-dark mb-3">Select the correct answer below:</p>
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
    </section>
  );
});

export default MultipleChoiceEditor;
