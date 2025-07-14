
import React from 'react';
import ChessQuizBoard from '../chess/ChessQuizBoard';
import ChessPGNBoard from '../chess/ChessPGNBoard';

/**
 * QuestionCard: Beautiful, accessible, responsive card for displaying a quiz question.
 */
const QuestionCard = React.memo(function QuestionCard({
  question,
  questionIndex,
  totalQuestions,
  quizDifficulty,
  selectedAnswers,
  onAnswerSelect,
  chessMoves,
  onChessMove,
}) {
  return (
    <section className="mb-8 w-full max-w-2xl mx-auto bg-white dark:bg-background-dark rounded-2xl shadow-md border border-gray-light p-4 sm:p-6 animate-fade-in">
      <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
        <span className="text-sm text-gray-dark">Question {questionIndex + 1} of {totalQuestions}</span>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize shadow-sm
          ${quizDifficulty === 'beginner' ? 'bg-green-100 text-green-800' :
          quizDifficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
          'bg-highlight/10 text-highlight border border-highlight'}`}
        >
          {quizDifficulty}
        </span>
      </div>
      <h2 className="text-xl sm:text-2xl font-semibold text-primary mb-3">{question.question}</h2>
      {question.image_url && (
        <div className="my-4 flex justify-center">
          <img
            src={question.image_url}
            alt="Question diagram"
            className="max-h-64 rounded-lg border border-gray-light shadow-sm object-contain"
          />
        </div>
      )}
      {/* Chess or MCQ */}
      {question.type === 'chess' ? (
        <div className="mb-8 flex flex-col items-center">
          {question.pgn_data ? (
            <ChessPGNBoard
              pgn={question.pgn_data}
              expectedPlayerColor={question.expected_player_color || 'white'}
              orientation={question.chess_orientation || 'white'}
              question=""
              onMove={moveData => onChessMove(question.id, moveData)}
              width={window.innerWidth < 500 ? 280 : 400}
              className="mx-auto"
              quizMode={true}
            />
          ) : (
            <ChessQuizBoard
              initialPosition={question.chess_position || 'start'}
              orientation={question.chess_orientation || 'white'}
              correctMoves={question.correct_moves || []}
              question=""
              allowMoves={true}
              showAnswer={false}
              onMove={moveData => onChessMove(question.id, moveData)}
              width={window.innerWidth < 500 ? 280 : 400}
              className="mx-auto"
            />
          )}
          {chessMoves[question.id] && (
            <div className="mt-4 p-3 bg-accent/10 rounded-lg border border-accent w-full max-w-xs mx-auto">
              <p className="text-sm text-accent text-center">
                {question.pgn_data ? (
                  chessMoves[question.id].completed ?
                    'Sequence completed successfully!'
                    : `Move recorded: ${chessMoves[question.id].san} ${chessMoves[question.id].isCorrect ? '✓' : '✗'}`
                ) : (
                  `Move recorded: ${chessMoves[question.id].from} → ${chessMoves[question.id].to}`
                )}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3 mb-8">
          {question.answers && question.answers.map(answer => {
            const isSelected = selectedAnswers[question.id] === answer.id;
            return (
              <button
                key={answer.id}
                type="button"
                tabIndex={0}
                aria-pressed={isSelected}
                onClick={() => onAnswerSelect(question.id, answer.id)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') onAnswerSelect(question.id, answer.id);
                }}
                className={`w-full text-left p-4 rounded-lg border-2 flex items-center gap-3 cursor-pointer transition-all outline-none font-medium
                  ${isSelected
                    ? 'border-secondary bg-background-light shadow-sm ring-2 ring-accent'
                    : 'border-gray-light hover:border-accent hover:bg-accent/5'}
                `}
              >
                <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                  ${isSelected ? 'border-secondary bg-secondary' : 'border-gray-dark bg-white'}
                `}
                >
                  {isSelected && (
                    <span className="w-3 h-3 rounded-full bg-white block"></span>
                  )}
                </span>
                <span className="flex-1">{answer.answer_text}</span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
});

export default QuestionCard;
