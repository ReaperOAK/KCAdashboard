
import React, { useCallback, useMemo } from 'react';
import { FaPlus, FaTrash, FaChess, FaFileAlt } from 'react-icons/fa';
import ChessPositionEditor from './ChessPositionEditor';
import ChessPGNBoard from './ChessPGNBoard';
import ChessQuizBoard from './ChessQuizBoard';

// Chess mode selector button
const ChessModeButton = React.memo(function ChessModeButton({ active, onClick, icon: Icon, children, ariaLabel }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-5 py-3 rounded-xl border flex items-center gap-2 font-semibold text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-accent shadow-sm transition-all duration-200 ${
        active
          ? 'bg-accent text-white border-accent shadow-md'
          : 'bg-background-light text-primary border-gray-light hover:bg-accent/10 hover:text-accent'
      }`}
      aria-pressed={active}
      aria-label={ariaLabel}
      tabIndex={0}
    >
      <Icon className="mr-2 text-lg" aria-hidden="true" />
      {children}
    </button>
  );
});

// FEN Mode: Correct move row
const CorrectMoveRow = React.memo(function CorrectMoveRow({ move, moveIndex, questionIndex, handleCorrectMoveChange, removeCorrectMove }) {
  const handleChange = useCallback((field, value) => {
    handleCorrectMoveChange(questionIndex, moveIndex, field, value);
  }, [handleCorrectMoveChange, questionIndex, moveIndex]);
  const handleRemove = useCallback(() => {
    removeCorrectMove(questionIndex, moveIndex);
  }, [removeCorrectMove, questionIndex, moveIndex]);
  return (
    <div className="flex items-center gap-2 mb-2" role="listitem">
      <input
        type="text"
        value={move.from || ''}
        onChange={e => handleChange('from', e.target.value)}
        className="w-16 p-2 border border-gray-light rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
        placeholder="From"
        aria-label="From square"
      />
      <span className="text-gray-dark">→</span>
      <input
        type="text"
        value={move.to || ''}
        onChange={e => handleChange('to', e.target.value)}
        className="w-16 p-2 border border-gray-light rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
        placeholder="To"
        aria-label="To square"
      />
      <input
        type="text"
        value={move.description || ''}
        onChange={e => handleChange('description', e.target.value)}
        className="flex-1 p-2 border border-gray-light rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
        placeholder="Move description (optional)"
        aria-label="Move description"
      />
      <button
        type="button"
        onClick={handleRemove}
        className="p-2 text-red-600 hover:bg-red-50 rounded focus:outline-none focus:ring-2 focus:ring-red-400"
        aria-label="Remove move"
      >
        <FaTrash className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
});

// FEN Mode: Moves list
const CorrectMovesList = React.memo(function CorrectMovesList({ moves, questionIndex, handleCorrectMoveChange, removeCorrectMove }) {
  return (
    <div role="list">
      {moves && moves.map((move, moveIndex) => (
        <CorrectMoveRow
          key={moveIndex}
          move={move}
          moveIndex={moveIndex}
          questionIndex={questionIndex}
          handleCorrectMoveChange={handleCorrectMoveChange}
          removeCorrectMove={removeCorrectMove}
        />
      ))}
    </div>
  );
});

// FEN Mode Section
const FenModeSection = React.memo(function FenModeSection({
  question,
  questionIndex,
  handleChessPositionChange,
  handleChessOrientationChange,
  handleCorrectMoveChange,
  addCorrectMove,
  removeCorrectMove
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
      <div className="w-full max-w-full">
        <label className="block text-sm font-medium text-text-dark mb-2">Setup Chess Position</label>
        <p className="text-sm text-gray-dark mb-3">
          Drag pieces to set up the position. Use the controls to reset or clear the board.
        </p>
        <div className="w-full max-w-[350px] mx-auto">
          <ChessPositionEditor
            initialPosition={question.chess_position || 'start'}
            orientation={question.chess_orientation || 'white'}
            onPositionChange={fen => handleChessPositionChange(questionIndex, fen)}
            width={Math.min(window.innerWidth - 48, 350)}
          />
    </div>
      </div>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Board Orientation</label>
          <select
            value={question.chess_orientation || 'white'}
            onChange={e => handleChessOrientationChange(questionIndex, e.target.value)}
            className="w-full p-2 border border-gray-light rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
          >
            <option value="white">White</option>
            <option value="black">Black</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Position (FEN)</label>
          <textarea
            value={question.chess_position || 'start'}
            onChange={e => handleChessPositionChange(questionIndex, e.target.value)}
            className="w-full p-2 border border-gray-light rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-xs font-mono"
            rows="3"
            placeholder="FEN notation will appear here"
            aria-label="FEN notation"
          />
          <p className="text-xs text-gray-dark mt-1">
            You can also manually edit the FEN notation
          </p>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-text-dark">Correct Moves</label>
            {(!question.correct_moves || question.correct_moves.length === 0) && (
              <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                ⚠️ No moves defined
              </span>
            )}
          </div>
          <p className="text-sm text-gray-dark mb-2">Define the correct moves for this position</p>
          <CorrectMovesList
            moves={question.correct_moves}
            questionIndex={questionIndex}
            handleCorrectMoveChange={handleCorrectMoveChange}
            removeCorrectMove={removeCorrectMove}
          />
          <button
            type="button"
            onClick={() => addCorrectMove(questionIndex)}
            className="px-4 py-2 bg-accent text-white rounded-xl hover:bg-secondary text-base font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-accent shadow-sm mt-2 transition-all duration-200"
          >
            <FaPlus className="mr-2 text-lg" aria-hidden="true" /> Add Move
          </button>
        </div>
      </div>
    </div>
  );
});

// PGN Mode Section
const PgnModeSection = React.memo(function PgnModeSection({
  question,
  questionIndex,
  handlePGNChange,
  handlePGNUpload,
  handleExpectedPlayerColorChange,
  handleChessOrientationChange
}) {
  // File input handler
  const handleFileChange = useCallback(e => {
    if (e.target.files && e.target.files[0]) {
      handlePGNUpload(questionIndex, e.target.files[0]);
      e.target.value = '';
    }
  }, [handlePGNUpload, questionIndex]);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
      <div className="w-full max-w-full">
        <label className="block text-sm font-medium text-text-dark mb-2">PGN Data</label>
        <p className="text-sm text-gray-dark mb-3">
          Enter the PGN game sequence or upload a PGN file. Students will play the moves for their assigned color.
        </p>
        <div className="flex items-center gap-3 mb-2">
          <input
            type="file"
            accept=".pgn,.txt"
            id={`pgn-upload-${questionIndex}`}
            className="hidden"
            onChange={handleFileChange}
          />
          <label htmlFor={`pgn-upload-${questionIndex}`}
            className="px-4 py-2 bg-accent text-white rounded-xl hover:bg-secondary cursor-pointer text-base font-semibold border border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent shadow-sm transition-all duration-200"
            tabIndex={0}
            aria-label="Upload PGN file"
          >
            <FaFileAlt className="inline mr-2 text-lg" aria-hidden="true" /> Upload PGN
          </label>
          {question.pgn_data && question.pgn_data.length > 0 && (
            <span className="text-green-700 text-xs ml-2">PGN loaded</span>
          )}
        </div>
        <textarea
          value={question.pgn_data || ''}
          onChange={e => handlePGNChange(questionIndex, e.target.value)}
          className="w-full p-4 border border-gray-light rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent text-base font-mono min-h-[120px] shadow-sm"
          rows="10"
          placeholder="1. e4 e5 2. Nf3 Nc6 3. Bb5 a6..."
          aria-label="PGN data"
        />
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Expected Player Color</label>
          <select
            value={question.expected_player_color || 'white'}
            onChange={e => handleExpectedPlayerColorChange(questionIndex, e.target.value)}
            className="w-full p-2 border border-gray-light rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
          >
            <option value="white">White (Student plays White moves)</option>
            <option value="black">Black (Student plays Black moves)</option>
          </select>
          <p className="text-xs text-gray-dark mt-1">
            The student will play this color, computer will auto-play the other
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">Board Orientation</label>
          <select
            value={question.chess_orientation || 'white'}
            onChange={e => handleChessOrientationChange(questionIndex, e.target.value)}
            className="w-full p-2 border border-gray-light rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
          >
            <option value="white">White at bottom</option>
            <option value="black">Black at bottom</option>
          </select>
        </div>
      </div>
      <div className="space-y-6">
        {question.pgn_data && (
          <div className="w-full max-w-[300px] mx-auto">
            <label className="block text-sm font-medium text-text-dark mb-2">Preview</label>
            <ChessPGNBoard
              pgn={question.pgn_data}
              expectedPlayerColor={question.expected_player_color || 'white'}
              orientation={question.chess_orientation || 'white'}
              width={Math.min(window.innerWidth - 48, 300)}
              disabled={true}
            />
          </div>
        )}
      </div>
    </div>
  );
});

export const ChessQuestionEditor = React.memo(function ChessQuestionEditor({
  question,
  questionIndex,
  handleChessModeChange,
  handleChessPositionChange,
  handleChessOrientationChange,
  handlePGNChange,
  handlePGNUpload,
  handleExpectedPlayerColorChange,
  handleCorrectMoveChange,
  addCorrectMove,
  removeCorrectMove
}) {
  const chessMode = useMemo(() => question.chess_mode || 'fen', [question.chess_mode]);
  const handleFenMode = useCallback(() => handleChessModeChange(questionIndex, 'fen'), [handleChessModeChange, questionIndex]);
  const handlePgnMode = useCallback(() => handleChessModeChange(questionIndex, 'pgn'), [handleChessModeChange, questionIndex]);
  return (
    <div className="space-y-8 w-full">
      {/* Chess Mode Selector */}
      <div>
        <label className="block text-sm font-medium text-text-dark mb-2">Chess Question Mode</label>
        <div className="flex gap-4">
          <ChessModeButton
            active={chessMode === 'fen'}
            onClick={handleFenMode}
            icon={FaChess}
            ariaLabel="Single Position (FEN)"
          >
            Single Position (FEN)
          </ChessModeButton>
          <ChessModeButton
            active={chessMode === 'pgn'}
            onClick={handlePgnMode}
            icon={FaFileAlt}
            ariaLabel="Multi-Move Sequence (PGN)"
          >
            Multi-Move Sequence (PGN)
          </ChessModeButton>
        </div>
        <p className="text-sm text-gray-dark mt-2">
          {chessMode === 'fen'
            ? 'Students will find the best move from a specific position'
            : 'Students will play along a game sequence with automatic computer responses'}
        </p>
      </div>

      {chessMode === 'fen' ? (
        <FenModeSection
          question={question}
          questionIndex={questionIndex}
          handleChessPositionChange={handleChessPositionChange}
          handleChessOrientationChange={handleChessOrientationChange}
          handleCorrectMoveChange={handleCorrectMoveChange}
          addCorrectMove={addCorrectMove}
          removeCorrectMove={removeCorrectMove}
        />
      ) : (
        <PgnModeSection
          question={question}
          questionIndex={questionIndex}
          handlePGNChange={handlePGNChange}
          handlePGNUpload={handlePGNUpload}
          handleExpectedPlayerColorChange={handleExpectedPlayerColorChange}
          handleChessOrientationChange={handleChessOrientationChange}
        />
      )}
      {chessMode === 'fen' && (
        <div>
          <label className="block text-sm font-medium text-text-dark mb-2">Question Preview</label>
          <div className="border border-gray-light rounded-xl p-6 bg-background-light w-full max-w-[320px] mx-auto shadow-md">
            {/* FEN preview only */}
            {(() => {
              try {
                if (!isValidFEN(question.chess_position || 'start')) {
                  return (
                    <div className="text-xs text-red-600 text-center py-4">
                      Invalid FEN position. Please check for extra/missing kings, pawns on first/last rank, or other errors.
                    </div>
                  );
                }
                return (
                  <ChessQuizBoard
                    initialPosition={question.chess_position || 'start'}
                    orientation={question.chess_orientation || 'white'}
                    correctMoves={question.correct_moves || []}
                    question={question.question}
                    allowMoves={false}
                    width={Math.min(window.innerWidth - 48, 300)}
                  />
                );
              } catch (e) {
                return (
                  <div className="text-xs text-red-600 text-center py-4">
                    Error rendering board: {e.message}
                  </div>
                );
              }
            })()}
          </div>
        </div>
      )}
    </div>
  );
});

export default ChessQuestionEditor;

// --- FENPreview: Handles invalid FEN gracefully ---
// Place this at the very end of the file, outside any component or export
function isValidFEN(fen) {
  // Basic FEN validation: 6 space-separated fields, 8 ranks, only valid chars
  if (!fen || typeof fen !== 'string') return false;
  const parts = fen.trim().split(' ');
  if (parts.length !== 6) return false;
  const ranks = parts[0].split('/');
  if (ranks.length !== 8) return false;
  // Check for exactly one white and one black king
  const boardStr = parts[0];
  const wK = (boardStr.match(/K/g) || []).length;
  const bK = (boardStr.match(/k/g) || []).length;
  if (wK !== 1 || bK !== 1) return false;
  // No pawns on first or last rank
  if (/[Pp]/.test(ranks[0])) return false;
  if (/[Pp]/.test(ranks[7])) return false;
  return true;
}
