import React, { useState } from 'react';
import { Chessboard } from 'react-chessboard';

const Studies = () => {
  const [selectedStudy, setSelectedStudy] = useState(null);
  const [position, setPosition] = useState('start');

  // Mock data - replace with actual API calls
  const studyList = [
    { id: 1, title: 'Basic Openings', author: 'Coach Smith', rating: 1500 },
    { id: 2, title: 'Advanced Endgames', author: 'Coach Johnson', rating: 2000 },
  ];

  const handleMove = (source, target) => {
    // Update position based on the move
    setPosition(prevPosition => {
      // Here you would normally update the position based on chess rules
      // This is a simplified example
      return target; // Update with actual chess position
    });
    return true;
  };

  const resetPosition = () => {
    setPosition('start');
  };

  return (
    <div className="p-6 bg-[#f3f1f9]">
      <h1 className="text-3xl font-bold text-[#200e4a] mb-6">Chess Studies</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Study List Section */}
        <div className="col-span-1 bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold text-[#461fa3] mb-4">Available Studies</h2>
          <div className="space-y-3">
            {studyList.map(study => (
              <div 
                key={study.id}
                onClick={() => setSelectedStudy(study)}
                className="p-3 border rounded cursor-pointer hover:bg-[#7646eb] hover:text-white"
              >
                <h3 className="font-medium">{study.title}</h3>
                <p className="text-sm">by {study.author}</p>
                <span className="text-xs">Rating: {study.rating}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Board Section */}
        <div className="col-span-2 bg-white rounded-lg shadow p-4">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-[#461fa3]">
              {selectedStudy ? selectedStudy.title : 'Select a Study'}
            </h2>
          </div>
          <div className="w-full max-w-[600px] mx-auto">
            <Chessboard 
              position={position}
              boardWidth={600}
              onPieceDrop={handleMove}
            />
          </div>
          
          {/* Study Controls */}
          <div className="mt-4 flex justify-center gap-4">
            <button 
              className="px-4 py-2 bg-[#200e4a] text-white rounded"
              onClick={() => resetPosition()}
            >
              Reset Board
            </button>
            <button className="px-4 py-2 bg-[#200e4a] text-white rounded">Previous Move</button>
            <button className="px-4 py-2 bg-[#200e4a] text-white rounded">Next Move</button>
            <button className="px-4 py-2 bg-[#461fa3] text-white rounded">Download PGN</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Studies;