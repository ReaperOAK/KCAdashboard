import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ChessBoard from '../../components/chess/ChessBoard';
import SimulBoard from '../../components/chess/SimulBoard';
import './SimulGames.css';

const SimulGames = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeSimuls, setActiveSimuls] = useState([]);
  const [yourSimuls, setYourSimuls] = useState([]);
  const [openSimuls, setOpenSimuls] = useState([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewSimul, setViewSimul] = useState(null);
  const [hostingSimul, setHostingSimul] = useState(null);
  const [activeBoardId, setActiveBoardId] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // New simul form data
  const [newSimul, setNewSimul] = useState({
    title: '',
    description: '',
    maxBoards: 5,
    timeControl: 10
  });

  // Fetch simuls data
  useEffect(() => {
    const fetchSimuls = async () => {
      try {
        setLoading(true);
        
        // In a real implementation, these would be API calls
        // For now, using mock data
        
        // Mock simul data
        const mockActiveSimuls = user.role === 'student' ? [
          {
            id: 1,
            title: 'Weekly Practice Simul',
            host: {
              id: 101,
              name: 'Alex Trainer'
            },
            currentPlayers: 4,
            maxPlayers: 5,
            status: 'in_progress',
            timeControl: 15,
            startTime: new Date(Date.now() - 30 * 60000).toISOString()
          }
        ] : [];
        
        const mockYourSimuls = user.role === 'teacher' ? [
          {
            id: 2,
            title: 'Training Simul for Beginners',
            description: 'Practice basic openings and tactics',
            currentPlayers: 3,
            maxPlayers: 6,
            status: 'in_progress',
            timeControl: 10,
            startTime: new Date(Date.now() - 15 * 60000).toISOString(),
            boards: [
              {
                id: 1,
                opponentName: 'Michael Student',
                position: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
                result: null
              },
              {
                id: 2,
                opponentName: 'Sarah Learner',
                position: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
                result: null
              },
              {
                id: 3,
                opponentName: 'David Beginner',
                position: 'rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
                result: null
              }
            ]
          }
        ] : [];
        
        const mockOpenSimuls = [
          {
            id: 3,
            title: 'Advanced Tactics Training',
            host: {
              id: 102,
              name: 'Grandmaster Sergey'
            },
            currentPlayers: 2,
            maxPlayers: 8,
            status: 'open',
            timeControl: 15,
            startTime: null
          },
          {
            id: 4,
            title: 'Endgame Practice Session',
            host: {
              id: 103,
              name: 'Coach Emily'
            },
            currentPlayers: 3,
            maxPlayers: 5,
            status: 'open',
            timeControl: 10,
            startTime: null
          }
        ];
        
        setActiveSimuls(mockActiveSimuls);
        setYourSimuls(mockYourSimuls);
        setOpenSimuls(mockOpenSimuls);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching simuls:', error);
        setLoading(false);
      }
    };
    
    fetchSimuls();
  }, [user]);

  // Handle joining a simul
  const handleJoinSimul = async (simulId) => {
    try {
      // In a real implementation, this would be an API call
      // For now, using mock behavior
      alert(`Joined simul ${simulId}`);
      
      // Redirect to the simul view
      navigate(`/chess/simul/${simulId}`);
    } catch (error) {
      console.error('Error joining simul:', error);
    }
  };

  // Handle creating a new simul
  const handleCreateSimul = async (e) => {
    e.preventDefault();
    try {
      // In a real implementation, this would be an API call
      // For now, using mock behavior
      
      const newSimulData = {
        id: Math.floor(Math.random() * 1000),
        title: newSimul.title,
        description: newSimul.description,
        maxPlayers: newSimul.maxBoards,
        currentPlayers: 0,
        status: 'open',
        timeControl: newSimul.timeControl,
        startTime: null,
        boards: []
      };
      
      setYourSimuls([...yourSimuls, newSimulData]);
      setCreateModalOpen(false);
      
      // Reset form
      setNewSimul({
        title: '',
        description: '',
        maxBoards: 5,
        timeControl: 10
      });
      
      alert('Simul created successfully!');
    } catch (error) {
      console.error('Error creating simul:', error);
    }
  };

  // Handle viewing a simul as a participant
  const handleViewSimul = (simul) => {
    setViewSimul(simul);
  };

  // Handle hosting a simul as a teacher
  const handleHostSimul = (simul) => {
    setHostingSimul(simul);
    if (simul.boards && simul.boards.length > 0) {
      setActiveBoardId(simul.boards[0].id);
    }
  };

  // Handle making a move in a simul board
  const handleSimulMove = (boardId, move, fen) => {
    if (!hostingSimul) return;
    
    // Update the board position
    const updatedBoards = hostingSimul.boards.map(board => 
      board.id === boardId ? { ...board, position: fen } : board
    );
    
    setHostingSimul({ ...hostingSimul, boards: updatedBoards });
    
    // In a real implementation, this would include an API call to update the position
  };

  // Format time control for display
  const formatTimeControl = (minutes) => {
    return `${minutes} minutes`;
  };

  // Format start time for display
  const formatStartTime = (isoString) => {
    if (!isoString) return 'Not started';
    
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Render the create simul modal
  const renderCreateModal = () => {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>Create New Simul</h2>
          <form onSubmit={handleCreateSimul}>
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input 
                type="text" 
                id="title" 
                value={newSimul.title}
                onChange={(e) => setNewSimul({...newSimul, title: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea 
                id="description" 
                value={newSimul.description}
                onChange={(e) => setNewSimul({...newSimul, description: e.target.value})}
                rows="3"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="maxBoards">Maximum Boards</label>
              <input 
                type="number" 
                id="maxBoards" 
                value={newSimul.maxBoards}
                onChange={(e) => setNewSimul({...newSimul, maxBoards: parseInt(e.target.value)})}
                min="1"
                max="20"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="timeControl">Time Control (minutes per player)</label>
              <input 
                type="number" 
                id="timeControl" 
                value={newSimul.timeControl}
                onChange={(e) => setNewSimul({...newSimul, timeControl: parseInt(e.target.value)})}
                min="1"
                required
              />
            </div>
            
            <div className="modal-actions">
              <button type="button" onClick={() => setCreateModalOpen(false)} className="cancel-btn">
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
  };

  // Render the view for a simul as a participant
  const renderViewSimul = () => {
    if (!viewSimul) return null;
    
    return (
      <div className="simul-details-container">
        <div className="simul-header">
          <h2>{viewSimul.title}</h2>
          <button onClick={() => setViewSimul(null)} className="close-btn">
            &times;
          </button>
        </div>
        
        <div className="simul-info">
          <div>
            <strong>Host:</strong> {viewSimul.host?.name || 'Unknown'}
          </div>
          <div>
            <strong>Players:</strong> {viewSimul.currentPlayers}/{viewSimul.maxPlayers}
          </div>
          <div>
            <strong>Time Control:</strong> {formatTimeControl(viewSimul.timeControl)}
          </div>
          <div>
            <strong>Started:</strong> {formatStartTime(viewSimul.startTime)}
          </div>
        </div>
        
        <div className="chess-board-wrapper">
          <ChessBoard 
            orientation="black"
            allowMoves={true}
            showHistory={true}
            showAnalysis={false}
            width={500}
          />
        </div>
      </div>
    );
  };

  // Render the view for hosting a simul as a teacher
  const renderHostSimul = () => {
    if (!hostingSimul) return null;
    
    const activeBoard = hostingSimul.boards.find(board => board.id === activeBoardId);
    
    return (
      <div className="host-simul-container">
        <div className="simul-header">
          <h2>Hosting: {hostingSimul.title}</h2>
          <button onClick={() => setHostingSimul(null)} className="close-btn">
            &times;
          </button>
        </div>
        
        <div className="host-simul-content">
          <div className="main-board-container">
            <h3>Playing against: {activeBoard?.opponentName || 'Select a board'}</h3>
            
            {activeBoard && (
              <ChessBoard 
                position={activeBoard.position}
                orientation="white"
                allowMoves={true}
                showHistory={true}
                showAnalysis={false}
                playMode="analysis"
                onMove={(move, fen) => handleSimulMove(activeBoardId, move, fen)}
                width={560}
              />
            )}
          </div>
          
          <div className="small-boards-container">
            <h3>All Games</h3>
            <div className="small-boards-grid">
              {hostingSimul.boards.map(board => (
                <SimulBoard
                  key={board.id}
                  id={board.id}
                  position={board.position}
                  orientation="white"
                  allowMoves={activeBoardId === board.id}
                  onMove={handleSimulMove}
                  opponentName={board.opponentName}
                  isActive={activeBoardId === board.id}
                  onBoardSelect={(id) => setActiveBoardId(id)}
                  result={board.result}
                  width={240}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Show loading state
  if (loading) {
    return (
      <div className="simul-games-container">
        <h1>Simultaneous Exhibitions</h1>
        <div className="loading">Loading simul games...</div>
      </div>
    );
  }

  // If viewing or hosting a simul, show that view
  if (viewSimul) return renderViewSimul();
  if (hostingSimul) return renderHostSimul();

  // Main simul games listing view
  return (
    <div className="simul-games-container">
      <h1>Simultaneous Exhibitions</h1>
      
      <div className="simul-description">
        <p>Simul games allow a teacher to play against multiple students simultaneously. Join an existing simul or create your own if you're a teacher.</p>
      </div>
      
      {user.role === 'teacher' && (
        <div className="create-simul-section">
          <button onClick={() => setCreateModalOpen(true)} className="create-simul-btn">
            Create New Simul
          </button>
        </div>
      )}
      
      {activeSimuls.length > 0 && (
        <div className="simul-section">
          <h2>Your Active Simuls</h2>
          <div className="simul-cards">
            {activeSimuls.map(simul => (
              <div key={simul.id} className="simul-card">
                <h3>{simul.title}</h3>
                <div className="simul-card-info">
                  <div><strong>Host:</strong> {simul.host.name}</div>
                  <div><strong>Players:</strong> {simul.currentPlayers}/{simul.maxPlayers}</div>
                  <div><strong>Time Control:</strong> {formatTimeControl(simul.timeControl)}</div>
                  <div><strong>Started:</strong> {formatStartTime(simul.startTime)}</div>
                </div>
                <button onClick={() => handleViewSimul(simul)} className="view-simul-btn">
                  Continue Playing
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {yourSimuls.length > 0 && (
        <div className="simul-section">
          <h2>Your Simuls as Host</h2>
          <div className="simul-cards">
            {yourSimuls.map(simul => (
              <div key={simul.id} className="simul-card">
                <h3>{simul.title}</h3>
                <div className="simul-card-info">
                  <div><strong>Players:</strong> {simul.currentPlayers}/{simul.maxPlayers}</div>
                  <div><strong>Status:</strong> {simul.status === 'in_progress' ? 'In Progress' : 'Open'}</div>
                  <div><strong>Time Control:</strong> {formatTimeControl(simul.timeControl)}</div>
                </div>
                <button onClick={() => handleHostSimul(simul)} className="host-simul-btn">
                  {simul.status === 'in_progress' ? 'Continue Hosting' : 'Start Simul'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="simul-section">
        <h2>Open Simuls</h2>
        {openSimuls.length === 0 ? (
          <div className="no-simuls">No open simuls available at the moment.</div>
        ) : (
          <div className="simul-cards">
            {openSimuls.map(simul => (
              <div key={simul.id} className="simul-card">
                <h3>{simul.title}</h3>
                <div className="simul-card-info">
                  <div><strong>Host:</strong> {simul.host.name}</div>
                  <div><strong>Players:</strong> {simul.currentPlayers}/{simul.maxPlayers}</div>
                  <div><strong>Time Control:</strong> {formatTimeControl(simul.timeControl)}</div>
                </div>
                <button 
                  onClick={() => handleJoinSimul(simul.id)} 
                  className="join-simul-btn"
                  disabled={simul.currentPlayers >= simul.maxPlayers}
                >
                  {simul.currentPlayers >= simul.maxPlayers ? 'Full' : 'Join Simul'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {createModalOpen && renderCreateModal()}
    </div>
  );
};

export default SimulGames;
