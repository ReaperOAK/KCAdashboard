import React from 'react';

const MoveHistory = ({ history, currentMove, goToMove }) => {
  // Handle click on move
  const handleMoveClick = (index) => {
    if (typeof goToMove === 'function') {
      goToMove(index);
    }
  };

  // Helper to format time in IST
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
                <th className="px-2 py-1 text-left text-gray-700 font-medium">Time</th>
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
                  <td className="px-2 py-1 text-gray-500 font-mono">
                    {/* Show time for white or black move if available */}
                    {moveItem.white && moveItem.white.created_at
                      ? formatIST(moveItem.white.created_at)
                      : moveItem.black && moveItem.black.created_at
                      ? formatIST(moveItem.black.created_at)
                      : ''}
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
