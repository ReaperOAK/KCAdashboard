import React, { useState } from 'react';
import {  FaCog, FaHistory, FaComments, FaDownload } from 'react-icons/fa';

const InteractiveBoard = () => {
  const [showAnalysis, setShowAnalysis] = useState(false);
  // const [showChat, setShowChat] = useState(false);
  const [settings, setSettings] = useState({
    showCoordinates: true,
    pieceStyle: 'standard',
    boardTheme: 'blue'
  });

  const handleExportPGN = () => {
    // Implementation for PGN export
  };

  return (
    <div className="min-h-screen bg-[#f3f1f9] p-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Board Area */}
        <div className="flex-grow">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-3xl font-bold mb-6 text-[#200e4a]">Interactive Board</h1>
            
            {/* Chess Board */}
            <div className="aspect-w-1 aspect-h-1 mb-6">
              <iframe
                src="https://lichess.org/embed/frame?theme=blue&pieceSet=standard"
                className="w-full h-full border-0 rounded-lg"
                allowFullScreen
                title="Chess Board"
              ></iframe>
            </div>

            {/* Board Controls */}
            <div className="flex justify-between items-center mt-4">
              <button 
                onClick={() => setShowAnalysis(!showAnalysis)}
                className="bg-[#461fa3] text-white px-4 py-2 rounded hover:bg-[#7646eb]"
              >
                <FaHistory className="inline mr-2" />
                Analysis
              </button>
              <button
                onClick={handleExportPGN}
                className="bg-[#461fa3] text-white px-4 py-2 rounded hover:bg-[#7646eb]"
              >
                <FaDownload className="inline mr-2" />
                Export PGN
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80">
          {/* Settings Panel */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-[#461fa3]">
              <FaCog className="inline mr-2" />
              Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-[#3b3a52] text-sm font-bold mb-2">
                  Board Theme
                </label>
                <select
                  value={settings.boardTheme}
                  onChange={(e) => setSettings({...settings, boardTheme: e.target.value})}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-[#7646eb]"
                >
                  <option value="blue">Blue</option>
                  <option value="brown">Brown</option>
                  <option value="green">Green</option>
                </select>
              </div>
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.showCoordinates}
                    onChange={(e) => setSettings({...settings, showCoordinates: e.target.checked})}
                    className="form-checkbox text-[#461fa3]"
                  />
                  <span className="text-[#3b3a52]">Show Coordinates</span>
                </label>
              </div>
            </div>
          </div>

          {/* Chat Panel */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-[#461fa3]">
              <FaComments className="inline mr-2" />
              Chat
            </h2>
            {/* Chat implementation */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveBoard;