import React, { useState, useEffect } from 'react';
import ChessBoard from '../../components/chess/ChessBoard';
import { useAuth } from '../../hooks/useAuth';
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

  // Mock data for online users
  useEffect(() => {
    // This would normally be a websocket or polling connection
    const mockOnlineUsers = [
      { id: 1, name: 'Teacher John', role: 'teacher', online: true, rating: 1850 },
      { id: 2, name: 'Coach Sarah', role: 'teacher', online: true, rating: 2100 },
      { id: 3, name: 'Student Mike', role: 'student', online: true, rating: 1200 },
      { id: 4, name: 'Student Emma', role: 'student', online: false, rating: 1350 }
    ].filter(u => u.id !== user.id); // Don't show current user
    
    setOnlineOpponents(mockOnlineUsers);
  }, [user.id]);

  // Handle play mode change
  const handlePlayModeChange = (mode) => {
    setPlayMode(mode);
    setCurrentGame(null);
  };

  // Handle start game against computer
  const handlePlayComputer = () => {
    setCurrentGame({
      id: 'comp-' + Date.now(),
      opponent: { name: `Stockfish (Level ${engineLevel})`, id: 'computer' },
      playerColor: orientation,
      fen: 'start',
      timeControl: timeControl,
      analysis: showAnalysis,
      engineLevel: engineLevel
    });
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
  const handleConfirmInvite = () => {
    // In a real app, this would send the invite via API
    alert(`Invite sent to ${invitingUser.name}`);
    setInvitingUser(null);
    setWaitingForOpponent(true);
    
    // Mock accepting the invite after a delay
    setTimeout(() => {
      setWaitingForOpponent(false);
      setCurrentGame({
        id: 'game-' + Date.now(),
        opponent: invitingUser,
        playerColor: gameConfig.color === 'random' 
          ? Math.random() > 0.5 ? 'white' : 'black'
          : gameConfig.color,
        fen: gameConfig.position,
        timeControl: gameConfig.timeControl,
        analysis: false,
        engineLevel: 0
      });
    }, 3000);
  };

  // Handle game config change
  const handleConfigChange = (field, value) => {
    setGameConfig({
      ...gameConfig,
      [field]: value
    });
  };

  // Handle game move
  const handleGameMove = (move, fen) => {
    // In a real app, this would send the move to the opponent via API
    console.log('Move made:', move, 'New position:', fen);
    
    // Update current game
    setCurrentGame({
      ...currentGame,
      fen: fen
    });
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
              {onlineOpponents.length === 0 ? (
                <div className="no-players">No players online at the moment</div>
              ) : (
                <div className="players-list">
                  {onlineOpponents.map(player => (
                    <div key={player.id} className="player-item">
                      <div className="player-info">
                        <span className={`status-dot ${player.online ? 'online' : 'offline'}`}></span>
                        <span className="player-name">{player.name}</span>
                        <span className="player-rating">{player.rating}</span>
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
          />
        </div>
        
        <div className="game-controls">
          <button 
            className="resign-btn"
            onClick={() => setCurrentGame(null)}
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
            <button className="offer-draw-btn">
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
          <p>Challenge {invitingUser.name} ({invitingUser.rating}) to a game?</p>
          
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
          <p>Invite sent to {invitingUser.name}</p>
          <button onClick={() => setWaitingForOpponent(false)} className="cancel-btn">
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
