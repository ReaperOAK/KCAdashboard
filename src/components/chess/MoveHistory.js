import React from 'react';
import './MoveHistory.css';

const MoveHistory = ({ history, currentMove, onMoveClick }) => {
  return (
    <div className="move-history">
      <h3>Move History</h3>
      <div className="moves-container">
        <table className="moves-table">
          <thead>
            <tr>
              <th>#</th>
              <th>White</th>
              <th>Black</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 ? (
              <tr>
                <td colSpan="3" className="no-moves">No moves yet</td>
              </tr>
            ) : (
              history.map((move, index) => (
                <tr key={index}>
                  <td>{move.moveNumber}</td>
                  <td 
                    className={`move ${currentMove === 2 * index ? 'current-move' : ''}`}
                    onClick={() => move.white && onMoveClick(2 * index)}
                  >
                    {move.white?.san || ''}
                  </td>
                  <td 
                    className={`move ${currentMove === 2 * index + 1 ? 'current-move' : ''}`}
                    onClick={() => move.black && onMoveClick(2 * index + 1)}
                  >
                    {move.black?.san || ''}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MoveHistory;
