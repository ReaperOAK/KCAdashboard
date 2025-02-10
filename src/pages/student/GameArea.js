import React, { useState, useEffect } from 'react';
import { FaChess, FaRobot, FaUser } from 'react-icons/fa';

const GameArea = () => {
  const [gameMode, setGameMode] = useState('ai');
  const [gameSettings, setGameSettings] = useState({
    timeControl: '10+0',
    color: 'random',
    level: 5
  });
  const [lichessAuth, setLichessAuth] = useState(null);

  useEffect(() => {
    // Check if user has authorized Lichess
    checkLichessAuth();
  }, []);

  const checkLichessAuth = async () => {
    try {
      const response = await fetch('/php/game/check_lichess_auth.php');
      const data = await response.json();
      if (data.success) {
        setLichessAuth(data.token);
      }
    } catch (error) {
      console.error('Failed to check Lichess auth:', error);
    }
  };

  const handleStartGame = async () => {
    if (!lichessAuth) {
      // Redirect to Lichess OAuth
      window.location.href = '/php/game/lichess_auth.php';
      return;
    }

    try {
      const response = await fetch('/php/game/create_lichess_game.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameMode,
          ...gameSettings
        })
      });
      
      const data = await response.json();
      if (data.success) {
        // Redirect to Lichess game
        window.location.href = `https://lichess.org/${data.gameId}`;
      }
    } catch (error) {
      console.error('Failed to create game:', error);
    }
  };

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
          <button
            onClick={handleStartGame}
            className="w-full h-full flex items-center justify-center bg-[#461fa3] text-white rounded-lg"
          >
            {lichessAuth ? 'Start Game on Lichess' : 'Connect with Lichess'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameArea;