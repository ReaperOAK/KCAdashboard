import React, { useState, useEffect } from 'react';
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

  // Load simul games
  useEffect(() => {
    const loadSimuls = async () => {
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
    };
    
    loadSimuls();
  }, []);

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
        // Refresh the simul list to show the updated state
        const refreshResponse = await ApiService.getSimulGames();
        if (refreshResponse.success) {
          setSimuls(refreshResponse.simuls || []);
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

  // Handle making a move in a simul board
  const handleMove = async (boardId, move, position) => {
    if (!activeSimul || !activeBoardId) return;
    
    try {
      // Send move to the server
      await ApiService.makeSimulMove(activeSimul.id, boardId, move, position);
      
      // You would typically update the board state here
      // For simplicity, we'll just reload the simul data
      const response = await ApiService.getSimulGames();
      if (response.success) {
        setSimuls(response.simuls || []);
        
        // Update active simul
        const updatedSimul = response.simuls.find(s => s.id === activeSimul.id);
        if (updatedSimul) {
          setActiveSimul(updatedSimul);
        }
      }
    } catch (error) {
      console.error('Move error:', error);
    }
  };

  if (loading && !activeSimul) {
    return <div className="loading">Loading simul games...</div>;
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
                required
              />
            </div>
            
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={createForm.description}
                onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
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
    const activeBoard = activeSimul.boards && activeSimul.boards.find(b => b.id === activeBoardId);
    
    return (
      <div className="simul-games-page">
        <h1>{activeSimul.title}</h1>
        <p className="simul-description">{activeSimul.description}</p>
        
        <ChessNavigation />
        
        <div className="simul-details">
          <div className="simul-info">
            <p><strong>Host:</strong> {activeSimul.host.name}</p>
            <p><strong>Status:</strong> {activeSimul.status}</p>
            <p><strong>Players:</strong> {activeSimul.boards ? activeSimul.boards.length : 0}/{activeSimul.max_players}</p>
            <button onClick={() => setActiveSimul(null)} className="back-btn">
              Back to Simuls
            </button>
          </div>
          
          <div className="simul-boards-container">
            {activeSimul.boards && activeSimul.boards.length > 0 ? (
              <>
                <div className="board-thumbnails">
                  {activeSimul.boards.map(board => (
                    <div 
                      key={board.id}
                      className={`board-thumbnail ${board.id === activeBoardId ? 'active' : ''}`}
                      onClick={() => setActiveBoardId(board.id)}
                    >
                      {board.player.name}
                    </div>
                  ))}
                </div>
                
                <div className="active-board">
                  {activeBoard && (
                    <SimulBoard
                      id={activeBoard.id}
                      position={activeBoard.position}
                      orientation={isHost ? 'white' : 'black'}
                      allowMoves={
                        (isHost && activeBoard.turn === 'w') || 
                        (!isHost && activeBoard.turn === 'b' && activeBoard.player.id === user.id)
                      }
                      onMove={handleMove}
                      opponentName={isHost ? activeBoard.player.name : activeSimul.host.name}
                      width={600}
                      isActive={true}
                      result={activeBoard.result}
                    />
                  )}
                </div>
              </>
            ) : (
              <div className="no-boards">
                <p>No boards available for this simul.</p>
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
      
      <div className="simul-actions">
        <button onClick={() => setIsCreating(true)} className="create-simul-btn">
          Create Simul
        </button>
      </div>
      
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
                <h3>{simul.title}</h3>
                <p className="simul-host">Host: {simul.host.name}</p>
                <p className="simul-description">{simul.description}</p>
                <div className="simul-meta">
                  <span className="simul-status">{simul.status}</span>
                  <span className="simul-players">{simul.player_count}/{simul.max_players} players</span>
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
