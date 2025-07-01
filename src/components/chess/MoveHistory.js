
import React, { useCallback, useMemo } from 'react';

// Helper: Format time in IST
const formatIST = (dateString) => {
  if (!dateString) return '';
  try {
    let s = dateString;
    if (s && !s.includes('T')) s = s.replace(' ', 'T');
    if (s && !s.endsWith('Z')) s += 'Z';
    const d = new Date(s);
    return d.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST';
  } catch {
    return dateString;
  }
};

// Table Row for a single move pair
const MoveRow = React.memo(function MoveRow({ moveItem, index, currentMove, onMoveClick }) {
  // Accessibility: aria-current for current move
  const isWhiteCurrent = moveItem.white && currentMove === index * 2;
  const isBlackCurrent = moveItem.black && currentMove === index * 2 + 1;
  return (
    <tr className="border-b border-gray-light">
      <td className="px-2 py-1 text-gray-600 font-mono">{moveItem.moveNumber}.</td>
      <td>
        <button
          type="button"
          className={
            `px-2 py-1 w-full text-left font-mono rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors ` +
            (moveItem.white
              ? isWhiteCurrent
                ? 'bg-accent text-white font-semibold'
                : 'text-gray-800 hover:bg-accent/10'
              : 'text-gray-400 cursor-default')
          }
          onClick={moveItem.white ? () => onMoveClick(index * 2) : undefined}
          aria-current={isWhiteCurrent ? 'step' : undefined}
          tabIndex={moveItem.white ? 0 : -1}
          aria-label={moveItem.white ? `Go to move ${moveItem.moveNumber} (White)` : undefined}
          disabled={!moveItem.white}
        >
          {moveItem.white ? moveItem.white.san : ''}
        </button>
      </td>
      <td>
        <button
          type="button"
          className={
            `px-2 py-1 w-full text-left font-mono rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors ` +
            (moveItem.black
              ? isBlackCurrent
                ? 'bg-accent text-white font-semibold'
                : 'text-gray-800 hover:bg-accent/10'
              : 'text-gray-400 cursor-default')
          }
          onClick={moveItem.black ? () => onMoveClick(index * 2 + 1) : undefined}
          aria-current={isBlackCurrent ? 'step' : undefined}
          tabIndex={moveItem.black ? 0 : -1}
          aria-label={moveItem.black ? `Go to move ${moveItem.moveNumber} (Black)` : undefined}
          disabled={!moveItem.black}
        >
          {moveItem.black ? moveItem.black.san : ''}
        </button>
      </td>
      <td className="px-2 py-1 text-gray-500 font-mono">
        {moveItem.white && moveItem.white.created_at
          ? formatIST(moveItem.white.created_at)
          : moveItem.black && moveItem.black.created_at
          ? formatIST(moveItem.black.created_at)
          : ''}
      </td>
    </tr>
  );
});

// Main MoveHistory component
export const MoveHistory = React.memo(function MoveHistory({ history, currentMove, goToMove }) {
  // Memoize move click handler for performance
  const handleMoveClick = useCallback(
    (index) => {
      if (typeof goToMove === 'function') goToMove(index);
    },
    [goToMove]
  );

  // Memoize rendered rows
  const moveRows = useMemo(
    () =>
      history.map((moveItem, idx) => (
        <MoveRow
          key={idx}
          moveItem={moveItem}
          index={idx}
          currentMove={currentMove}
          onMoveClick={handleMoveClick}
        />
      )),
    [history, currentMove, handleMoveClick]
  );

  return (
    <section
      className="bg-background-light rounded-lg p-4 shadow-md"
      aria-label="Move History"
      tabIndex={0}
    >
      <h3 className="text-xl font-semibold text-primary mb-3">Move History</h3>
      <div className="max-h-80 overflow-y-auto">
        {history.length === 0 ? (
          <div className="text-gray-500 text-center py-4" role="status">No moves yet</div>
        ) : (
          <table className="w-full text-sm" aria-label="Chess move history">
            <thead className="bg-primary text-white text-sm uppercase">
              <tr>
                <th className="px-2 py-1 text-left font-medium">#</th>
                <th className="px-2 py-1 text-left font-medium">White</th>
                <th className="px-2 py-1 text-left font-medium">Black</th>
                <th className="px-2 py-1 text-left font-medium">Time</th>
              </tr>
            </thead>
            <tbody>{moveRows}</tbody>
          </table>
        )}
      </div>
    </section>
  );
});

export default MoveHistory;
