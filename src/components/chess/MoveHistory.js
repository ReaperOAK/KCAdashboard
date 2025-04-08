import React from 'react';
import './MoveHistory.css';

const MoveHistory = ({ history, currentMove, goToMove }) => {
  // Handle click on move
  const handleMoveClick = (index) => {
    if (typeof goToMove === 'function') {
      goToMove(index);
    }
  };

  return (
    <div className="move-history">
      <h3>Move History</h3>
      <div className="moves-container">
        {history.length === 0 ? (
          <div className="no-moves">No moves yet</div>
        ) : (
          <table className="moves-table">
            <thead>
              <tr>
                <th>#</th>
                <th>White</th>
                <th>Black</th>
              </tr>
            </thead>
            <tbody>
              {history.map((moveItem, index) => (
                <tr key={index}>
                  <td className="move-number">{moveItem.moveNumber}.</td>
                  <td
                    className={`move-cell ${moveItem.white && currentMove === index * 2 ? 'current-move' : ''}`}
                    onClick={() => moveItem.white && handleMoveClick(index * 2)}
                  >
                    {moveItem.white ? moveItem.white.san : ''}
                  </td>
                  <td
                    className={`move-cell ${moveItem.black && currentMove === index * 2 + 1 ? 'current-move' : ''}`}
                    onClick={() => moveItem.black && handleMoveClick(index * 2 + 1)}
                  >
                    {moveItem.black ? moveItem.black.san : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default MoveHistory;
