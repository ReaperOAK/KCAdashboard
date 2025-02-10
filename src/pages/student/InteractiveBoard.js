import React, { useState, useEffect } from 'react';
import { FaCog, FaHistory, FaComments, FaDownload } from 'react-icons/fa';
import axios from 'axios';

const InteractiveBoard = () => {
  const [settings, setSettings] = useState({
    showCoordinates: true,
    pieceStyle: 'standard',
    boardTheme: 'blue'
  });

  const handleSettingsChange = (newSettings) => {
    setSettings(newSettings);
    // Reload iframe with new settings
    const iframe = document.getElementById('lichess-board');
    const url = `https://lichess.org/embed/frame?theme=${newSettings.boardTheme}&pieceSet=${newSettings.pieceStyle}&coordinates=${newSettings.showCoordinates}`;
    iframe.src = url;
  };

  const handleExportPGN = () => {
    // Lichess automatically handles PGN export
    window.open('https://lichess.org/analysis', '_blank');
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
                id="lichess-board"
                src={`https://lichess.org/embed/frame?theme=${settings.boardTheme}&pieceSet=${settings.pieceStyle}&coordinates=${settings.showCoordinates}`}
                className="w-full h-full border-0 rounded-lg"
                allowFullScreen
                title="Chess Board"
              ></iframe>
            </div>

            {/* Board Controls */}
            <div className="flex justify-between items-center mt-4">
              <button 
                onClick={() => window.open('https://lichess.org/analysis', '_blank')}
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

        {/* Settings Panel */}
        <div className="w-full lg:w-80">
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
                  onChange={(e) => handleSettingsChange({...settings, boardTheme: e.target.value})}
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
                    onChange={(e) => handleSettingsChange({...settings, showCoordinates: e.target.checked})}
                    className="form-checkbox text-[#461fa3]"
                  />
                  <span className="text-[#3b3a52]">Show Coordinates</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveBoard;