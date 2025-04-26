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
    <div className="bg-[#f8f8fc] rounded-lg p-4 shadow-sm mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="m-0 text-[#200e4a] text-lg">Online Players</h3>
        <button 
          onClick={onRefresh} 
          className="bg-[#461fa3] text-white border-none rounded px-3 py-2 text-sm cursor-pointer transition-colors hover:bg-[#341680]"
        >
          Refresh
        </button>
      </div>
      
      {players.length === 0 ? (
        <div className="text-center text-gray-600 py-5">
          <p>No players are currently online. Check back later!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {players.map(player => (
            <div 
              key={player.id} 
              className={`flex items-center bg-white rounded-md p-3 shadow-sm transition-all duration-200 cursor-pointer hover:translate-y-[-2px] hover:shadow-md ${player.id === currentUser?.id ? 'bg-[#f3f1f9]' : ''}`}
              onClick={() => handleSelectPlayer(player)}
            >
              <div className="mr-3">
                <span className="block w-2.5 h-2.5 rounded-full bg-green-500"></span>
              </div>
              <div className="flex-1">
                <div className="font-semibold text-[#200e4a] mb-1">{player.name}</div>
                <div className="text-sm text-gray-600">{player.rating}</div>
              </div>
              {player.id !== currentUser?.id && (
                <button 
                  className="bg-[#461fa3] text-white border-none rounded px-2.5 py-1.5 text-sm cursor-pointer transition-colors hover:bg-[#341680]"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1000]">
          <div className="bg-white rounded-lg w-[90%] max-w-[450px] shadow-lg">
            <div className="flex justify-between items-center px-5 py-4 border-b border-[#e0e0f0]">
              <h3 className="m-0 text-[#200e4a]">Challenge {selectedPlayer.name}</h3>
              <button className="bg-transparent border-none text-2xl text-gray-500 cursor-pointer hover:text-[#461fa3]" onClick={handleCloseModal}>×</button>
            </div>
            
            <div className="p-5">
              <div className="mb-4">
                <label className="block mb-2 font-semibold text-[#200e4a]">Play as:</label>
                <div className="flex gap-4 flex-wrap">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input 
                      type="radio" 
                      name="color" 
                      value="white" 
                      checked={challengeOptions.color === 'white'}
                      onChange={handleOptionChange}
                    />
                    White
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input 
                      type="radio" 
                      name="color" 
                      value="black" 
                      checked={challengeOptions.color === 'black'}
                      onChange={handleOptionChange}
                    />
                    Black
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input 
                      type="radio" 
                      name="color" 
                      value="random" 
                      checked={challengeOptions.color === 'random'}
                      onChange={handleOptionChange}
                    />
                    Random
                  </label>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block mb-2 font-semibold text-[#200e4a]">Time Control:</label>
                <select 
                  name="timeControl" 
                  value={challengeOptions.timeControl}
                  onChange={handleOptionChange}
                  className="w-full p-2 border border-[#c2c1d3] rounded bg-white text-base"
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
            
            <div className="flex justify-end gap-3 px-5 py-4 border-t border-[#e0e0f0]">
              <button 
                className="bg-[#f3f1f9] text-[#200e4a] border border-[#c2c1d3] rounded px-4 py-2 font-medium cursor-pointer transition-colors hover:bg-[#e6e1f7]"
                onClick={handleCloseModal}
              >
                Cancel
              </button>
              <button 
                className="bg-[#461fa3] text-white border-none rounded px-4 py-2 font-medium cursor-pointer transition-colors hover:bg-[#341680]"
                onClick={handleSubmitChallenge}
              >
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