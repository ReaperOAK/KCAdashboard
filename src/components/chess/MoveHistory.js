import React from 'react';

const MoveHistory = ({ history, currentMove, goToMove }) => {
  // Handle click on move
  const handleMoveClick = (index) => {
    if (typeof goToMove === 'function') {
      goToMove(index);
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-purple-900 mb-3">Move History</h3>
      <div className="max-h-80 overflow-y-auto">
        {history.length === 0 ? (
          <div className="text-gray-500 text-center py-4">No moves yet</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-1 text-left text-gray-700 font-medium">#</th>
                <th className="px-2 py-1 text-left text-gray-700 font-medium">White</th>
                <th className="px-2 py-1 text-left text-gray-700 font-medium">Black</th>
              </tr>
            </thead>
            <tbody>
              {history.map((moveItem, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="px-2 py-1 text-gray-600 font-mono">{moveItem.moveNumber}.</td>
                  <td
                    className={`px-2 py-1 cursor-pointer hover:bg-purple-50 font-mono ${
                      moveItem.white && currentMove === index * 2 ? 'bg-purple-100 text-purple-900 font-semibold' : 'text-gray-800'
                    }`}
                    onClick={() => moveItem.white && handleMoveClick(index * 2)}
                  >
                    {moveItem.white ? moveItem.white.san : ''}
                  </td>
                  <td
                    className={`px-2 py-1 cursor-pointer hover:bg-purple-50 font-mono ${
                      moveItem.black && currentMove === index * 2 + 1 ? 'bg-purple-100 text-purple-900 font-semibold' : 'text-gray-800'
                    }`}
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
