import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import SimulBoard from '../../components/chess/SimulBoard';
import ChessNavigation from '../../components/chess/ChessNavigation';
import ApiService from '../../utils/api';
import './SimulGames.css';

const SimulGames = () => {
  const { user } = useAuth();
  const [simuls, setSimuls] = useState([]);
  const [activeSimul, setActiveSimul] = useState(null);
  const [activeBoardId, setActiveBoardId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    maxPlayers: 5,
    timeControl: '30+0'
  });

  // Define loadSimuls and refreshActiveSimul with useCallback to prevent recreation on every render
  const loadSimuls = useCallback(async () => {
    try {
      setLoading(true);
      const response = await ApiService.getSimulGames();
      
      if (response.success) {
        setSimuls(response.simuls || []);
      } else {
        setError('Failed to load simultaneous games');
      }
    } catch (error) {
      setError(error.message || 'An error occurred while loading simuls');
    } finally {
      setLoading(false);
    }
  }, []);
  
  const refreshActiveSimul = useCallback(async () => {
    if (!activeSimul) return;
    
    try {
      const response = await ApiService.getSimulGames();
      
      if (response.success) {
        // Update all simuls
        setSimuls(response.simuls || []);
        
        // Find and update the active simul
        const updatedSimul = response.simuls.find(s => s.id === activeSimul.id);
        if (updatedSimul) {
          setActiveSimul(updatedSimul);
          
          // If active board is no longer in the list, select the first available board
          if (activeBoardId && 
              updatedSimul.boards && 
              !updatedSimul.boards.find(b => b.id === activeBoardId)) {
            setActiveBoardId(updatedSimul.boards.length > 0 ? updatedSimul.boards[0].id : null);
          }
        }
      }
    } catch (error) {
      console.error('Failed to refresh simul:', error);
    }
  }, [activeSimul, activeBoardId]);

  // Load simul games
  useEffect(() => {
    loadSimuls();
    
    // Set up auto-refresh for active games
    const interval = setInterval(() => {
      if (activeSimul) {
        refreshActiveSimul();
      } else {
        loadSimuls();
      }
    }, 1000); // Refresh every 1 seconds
    
    // Cleanup on unmount
    return () => {
      clearInterval(interval); // Clear the interval created in this effect
    };
  }, [activeSimul, refreshActiveSimul, loadSimuls]);

  // Handle simul creation
  const handleCreateSimul = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await ApiService.createSimulGame(createForm);
      
      if (response.success) {
        setSimuls([response.simul, ...simuls]);
        setIsCreating(false);
        setCreateForm({
          title: '',
          description: '',
          maxPlayers: 5,
          timeControl: '30+0'
        });
      } else {
        setError('Failed to create simul game');
      }
    } catch (error) {
      setError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Handle simul selection
  const handleSelectSimul = (simul) => {
    setActiveSimul(simul);
    setActiveBoardId(simul.boards && simul.boards.length > 0 ? simul.boards[0].id : null);
  };

  // Handle joining a simul
  const handleJoinSimul = async (simulId) => {
    try {
      setLoading(true);
      const response = await ApiService.joinSimulGame(simulId);
      
      if (response.success) {
        // Find the simul in the list and select it
        const joinedSimul = simuls.find(s => s.id === simulId);
        if (joinedSimul) {
          handleSelectSimul(response.simul || joinedSimul);
        }
      } else {
        setError('Failed to join simul');
      }
    } catch (error) {
      setError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Handle starting a simul (for host)
  const handleStartSimul = async (simulId) => {
    try {
      setLoading(true);
      const response = await ApiService.post('/chess/start-simul.php', { simul_id: simulId });
      
      if (response.success) {
        await refreshActiveSimul();
      } else {
        setError('Failed to start simul');
      }
    } catch (error) {
      setError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Handle ending a simul (for host)
  const handleEndSimul = async (simulId) => {
    try {
      setLoading(true);
      const response = await ApiService.post('/chess/end-simul.php', { simul_id: simulId });
      
      if (response.success) {
        await refreshActiveSimul();
      } else {
        setError('Failed to end simul');
      }
    } catch (error) {
      setError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Handle making a move in a simul board
  const handleMove = async (boardId, move, position) => {
    if (!activeSimul || !boardId) return;
    
    try {
      // Send move to the server
      await ApiService.makeSimulMove(activeSimul.id, boardId, move, position);
      
      // Refresh the board state
      await refreshActiveSimul();
    } catch (error) {
      console.error('Move error:', error);
      setError('Failed to make move: ' + error.message);
    }
  };

  if (loading && !activeSimul && simuls.length === 0) {
    return (
      <div className="simul-games-page">
        <h1>Simultaneous Exhibitions</h1>
        <ChessNavigation />
        <div className="loading">Loading simul games...</div>
      </div>
    );
  }

  // Render create simul form
  if (isCreating) {
    return (
      <div className="simul-games-page">
        <h1>Create Simultaneous Exhibition</h1>
        
        <ChessNavigation />
        
        <div className="simul-form-container">
          <form onSubmit={handleCreateSimul} className="simul-form">
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={createForm.title}
                onChange={(e) => setCreateForm({...createForm, title: e.target.value})}
                placeholder="e.g., Saturday Simul with Coach Adam"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={createForm.description}
                onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                placeholder="Add details about this simul exhibition"
                rows="3"
              />
            </div>
            
            <div className="form-group">
              <label>Max Players</label>
              <input
                type="number"
                min="1"
                max="20"
                value={createForm.maxPlayers}
                onChange={(e) => setCreateForm({...createForm, maxPlayers: parseInt(e.target.value)})}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Time Control</label>
              <select
                value={createForm.timeControl}
                onChange={(e) => setCreateForm({...createForm, timeControl: e.target.value})}
              >
                <option value="30+0">30 minutes</option>
                <option value="15+10">15 minutes + 10 seconds</option>
                <option value="10+5">10 minutes + 5 seconds</option>
                <option value="5+3">5 minutes + 3 seconds</option>
              </select>
            </div>
            
            <div className="form-actions">
              <button type="button" onClick={() => setIsCreating(false)} className="cancel-btn">
                Cancel
              </button>
              <button type="submit" className="create-btn">
                Create Simul
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Render simul board view if a simul is selected
  if (activeSimul) {
    const isHost = activeSimul.host.id === user.id;
    const boards = activeSimul.boards || [];
    const activeBoard = boards.find(b => b.id === activeBoardId);
    
    return (
      <div className="simul-games-page">
        <h1>{activeSimul.title || `Simul by ${activeSimul.host.name}`}</h1>
        {activeSimul.description && (
          <p className="simul-description">{activeSimul.description}</p>
        )}
        
        <ChessNavigation />
        
        <div className="simul-details">
          <div className="simul-info">
            <p><strong>Host:</strong> {activeSimul.host.name}</p>
            <p><strong>Status:</strong> {activeSimul.status}</p>
            <p><strong>Time Control:</strong> {activeSimul.time_control}</p>
            <p><strong>Players:</strong> {boards.length}/{activeSimul.max_players}</p>
            
            <button onClick={() => setActiveSimul(null)} className="back-btn">
              Back to Simuls
            </button>
            
            {isHost && activeSimul.status === 'pending' && boards.length > 0 && (
              <button onClick={() => handleStartSimul(activeSimul.id)} className="start-btn">
                Start Simul
              </button>
            )}
            
            {isHost && activeSimul.status === 'active' && (
              <button onClick={() => handleEndSimul(activeSimul.id)} className="end-btn">
                End Simul
              </button>
            )}
          </div>
          
          <div className="simul-boards-container">
            {boards.length > 0 ? (
              <>
                <div className="board-thumbnails">
                  {boards.map(board => {
                    // Determine if this board is the host's turn
                    const isHostTurn = board.turn === 'w';
                    // Determine if this board has a result
                    const hasResult = board.result !== null;
                    
                    return (
                      <div 
                        key={board.id}
                        className={`board-thumbnail ${board.id === activeBoardId ? 'active' : ''} ${hasResult ? 'completed' : ''} ${isHostTurn ? 'host-turn' : 'player-turn'}`}
                        onClick={() => setActiveBoardId(board.id)}
                      >
                        <div className="thumbnail-name">{board.player_name}</div>
                        {hasResult && (
                          <div className="thumbnail-result">
                            {board.result === '1-0' ? 'Host won' : 
                             board.result === '0-1' ? 'Player won' : 'Draw'}
                          </div>
                        )}
                        {!hasResult && (
                          <div className="thumbnail-turn">
                            {isHostTurn ? 'Host to move' : 'Player to move'}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                <div className="active-board">
                  {activeBoard ? (
                    <SimulBoard
                      id={activeBoard.id}
                      position={activeBoard.position}
                      orientation={isHost ? 'white' : 'black'}
                      allowMoves={
                        activeSimul.status === 'active' && (
                          (isHost && activeBoard.turn === 'w') || 
                          (!isHost && activeBoard.turn === 'b' && activeBoard.player_id === user.id)
                        )
                      }
                      onMove={handleMove}
                      opponentName={isHost ? activeBoard.player_name : activeSimul.host.name}
                      width={600}
                      isActive={true}
                      result={activeBoard.result}
                    />
                  ) : (
                    <div className="no-active-board">
                      <p>Select a board to view</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="no-boards">
                <p>No players have joined this simul yet.</p>
                {activeSimul.status === 'pending' && !isHost && (
                  <button onClick={() => handleJoinSimul(activeSimul.id)} className="join-btn">
                    Join This Simul
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render simul list
  return (
    <div className="simul-games-page">
      <h1>Simultaneous Exhibitions</h1>
      
      <ChessNavigation />
      
      {(user.role === 'teacher' || user.role === 'admin') && (
        <div className="simul-actions">
          <button onClick={() => setIsCreating(true)} className="create-simul-btn">
            Create Simul
          </button>
        </div>
      )}
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="simul-list">
        {simuls.length === 0 ? (
          <div className="no-simuls">
            <p>No simultaneous exhibitions available.</p>
          </div>
        ) : (
          simuls.map(simul => (
            <div key={simul.id} className="simul-card">
              <div className="simul-card-content">
                <h3>{simul.title || `Simul by ${simul.host.name}`}</h3>
                <p className="simul-host">Host: {simul.host.name}</p>
                {simul.description && (
                  <p className="simul-description">{simul.description}</p>
                )}
                <div className="simul-meta">
                  <span className={`simul-status ${simul.status}`}>{simul.status}</span>
                  <span className="simul-players">{simul.player_count || 0}/{simul.max_players} players</span>
                </div>
              </div>
              <div className="simul-card-actions">
                <button onClick={() => handleSelectSimul(simul)} className="view-btn">
                  View
                </button>
                {simul.status === 'pending' && simul.host.id !== user.id && (
                  <button onClick={() => handleJoinSimul(simul.id)} className="join-btn">
                    Join
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SimulGames;
