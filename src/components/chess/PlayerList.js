import React, { useState } from 'react';
import './PlayerList.css';

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
    <div className="player-list">
      <div className="list-header">
        <h3>Online Players</h3>
        <button onClick={onRefresh} className="refresh-button">
          Refresh
        </button>
      </div>
      
      {players.length === 0 ? (
        <div className="no-players">
          <p>No players are currently online. Check back later!</p>
        </div>
      ) : (
        <div className="players-grid">
          {players.map(player => (
            <div 
              key={player.id} 
              className={`player-card ${player.id === currentUser?.id ? 'current-user' : ''}`}
              onClick={() => handleSelectPlayer(player)}
            >
              <div className="player-status">
                <span className="status-dot online"></span>
              </div>
              <div className="player-info">
                <div className="player-name">{player.name}</div>
                <div className="player-rating">{player.rating}</div>
              </div>
              {player.id !== currentUser?.id && (
                <button 
                  className="challenge-button"
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
        <div className="challenge-modal-overlay">
          <div className="challenge-modal">
            <div className="modal-header">
              <h3>Challenge {selectedPlayer.name}</h3>
              <button className="close-button" onClick={handleCloseModal}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="option-group">
                <label>Play as:</label>
                <div className="radio-options">
                  <label className="radio-label">
                    <input 
                      type="radio" 
                      name="color" 
                      value="white" 
                      checked={challengeOptions.color === 'white'}
                      onChange={handleOptionChange}
                    />
                    White
                  </label>
                  <label className="radio-label">
                    <input 
                      type="radio" 
                      name="color" 
                      value="black" 
                      checked={challengeOptions.color === 'black'}
                      onChange={handleOptionChange}
                    />
                    Black
                  </label>
                  <label className="radio-label">
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
              
              <div className="option-group">
                <label>Time Control:</label>
                <select 
                  name="timeControl" 
                  value={challengeOptions.timeControl}
                  onChange={handleOptionChange}
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
            
            <div className="modal-footer">
              <button className="cancel-button" onClick={handleCloseModal}>
                Cancel
              </button>
              <button className="send-challenge-button" onClick={handleSubmitChallenge}>
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