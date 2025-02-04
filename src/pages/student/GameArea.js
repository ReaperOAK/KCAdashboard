import React, { useState } from 'react';
import { FaChess, FaRobot, FaUser } from 'react-icons/fa';

const GameArea = () => {
  const [gameMode, setGameMode] = useState('ai');
  const [gameSettings, setGameSettings] = useState({
    timeControl: '10+0',
    color: 'random',
    level: 5
  });

  // const handleStartGame = () => {
  //   // Implement game start logic
  // };

  return (
    <div className="min-h-screen bg-[#f3f1f9] p-8">
      <h1 className="text-3xl font-bold mb-8 text-[#200e4a]">Game Area</h1>
      
      {/* Game Mode Selection */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-[#461fa3]">Select Game Mode</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setGameMode('ai')}
            className={`flex items-center justify-center p-4 rounded-lg ${
              gameMode === 'ai' 
                ? 'bg-[#461fa3] text-white' 
                : 'bg-white text-[#3b3a52] border border-[#c2c1d3]'
            }`}
          >
            <FaRobot className="mr-2" /> Play vs AI
          </button>
          <button
            onClick={() => setGameMode('player')}
            className={`flex items-center justify-center p-4 rounded-lg ${
              gameMode === 'player' 
                ? 'bg-[#461fa3] text-white' 
                : 'bg-white text-[#3b3a52] border border-[#c2c1d3]'
            }`}
          >
            <FaUser className="mr-2" /> Play vs Student
          </button>
          <button
            onClick={() => setGameMode('practice')}
            className={`flex items-center justify-center p-4 rounded-lg ${
              gameMode === 'practice' 
                ? 'bg-[#461fa3] text-white' 
                : 'bg-white text-[#3b3a52] border border-[#c2c1d3]'
            }`}
          >
            <FaChess className="mr-2" /> Practice Mode
          </button>
        </div>
      </div>

      {/* Game Settings */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-[#461fa3]">Game Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={gameSettings.timeControl}
            onChange={(e) => setGameSettings({...gameSettings, timeControl: e.target.value})}
            className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7646eb]"
          >
            <option value="5+0">5 minutes</option>
            <option value="10+0">10 minutes</option>
            <option value="15+10">15+10 minutes</option>
          </select>
          <select
            value={gameSettings.color}
            onChange={(e) => setGameSettings({...gameSettings, color: e.target.value})}
            className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7646eb]"
          >
            <option value="random">Random Color</option>
            <option value="white">White</option>
            <option value="black">Black</option>
          </select>
          {gameMode === 'ai' && (
            <select
              value={gameSettings.level}
              onChange={(e) => setGameSettings({...gameSettings, level: parseInt(e.target.value)})}
              className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7646eb]"
            >
              {[...Array(8)].map((_, i) => (
                <option key={i} value={i + 1}>Level {i + 1}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Chessboard Area */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="aspect-w-1 aspect-h-1">
          <iframe
            src="https://lichess.org/embed/frame"
            className="w-full h-full"
            allow="fullscreen"
            title="Chess Game"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default GameArea;