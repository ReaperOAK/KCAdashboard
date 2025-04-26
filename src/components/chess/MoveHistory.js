import React from 'react';

const MoveHistory = ({ history, currentMove, goToMove }) => {
  // Handle click on move
  const handleMoveClick = (index) => {
    if (typeof goToMove === 'function') {
      goToMove(index);
    }
  };

  return (
    <div className="bg-[#f3f1f9] rounded-lg p-3 shadow-md">
      <h3 className="mt-0 mb-3 text-[#200e4a] text-base font-semibold">Move History</h3>
      <div className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-track-[#f3f1f9] scrollbar-thumb-[#c2c1d3] hover:scrollbar-thumb-[#7646eb] scrollbar-thumb-rounded">
        {history.length === 0 ? (
          <div className="text-[#3b3a52] italic text-center py-2.5">No moves yet</div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left p-1.5 border-b border-[#c2c1d3] text-[#461fa3] font-semibold text-sm">#</th>
                <th className="text-left p-1.5 border-b border-[#c2c1d3] text-[#461fa3] font-semibold text-sm">White</th>
                <th className="text-left p-1.5 border-b border-[#c2c1d3] text-[#461fa3] font-semibold text-sm">Black</th>
              </tr>
            </thead>
            <tbody>
              {history.map((moveItem, index) => (
                <tr key={index}>
                  <td className="text-[#3b3a52] font-semibold w-[30px] text-center">{moveItem.moveNumber}.</td>
                  <td
                    className={`px-2.5 py-1.5 cursor-pointer transition-colors font-mono ${
                      moveItem.white && currentMove === index * 2 
                        ? 'bg-[rgba(118,70,235,0.2)] font-bold' 
                        : 'hover:bg-[rgba(118,70,235,0.1)]'
                    }`}
                    onClick={() => moveItem.white && handleMoveClick(index * 2)}
                  >
                    {moveItem.white ? moveItem.white.san : ''}
                  </td>
                  <td
                    className={`px-2.5 py-1.5 cursor-pointer transition-colors font-mono ${
                      moveItem.black && currentMove === index * 2 + 1 
                        ? 'bg-[rgba(118,70,235,0.2)] font-bold' 
                        : 'hover:bg-[rgba(118,70,235,0.1)]'
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
