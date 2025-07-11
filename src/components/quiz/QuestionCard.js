import React from 'react';
import ChessQuizBoard from '../chess/ChessQuizBoard';
import ChessPGNBoard from '../chess/ChessPGNBoard';

/**
 * Card for displaying a quiz question.
 * @param {Object} props
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
    <div className="mb-6">
      <div className="flex justify-between mb-4">
        <span className="text-sm text-gray-dark">Question {questionIndex + 1} of {totalQuestions}</span>
        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize
          ${quizDifficulty === 'beginner' ? 'bg-green-100 text-green-800' :
          quizDifficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'}`}
        >
          {quizDifficulty}
        </span>
      </div>
      <h2 className="text-xl font-semibold text-primary">{question.question}</h2>
      {question.image_url && (
        <div className="my-4 flex justify-center">
          <img
            src={question.image_url}
            alt="Question diagram"
            className="max-h-64 rounded-lg border border-gray-light"
          />
        </div>
      )}
      {/* Chess or MCQ */}
      {question.type === 'chess' ? (
        <div className="mb-8">
          {question.pgn_data ? (
            <ChessPGNBoard
              pgn={question.pgn_data}
              expectedPlayerColor={question.expected_player_color || 'white'}
              orientation={question.chess_orientation || 'white'}
              question=""
              onMove={moveData => onChessMove(question.id, moveData)}
              width={400}
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
              width={400}
              className="mx-auto"
            />
          )}
          {chessMoves[question.id] && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
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
          {question.answers && question.answers.map(answer => (
            <div
              key={answer.id}
              tabIndex={0}
              role="button"
              aria-pressed={selectedAnswers[question.id] === answer.id}
              onClick={() => onAnswerSelect(question.id, answer.id)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') onAnswerSelect(question.id, answer.id);
              }}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all outline-none
                ${selectedAnswers[question.id] === answer.id
                  ? 'border-secondary bg-background-light'
                  : 'border-gray-light hover:border-gray-dark'}
              `}
            >
              <div className="flex items-center">
                <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center
                  ${selectedAnswers[question.id] === answer.id
                    ? 'border-secondary'
                    : 'border-gray-dark'}
                `}
                >
                  {selectedAnswers[question.id] === answer.id && (
                    <div className="w-3 h-3 rounded-full bg-secondary"></div>
                  )}
                </div>
                <span>{answer.answer_text}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default QuestionCard;
