import React, { useState } from 'react';

const PlayerList = ({ players, currentUser, onChallenge, onRefresh }) => {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [challengeOptions, setChallengeOptions] = useState({
    color: 'random',
    timeControl: '10+0'
  });

  // Handle selecting a player to challenge
  const handleSelectPlayer = (player) => {
    // Don't allow challenging yourself
    if (player.id === currentUser?.id) return;
    
    setSelectedPlayer(player);
  };

  // Close the challenge modal
  const handleCloseModal = () => {
    setSelectedPlayer(null);
  };

  // Update challenge options
  const handleOptionChange = (e) => {
    const { name, value } = e.target;
    setChallengeOptions({
      ...challengeOptions,
      [name]: value
    });
  };

  // Send challenge to selected player
  const handleSubmitChallenge = () => {
    if (!selectedPlayer) return;
    
    onChallenge(selectedPlayer.id, challengeOptions.color, challengeOptions.timeControl);
    setSelectedPlayer(null);
  };
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-purple-900">Online Players</h3>
        <button onClick={onRefresh} className="px-3 py-1 bg-purple-700 text-white rounded text-sm hover:bg-purple-800 transition-colors">
          Refresh
        </button>
      </div>
      
      {players.length === 0 ? (
        <div className="bg-purple-50 p-6 rounded-lg text-center">
          <p className="text-gray-600">No players are currently online. Check back later!</p>        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {players.map(player => (
            <div 
              key={player.id} 
              className={`bg-white rounded-lg p-4 border-2 transition-all duration-200 cursor-pointer ${
                player.id === currentUser?.id 
                  ? 'border-purple-300 bg-purple-50' 
                  : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
              }`}
              onClick={() => handleSelectPlayer(player)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-sm text-gray-600">Online</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="font-semibold text-purple-900">{player.name}</div>
                <div className="text-sm text-gray-600">Rating: {player.rating}</div>
              </div>
              {player.id !== currentUser?.id && (
                <button 
                  className="w-full mt-3 px-3 py-2 bg-purple-700 text-white rounded text-sm hover:bg-purple-800 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectPlayer(player);
                  }}
                >
                  Challenge
                </button>
              )}
            </div>
          ))}
        </div>
      )}
        {/* Challenge Modal */}
      {selectedPlayer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-purple-900">Challenge {selectedPlayer.name}</h3>
              <button className="text-gray-500 hover:text-gray-700 text-2xl" onClick={handleCloseModal}>×</button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Play as:</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input 
                      type="radio" 
                      name="color" 
                      value="white" 
                      checked={challengeOptions.color === 'white'}
                      onChange={handleOptionChange}
                      className="w-4 h-4 text-purple-600"
                    />
                    <span className="text-gray-700">White</span>
                  </label>                  <label className="flex items-center gap-2">
                    <input 
                      type="radio" 
                      name="color" 
                      value="black" 
                      checked={challengeOptions.color === 'black'}
                      onChange={handleOptionChange}
                      className="w-4 h-4 text-purple-600"
                    />
                    <span className="text-gray-700">Black</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input 
                      type="radio" 
                      name="color" 
                      value="random" 
                      checked={challengeOptions.color === 'random'}
                      onChange={handleOptionChange}
                      className="w-4 h-4 text-purple-600"
                    />
                    <span className="text-gray-700">Random</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Control:</label>
                <select 
                  name="timeControl" 
                  value={challengeOptions.timeControl}
                  onChange={handleOptionChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="5+0">5 minutes</option>
                  <option value="10+0">10 minutes</option>
                  <option value="15+0">15 minutes</option>
                  <option value="30+0">30 minutes</option>
                  <option value="1+0">1 minute (Bullet)</option>
                  <option value="3+0">3 minutes (Blitz)</option>
                  <option value="10+5">10 minutes + 5 seconds</option>
                  <option value="15+10">15 minutes + 10 seconds</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors" onClick={handleCloseModal}>
                Cancel
              </button>
              <button className="px-4 py-2 bg-purple-700 text-white rounded hover:bg-purple-800 transition-colors" onClick={handleSubmitChallenge}>
                Send Challenge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerList;