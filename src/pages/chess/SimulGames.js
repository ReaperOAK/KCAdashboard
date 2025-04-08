import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import ChessBoard from '../../components/chess/ChessBoard';
import SimulBoard from '../../components/chess/SimulBoard';
import ApiService from '../../utils/api';
import './SimulGames.css';

const SimulGames = () => {
  const { user } = useAuth();
  const [simulGames, setSimulGames] = useState([]);
  const [activeSimul, setActiveSimul] = useState(null);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreatingSimul, setIsCreatingSimul] = useState(false);
  const [newSimulConfig, setNewSimulConfig] = useState({
    maxPlayers: 5,
    timeControl: '10+5',
    description: ''
  });

  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';

  // Fetch simul games on mount
  useEffect(() => {
    fetchSimulGames();
  }, []);

  const fetchSimulGames = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ApiService.getSimulGames();
      setSimulGames(response.simuls || []);
    } catch (err) {
      setError('Failed to load simul games: ' + err.message);
      console.error('Error fetching simul games:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle clicking on a simul game
  const handleSimulClick = async (simul) => {
    try {
      setLoading(true);
      const response = await ApiService.getStudyDetails(simul.id);
      setActiveSimul({
        ...simul,
        boards: response.boards || []
      });
      
      // Select the first board by default if any exist
      if (response.boards && response.boards.length > 0) {
        setSelectedBoard(response.boards[0].id);
      }
    } catch (err) {
      setError('Failed to load simul details: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle board selection in simul
  const handleBoardSelect = (boardId) => {
    setSelectedBoard(boardId);
  };

  // Handle move on a simul board
  const handleSimulMove = async (boardId, move, fen) => {
    if (!activeSimul) return;
    
    try {
      await ApiService.makeSimulMove(activeSimul.id, boardId, move, fen);
      
      // Update the local state to reflect the move
      setActiveSimul(prev => ({
        ...prev,
        boards: prev.boards.map(board => 
          board.id === boardId 
            ? { ...board, position: fen } 
            : board
        )
      }));
    } catch (err) {
      console.error('Error making move:', err);
      setError('Failed to make move: ' + err.message);
    }
  };

  // Handle creating a new simul game
  const handleCreateSimul = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await ApiService.createSimulGame(newSimulConfig);
      setIsCreatingSimul(false);
      
      // Navigate to the newly created simul
      setActiveSimul({
        ...response.simul,
        boards: []
      });
      
      // Refresh the list of simuls
      fetchSimulGames();
    } catch (err) {
      setError('Failed to create simul: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle joining a simul game
  const handleJoinSimul = async (simulId) => {
    try {
      setLoading(true);
      await ApiService.joinSimulGame(simulId);
      // Refresh the simul to show the new board
      const simul = simulGames.find(s => s.id === simulId);
      if (simul) {
        await handleSimulClick(simul);
      }
    } catch (err) {
      setError('Failed to join simul: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Find the currently selected board
  const selectedBoardData = activeSimul?.boards?.find(
    board => board.id === selectedBoard
  );

  // Render create simul form
  const renderCreateSimulForm = () => (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Create Simultaneous Exhibition</h2>
        <form onSubmit={handleCreateSimul}>
          <div className="form-group">
            <label htmlFor="maxPlayers">Maximum Players</label>
            <input 
              type="number" 
              id="maxPlayers" 
              min="1" 
              max="20" 
              value={newSimulConfig.maxPlayers}
              onChange={(e) => setNewSimulConfig({
                ...newSimulConfig, 
                maxPlayers: parseInt(e.target.value)
              })}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="timeControl">Time Control</label>
            <select 
              id="timeControl" 
              value={newSimulConfig.timeControl}
              onChange={(e) => setNewSimulConfig({
                ...newSimulConfig, 
                timeControl: e.target.value
              })}
            >
              <option value="5+0">5 minutes</option>
              <option value="10+0">10 minutes</option>
              <option value="10+5">10 minutes + 5 seconds increment</option>
              <option value="15+10">15 minutes + 10 seconds increment</option>
              <option value="30+0">30 minutes</option>
              <option value="60+0">60 minutes</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea 
              id="description" 
              value={newSimulConfig.description}
              onChange={(e) => setNewSimulConfig({
                ...newSimulConfig, 
                description: e.target.value
              })}
              rows="3"
            />
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => setIsCreatingSimul(false)} 
              className="cancel-btn"
            >
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              Create Simul
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Render simul games list
  const renderSimulList = () => (
    <div className="simul-list-container">
      <header className="simul-header">
        <h1>Simultaneous Exhibitions</h1>
        {isTeacher && (
          <button 
            onClick={() => setIsCreatingSimul(true)} 
            className="create-simul-btn"
          >
            Create Simul
          </button>
        )}
      </header>

      {loading ? (
        <div className="loading-indicator">Loading simul games...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : simulGames.length === 0 ? (
        <div className="no-simuls">
          <p>No simultaneous exhibitions are currently available.</p>
          {isTeacher && (
            <button 
              onClick={() => setIsCreatingSimul(true)} 
              className="create-first-simul-btn"
            >
              Create your first simul
            </button>
          )}
        </div>
      ) : (
        <div className="simul-grid">
          {simulGames.map(simul => (
            <div 
              key={simul.id} 
              className={`simul-card ${simul.status}`}
              onClick={() => handleSimulClick(simul)}
            >
              <div className="simul-card-header">
                <h3>{simul.title || `Simul by ${simul.host.name}`}</h3>
                <span className={`simul-status ${simul.status}`}>
                  {simul.status.charAt(0).toUpperCase() + simul.status.slice(1)}
                </span>
              </div>
              
              <div className="simul-card-content">
                <div className="simul-details">
                  <div className="simul-host">
                    <span className="label">Host:</span>
                    <span className="value">{simul.host.name}</span>
                  </div>
                  <div className="simul-players">
                    <span className="label">Players:</span>
                    <span className="value">{simul.player_count} / {simul.max_players}</span>
                  </div>
                  <div className="simul-time">
                    <span className="label">Time Control:</span>
                    <span className="value">{simul.time_control}</span>
                  </div>
                  <div className="simul-date">
                    <span className="label">Created:</span>
                    <span className="value">{new Date(simul.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                
                {simul.description && (
                  <p className="simul-description">{simul.description}</p>
                )}
              </div>
              
              <div className="simul-card-footer">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSimulClick(simul);
                  }} 
                  className="view-btn"
                >
                  View
                </button>
                
                {simul.status === 'active' && simul.host.id !== user.id && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleJoinSimul(simul.id);
                    }} 
                    className="join-btn"
                    disabled={simul.player_count >= simul.max_players}
                  >
                    Join
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Render active simul view
  const renderActiveSimul = () => (
    <div className="active-simul-container">
      <div className="simul-header">
        <div>
          <h1>{activeSimul.title || `Simul by ${activeSimul.host.name}`}</h1>
          <div className="simul-meta">
            <span>Host: {activeSimul.host.name}</span>
            <span>Players: {activeSimul.boards.length} / {activeSimul.max_players}</span>
            <span>Time Control: {activeSimul.time_control}</span>
          </div>
        </div>
        <button 
          onClick={() => setActiveSimul(null)} 
          className="back-button"
        >
          Back to Simul List
        </button>
      </div>

      <div className="simul-content">
        <div className="simul-boards-container">
          <h2>Boards</h2>
          <div className="simul-boards-grid">
            {activeSimul.boards.map(board => (
              <SimulBoard
                key={board.id}
                id={board.id}
                position={board.position}
                orientation={activeSimul.host.id === user.id ? 'white' : 'black'}
                allowMoves={
                  (activeSimul.host.id === user.id) || 
                  (board.player_id === user.id)
                }
                opponentName={board.player_name}
                width={200}
                isActive={selectedBoard === board.id}
                onBoardSelect={handleBoardSelect}
                result={board.result}
              />
            ))}
            
            {/* Show placeholder for empty slots */}
            {Array.from({ length: activeSimul.max_players - activeSimul.boards.length }).map((_, idx) => (
              <div key={`empty-${idx}`} className="empty-board-slot">
                <div className="empty-slot-text">
                  Empty Slot
                </div>
                {activeSimul.status === 'active' && activeSimul.host.id !== user.id && (
                  <button 
                    onClick={() => handleJoinSimul(activeSimul.id)} 
                    className="join-btn"
                  >
                    Join
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {selectedBoardData && (
          <div className="active-board-container">
            <h2>
              {activeSimul.host.id === user.id 
                ? `Playing against ${selectedBoardData.player_name}` 
                : `Playing against ${activeSimul.host.name}`}
            </h2>
            
            <ChessBoard
              position={selectedBoardData.position}
              orientation={activeSimul.host.id === user.id ? 'white' : 'black'}
              allowMoves={
                (activeSimul.host.id === user.id && selectedBoardData.turn === 'w') || 
                (selectedBoardData.player_id === user.id && selectedBoardData.turn === 'b')
              }
              showHistory={true}
              showAnalysis={false}
              onMove={(move, fen) => handleSimulMove(selectedBoardData.id, move, fen)}
              width={500}
            />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="simul-games-container">
      {isCreatingSimul && renderCreateSimulForm()}
      {activeSimul ? renderActiveSimul() : renderSimulList()}
    </div>
  );
};

export default SimulGames;
