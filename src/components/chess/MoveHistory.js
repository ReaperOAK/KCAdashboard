

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
    <tr className="border-b border-gray-light hover:bg-gray-light/40 transition-colors">
      <td className="px-2 py-1 text-gray-dark font-mono text-xs sm:text-sm">{moveItem.moveNumber}.</td>
      <td>
        <button
          type="button"
          className={
            `px-2 py-1 w-full text-left font-mono rounded focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200 ` +
            (moveItem.white
              ? isWhiteCurrent
                ? 'bg-accent text-white font-semibold shadow-sm'
                : 'text-primary hover:bg-accent/10'
              : 'text-gray-light cursor-default')
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
            `px-2 py-1 w-full text-left font-mono rounded focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200 ` +
            (moveItem.black
              ? isBlackCurrent
                ? 'bg-accent text-white font-semibold shadow-sm'
                : 'text-primary hover:bg-accent/10'
              : 'text-gray-light cursor-default')
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
      <td className="px-2 py-1 text-gray-dark font-mono text-xs sm:text-sm">
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
      className="bg-background-light dark:bg-background-dark border border-gray-light shadow-md rounded-xl p-4 sm:p-6 w-full max-w-2xl mx-auto"
      aria-label="Move History"
      tabIndex={0}
    >
      <h3 className="text-2xl text-primary font-medium mb-4">Move History</h3>
      <div className="max-h-80 overflow-y-auto rounded-lg border border-gray-light">
        {history.length === 0 ? (
          <div className="text-gray-dark text-center py-6" role="status">No moves yet</div>
        ) : (
          <table className="w-full text-xs sm:text-sm" aria-label="Chess move history">
            <thead className="bg-primary text-white text-xs sm:text-sm uppercase sticky top-0 z-10">
              <tr>
                <th className="px-2 py-2 text-left font-medium">#</th>
                <th className="px-2 py-2 text-left font-medium">White</th>
                <th className="px-2 py-2 text-left font-medium">Black</th>
                <th className="px-2 py-2 text-left font-medium">Time</th>
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
