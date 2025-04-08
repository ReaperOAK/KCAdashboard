import React, { useState, useEffect, useCallback } from 'react';
import ChessBoard from '../../components/chess/ChessBoard';
import { useAuth } from '../../hooks/useAuth';
import ApiService from '../../utils/api';
import './InteractiveBoard.css';

const InteractiveBoard = () => {
  const { user } = useAuth();
  const [playMode, setPlayMode] = useState('vs-computer');
  const [engineLevel, setEngineLevel] = useState(5);
  const [orientation, setOrientation] = useState('white');
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [timeControl, setTimeControl] = useState('5+3');
  const [onlineOpponents, setOnlineOpponents] = useState([]);
  const [invitingUser, setInvitingUser] = useState(null);
  const [waitingForOpponent, setWaitingForOpponent] = useState(false);
  const [currentGame, setCurrentGame] = useState(null);
  const [gameConfig, setGameConfig] = useState({
    position: 'start',
    timeControl: '10+0',
    color: 'random'
  });
  const [loading, setLoading] = useState(false);
  const [gameOver, setGameOver] = useState({
    isOver: false,
    result: '',
    reason: ''
  });

  // Wrap fetchOnlinePlayers in useCallback to prevent infinite loops
  const fetchOnlinePlayers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await ApiService.getOnlinePlayers();
      if (response.success) {
        // Filter out current user
        const filteredPlayers = response.players.filter(p => p.id !== user.id);
        setOnlineOpponents(filteredPlayers);
      }
    } catch (error) {
      console.error('Failed to fetch online players:', error);
      // Fallback to empty array if API call fails
      setOnlineOpponents([]);
    } finally {
      setLoading(false);
    }
  }, [user.id]); // Add user.id as dependency

  // Fetch online players
  useEffect(() => {
    if (playMode === 'vs-player') {
      fetchOnlinePlayers();
    }
  }, [playMode, fetchOnlinePlayers]); // Added missing dependency

  // Handle play mode change
  const handlePlayModeChange = (mode) => {
    setPlayMode(mode);
    setCurrentGame(null);
  };

  // Handle start game against computer
  const handlePlayComputer = () => {
    // Create a local game against the computer
    const gameId = 'comp-' + Date.now();
    
    const newGame = {
      id: gameId,
      opponent: { name: `Computer (Level ${engineLevel})`, id: 'computer' },
      playerColor: orientation,
      fen: 'start',
      timeControl: timeControl,
      analysis: showAnalysis,
      engineLevel: engineLevel
    };
    
    // Save this game to local storage to persist it
    const savedGames = JSON.parse(localStorage.getItem('chessGames') || '[]');
    savedGames.push(newGame);
    localStorage.setItem('chessGames', JSON.stringify(savedGames));
    
    setCurrentGame(newGame);
  };

  // Handle engine level change
  const handleEngineLevel = (event) => {
    setEngineLevel(parseInt(event.target.value));
  };

  // Handle sending invite to player
  const handleInvitePlayer = (player) => {
    setInvitingUser(player);
  };

  // Handle confirm sending invite
  const handleConfirmInvite = async () => {
    try {
      setWaitingForOpponent(true);
      
      // Send challenge through API
      const response = await ApiService.challengePlayer(invitingUser.id, {
        timeControl: gameConfig.timeControl,
        color: gameConfig.color,
        position: gameConfig.position
      });
      
      if (response.success) {
        // Store the challenge ID for later reference
        localStorage.setItem('pendingChallenge', JSON.stringify({
          id: response.challenge.id,
          opponent: invitingUser,
          timestamp: Date.now()
        }));
        
        // Wait for acceptance is handled by polling or websockets
        // For now, we'll just show the waiting screen
      } else {
        alert(`Failed to send invitation: ${response.message}`);
        setWaitingForOpponent(false);
      }
    } catch (error) {
      console.error('Failed to send invitation:', error);
      alert('Failed to send invitation. Please try again.');
      setWaitingForOpponent(false);
    }
    
    setInvitingUser(null);
  };

  // Handle game config change
  const handleConfigChange = (field, value) => {
    setGameConfig({
      ...gameConfig,
      [field]: value
    });
  };

  // Handle game move
  const handleGameMove = async (move, fen) => {
    if (!currentGame || !currentGame.id) return;
    
    try {
      // For computer games, just update the local state
      if (currentGame.id.startsWith('comp-')) {
        // Update current game state
        setCurrentGame({
          ...currentGame,
          fen: fen
        });
        
        // Update in localStorage
        const savedGames = JSON.parse(localStorage.getItem('chessGames') || '[]');
        const updatedGames = savedGames.map(game => 
          game.id === currentGame.id ? {...game, fen} : game
        );
        localStorage.setItem('chessGames', JSON.stringify(updatedGames));
        return;
      }
      
      // For real games against other players, send move to server
      const response = await ApiService.makeGameMove(currentGame.id, move, fen);
      
      if (response.success) {
        // Update game state with the latest info from server
        setCurrentGame({
          ...currentGame,
          fen: fen
        });
      } else {
        alert(`Failed to make move: ${response.message}`);
      }
    } catch (error) {
      console.error('Failed to record move:', error);
      alert('Failed to make move. Please try again.');
    }
  };

  // Render game setup UI
  const renderGameSetup = () => {
    return (
      <div className="game-setup">
        <div className="play-modes">
          <button 
            className={`play-mode-btn ${playMode === 'vs-computer' ? 'active' : ''}`}
            onClick={() => handlePlayModeChange('vs-computer')}
          >
            <span className="icon">🤖</span>
            Play vs Computer
          </button>
          <button 
            className={`play-mode-btn ${playMode === 'vs-player' ? 'active' : ''}`}
            onClick={() => handlePlayModeChange('vs-player')}
          >
            <span className="icon">👥</span>
            Play vs Player
          </button>
          <button 
            className={`play-mode-btn ${playMode === 'analysis' ? 'active' : ''}`}
            onClick={() => handlePlayModeChange('analysis')}
          >
            <span className="icon">🔍</span>
            Analysis Board
          </button>
        </div>
        
        {playMode === 'vs-computer' && (
          <div className="computer-options">
            <h3>Play Against Computer</h3>
            
            <div className="option-group">
              <label>Computer Level</label>
              <div className="range-with-value">
                <input 
                  type="range" 
                  min="1" 
                  max="20" 
                  value={engineLevel} 
                  onChange={handleEngineLevel} 
                />
                <span className="range-value">{engineLevel}</span>
              </div>
            </div>
            
            <div className="option-group">
              <label>Play as</label>
              <div className="radio-options">
                <label className="radio-label">
                  <input 
                    type="radio" 
                    name="orientation" 
                    value="white" 
                    checked={orientation === 'white'} 
                    onChange={() => setOrientation('white')} 
                  />
                  White
                </label>
                <label className="radio-label">
                  <input 
                    type="radio" 
                    name="orientation" 
                    value="black" 
                    checked={orientation === 'black'} 
                    onChange={() => setOrientation('black')} 
                  />
                  Black
                </label>
              </div>
            </div>
            
            <div className="option-group">
              <label>Time Control</label>
              <select 
                value={timeControl} 
                onChange={(e) => setTimeControl(e.target.value)}
              >
                <option value="1+0">1 minute</option>
                <option value="3+0">3 minutes</option>
                <option value="5+0">5 minutes</option>
                <option value="5+3">5+3 minutes</option>
                <option value="10+0">10 minutes</option>
                <option value="15+10">15+10 minutes</option>
                <option value="30+0">30 minutes</option>
                <option value="no-limit">No time limit</option>
              </select>
            </div>
            
            <div className="option-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={showAnalysis} 
                  onChange={(e) => setShowAnalysis(e.target.checked)} 
                />
                Show engine analysis
              </label>
            </div>
            
            <button 
              className="start-game-btn" 
              onClick={handlePlayComputer}
            >
              Start Game
            </button>
          </div>
        )}
        
        {playMode === 'vs-player' && (
          <div className="player-options">
            <h3>Play Against Another User</h3>
            
            <div className="game-config">
              <div className="option-group">
                <label>Play as</label>
                <select 
                  value={gameConfig.color} 
                  onChange={(e) => handleConfigChange('color', e.target.value)}
                >
                  <option value="white">White</option>
                  <option value="black">Black</option>
                  <option value="random">Random</option>
                </select>
              </div>
              
              <div className="option-group">
                <label>Time Control</label>
                <select 
                  value={gameConfig.timeControl} 
                  onChange={(e) => handleConfigChange('timeControl', e.target.value)}
                >
                  <option value="3+0">3 minutes</option>
                  <option value="5+0">5 minutes</option>
                  <option value="5+3">5+3 minutes</option>
                  <option value="10+0">10 minutes</option>
                  <option value="15+10">15+10 minutes</option>
                  <option value="30+0">30 minutes</option>
                </select>
              </div>
              
              <div className="option-group">
                <label>Starting Position</label>
                <select 
                  value={gameConfig.position} 
                  onChange={(e) => handleConfigChange('position', e.target.value)}
                >
                  <option value="start">Standard position</option>
                  <option value="rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1">After 1.e4</option>
                  <option value="rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2">After 1.e4 e5</option>
                  <option value="rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2">After 1.e4 e5 2.Nf3</option>
                </select>
              </div>
            </div>
            
            <div className="online-players">
              <h4>Online Players</h4>
              
              {loading ? (
                <div className="loading-indicator">Loading players...</div>
              ) : onlineOpponents.length === 0 ? (
                <div className="no-players">No players online at the moment</div>
              ) : (
                <div className="players-list">
                  {onlineOpponents.map(player => (
                    <div key={player.id} className="player-item">
                      <div className="player-info">
                        <span className={`status-dot ${player.online ? 'online' : 'offline'}`}></span>
                        <span className="player-name">{player.name}</span>
                        <span className="player-rating">{player.rating || 1200}</span>
                      </div>
                      <button 
                        className="invite-btn"
                        onClick={() => handleInvitePlayer(player)}
                        disabled={!player.online}
                      >
                        {player.online ? 'Invite' : 'Offline'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        {playMode === 'analysis' && (
          <div className="analysis-options">
            <h3>Analysis Board</h3>
            <p>Analyze positions, test ideas, and explore variations with engine assistance.</p>
            
            <div className="option-group">
              <label>Engine Analysis Depth</label>
              <div className="range-with-value">
                <input 
                  type="range" 
                  min="10" 
                  max="22" 
                  value={engineLevel} 
                  onChange={handleEngineLevel} 
                />
                <span className="range-value">{engineLevel}</span>
              </div>
            </div>
            
            <div className="option-group">
              <label>Starting Position</label>
              <select 
                value={gameConfig.position} 
                onChange={(e) => handleConfigChange('position', e.target.value)}
              >
                <option value="start">Standard position</option>
                <option value="rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1">After 1.e4</option>
                <option value="rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2">After 1.e4 e5</option>
                <option value="rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2">After 1.e4 e5 2.Nf3</option>
                <option value="r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3">Ruy Lopez position</option>
                <option value="8/8/8/8/8/4k3/4p3/4K2R w K - 0 1">Rook endgame</option>
              </select>
            </div>
            
            <button 
              className="start-game-btn" 
              onClick={() => setCurrentGame({
                id: 'analysis-' + Date.now(),
                fen: gameConfig.position,
                analysis: true,
                engineLevel: engineLevel
              })}
            >
              Start Analysis
            </button>
          </div>
        )}
      </div>
    );
  };

  // Render game interface
  const renderGame = () => {
    if (!currentGame) return null;
    
    return (
      <div className="game-interface">
        {currentGame.opponent && (
          <div className="game-header">
            <h3>
              {playMode === 'vs-computer' 
                ? `Playing against Stockfish Level ${engineLevel}` 
                : `Playing against ${currentGame.opponent.name}`}
            </h3>
            <div className="game-info">
              <span>Color: {currentGame.playerColor}</span>
              {currentGame.timeControl !== 'no-limit' && (
                <span>Time: {currentGame.timeControl}</span>
              )}
            </div>
          </div>
        )}
        
        <div className="game-board-container">
          <ChessBoard 
            position={currentGame.fen === 'start' ? undefined : currentGame.fen}
            orientation={currentGame.playerColor || 'white'}
            allowMoves={true}
            showHistory={true}
            showAnalysis={currentGame.analysis}
            playMode={playMode === 'vs-computer' ? 'vs-ai' : playMode === 'vs-player' ? 'vs-human' : 'analysis'}
            onMove={handleGameMove}
            engineLevel={currentGame.engineLevel}
            width={650}
            gameOverState={gameOver}
          />
        </div>
        
        <div className="game-controls">
          <button 
            className="resign-btn"
            onClick={() => {
              // If it's a real game, handle resignation through API
              if (currentGame.id && !currentGame.id.startsWith('comp-') && !currentGame.id.startsWith('analysis-')) {
                // Handle real game resignation here
                ApiService.saveGameResult(currentGame.id, {
                  result: currentGame.playerColor === 'white' ? '0-1' : '1-0',
                  reason: 'resignation'
                }).catch(console.error);
              }
              setCurrentGame(null);
            }}
          >
            {playMode === 'analysis' ? 'Exit Analysis' : 'Resign Game'}
          </button>
          
          <button 
            className="flip-board-btn"
            onClick={() => {
              if (currentGame.playerColor) {
                setCurrentGame({
                  ...currentGame,
                  playerColor: currentGame.playerColor === 'white' ? 'black' : 'white'
                });
              }
            }}
          >
            Flip Board
          </button>
          
          {playMode !== 'analysis' && (
            <button 
              className="offer-draw-btn"
              onClick={() => {
                // Handle draw offer through API for real games
                if (currentGame.id && !currentGame.id.startsWith('comp-')) {
                  // For now, just log the action
                  console.log('Draw offered for game:', currentGame.id);
                  alert('Draw offers are not implemented yet for online games.');
                } else if (currentGame.id && currentGame.id.startsWith('comp-')) {
                  // For computer games, simulate accepting/declining based on position evaluation
                  // For simplicity, let's say computer accepts 25% of the time
                  if (Math.random() < 0.25) {
                    alert('Computer accepts your draw offer.');
                    setGameOver({
                      isOver: true,
                      result: '½-½',
                      reason: 'agreement'
                    });
                    
                    // Update current game state
                    setCurrentGame({
                      ...currentGame,
                      result: 'draw',
                      status: 'completed'
                    });
                  } else {
                    alert('Computer declines your draw offer.');
                  }
                }
              }}
            >
              Offer Draw
            </button>
          )}
        </div>
      </div>
    );
  };

  // Render invite confirmation dialog
  const renderInviteDialog = () => {
    if (!invitingUser) return null;
    
    return (
      <div className="modal-overlay">
        <div className="modal-content invite-dialog">
          <h3>Send Invite to {invitingUser.name}</h3>
          <p>Challenge {invitingUser.name} ({invitingUser.rating || 1200}) to a game?</p>
          
          <div className="invite-config">
            <div>
              <strong>Time Control:</strong> {gameConfig.timeControl}
            </div>
            <div>
              <strong>Your Color:</strong> {gameConfig.color === 'random' ? 'Random' : gameConfig.color}
            </div>
            <div>
              <strong>Starting Position:</strong> {gameConfig.position === 'start' ? 'Standard' : 'Custom'}
            </div>
          </div>
          
          <div className="modal-actions">
            <button onClick={() => setInvitingUser(null)} className="cancel-btn">
              Cancel
            </button>
            <button onClick={handleConfirmInvite} className="confirm-btn">
              Send Invite
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render waiting for opponent screen
  const renderWaitingScreen = () => {
    if (!waitingForOpponent) return null;
    
    return (
      <div className="modal-overlay">
        <div className="modal-content waiting-dialog">
          <div className="loading-spinner"></div>
          <h3>Waiting for response...</h3>
          <p>Invite sent to {invitingUser ? invitingUser.name : 'opponent'}</p>
          <button 
            onClick={() => {
              setWaitingForOpponent(false);
              // Cancel the challenge through API
              const pendingChallenge = JSON.parse(localStorage.getItem('pendingChallenge') || '{}');
              if (pendingChallenge.id) {
                ApiService.respondToChallenge(pendingChallenge.id, false)
                  .catch(console.error);
                localStorage.removeItem('pendingChallenge');
              }
            }} 
            className="cancel-btn"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="interactive-board-container">
      <h1>Interactive Chess Board</h1>
      
      <div className="board-content">
        {currentGame ? renderGame() : renderGameSetup()}
      </div>
      
      {renderInviteDialog()}
      {renderWaitingScreen()}
    </div>
  );
};

export default InteractiveBoard;
