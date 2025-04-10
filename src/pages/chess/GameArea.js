import React, { useState, useEffect } from 'react';
import ChessBoard from '../../components/chess/ChessBoard';
import ApiService from '../../utils/api';
import './GameArea.css';

const GameArea = () => {
  const [activeTab, setActiveTab] = useState('practice');
  const [games, setGames] = useState([]);
  const [practicePositions, setPracticePositions] = useState([]);
  const [activeGame, setActiveGame] = useState(null);
  const [activePractice, setActivePractice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch games
        const gamesResponse = await ApiService.getChessGames();
        if (gamesResponse && gamesResponse.games) {
          setGames(gamesResponse.games);
        }
        
        // Fetch practice positions
        const practiceResponse = await ApiService.getPracticePositions();
        if (practiceResponse && practiceResponse.positions) {
          setPracticePositions(practiceResponse.positions);
        }
      } catch (err) {
        console.error('Error fetching game data:', err);
        setError('Failed to load game data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Filter games
  const filteredGames = games.filter(game => {
    if (filterType !== 'all' && game.status !== filterType) return false;
    if (searchQuery && !game.opponent.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });
  
  // Filter practice positions
  const filteredPractice = practicePositions.filter(pos => {
    if (filterType !== 'all' && pos.type !== filterType) return false;
    if (searchQuery && !pos.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !pos.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });
  
  // Handle game selection
  const handleSelectGame = async (game) => {
    try {
      setLoading(true);
      // Get detailed game data
      const response = await ApiService.getGameDetails(game.id);
      if (response && response.game) {
        setActiveGame(response.game);
        setActivePractice(null);
      }
    } catch (err) {
      setError('Failed to load game details: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle practice position selection
  const handleSelectPractice = (position) => {
    setActivePractice(position);
    setActiveGame(null);
  };
  
  // Handle move in game
  const handleGameMove = async (move, fen) => {
    if (!activeGame) return;
    
    try {
      // Send move to server
      await ApiService.makeGameMove(activeGame.id, move, fen);
      
      // Update local state
      setActiveGame({
        ...activeGame,
        position: fen,
        yourTurn: false,
        lastMove: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error making move:', err);
      setError('Failed to make move: ' + err.message);
    }
  };
  
  // Handle offering a draw
  const handleOfferDraw = async () => {
    if (!activeGame) return;
    
    try {
      await ApiService.saveGameResult(activeGame.id, 'draw-offer');
      alert('Draw offer sent to your opponent');
    } catch (err) {
      setError('Failed to offer draw: ' + err.message);
    }
  };
  
  // Handle resigning a game
  const handleResign = async () => {
    if (!activeGame) return;
    
    if (window.confirm('Are you sure you want to resign this game?')) {
      try {
        await ApiService.saveGameResult(activeGame.id, 'resign');
        alert('You have resigned the game');
        
        // Update local state
        setActiveGame({
          ...activeGame,
          status: 'completed',
          result: 'loss',
          reason: 'resignation'
        });
      } catch (err) {
        setError('Failed to resign game: ' + err.message);
      }
    }
  };
  
  // Format date for display
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  // Format time for display
  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };
  
  // Reset practice position
  const handleResetPosition = () => {
    if (!activePractice) return;
    
    // Just reload the same practice position which effectively resets it
    handleSelectPractice({...activePractice});
  };
  
  // Flip practice board
  const handleFlipBoard = () => {
    if (!activePractice) return;
    
    setActivePractice({
      ...activePractice,
      orientation: activePractice.orientation === 'white' ? 'black' : 'white'
    });
  };
  
  // Start new game
  const handleStartNewGame = () => {
    // Navigate to interactive board with game creation
    window.location.href = '/chess/board';
  };
  
  // Create custom practice position
  const handleCreatePracticePosition = () => {
    // Navigate to interactive board with practice mode
    window.location.href = '/chess/board?mode=analysis';
  };
  
  // Render game board
  const renderGameBoard = () => {
    if (!activeGame) return null;
    
    return (
      <div className="game-board-container">
        <div className="game-board-header">
          <h2>Game vs {activeGame.opponent.name}</h2>
          <div className="game-details">
            <span className="game-type">{activeGame.type}</span>
            <span className="game-status">
              {activeGame.status === 'completed' 
                ? `Result: ${activeGame.result}` 
                : activeGame.yourTurn ? 'Your turn' : 'Opponent\'s turn'}
            </span>
            <span className="last-move">
              Last move: {formatTime(activeGame.lastMove)} on {formatDate(activeGame.lastMove)}
            </span>
          </div>
        </div>
        
        <div className="chess-board-wrapper">
          <ChessBoard 
            position={activeGame.position}
            orientation={activeGame.yourColor}
            allowMoves={activeGame.status === 'active' && activeGame.yourTurn}
            showHistory={true}
            showAnalysis={activeGame.status === 'completed'}
            onMove={handleGameMove}
            width={600}
          />
        </div>
        
        <div className="game-actions">
          <button 
            className="back-btn" 
            onClick={() => setActiveGame(null)}
          >
            Back to Games List
          </button>
          
          {activeGame.status === 'active' && (
            <>
              <button 
                className="offer-draw-btn"
                onClick={handleOfferDraw}
              >
                Offer Draw
              </button>
              <button 
                className="resign-btn"
                onClick={handleResign}
              >
                Resign
              </button>
            </>
          )}
        </div>
      </div>
    );
  };
  
  // Render practice board
  const renderPracticeBoard = () => {
    if (!activePractice) return null;
    
    return (
      <div className="practice-board-container">
        <div className="practice-board-header">
          <h2>{activePractice.title}</h2>
          <div className="practice-details">
            <span className="practice-type">{activePractice.type}</span>
            <span className="practice-difficulty">{activePractice.difficulty}</span>
            <span className="practice-engine">Engine Level: {activePractice.engine_level}</span>
          </div>
          <p className="practice-description">{activePractice.description}</p>
        </div>
        
        <div className="chess-board-wrapper">
          <ChessBoard 
            position={activePractice.position}
            orientation={activePractice.orientation || "white"}
            allowMoves={true}
            showHistory={true}
            showAnalysis={true}
            playMode="vs-ai"
            engineLevel={activePractice.engine_level}
            width={600}
          />
        </div>
        
        <div className="practice-actions">
          <button 
            className="back-btn" 
            onClick={() => setActivePractice(null)}
          >
            Back to Practice List
          </button>
          
          <button 
            className="reset-btn"
            onClick={handleResetPosition}
          >
            Reset Position
          </button>
          <button 
            className="flip-btn"
            onClick={handleFlipBoard}
          >
            Flip Board
          </button>
        </div>
      </div>
    );
  };
  
  // Render games list
  const renderGamesList = () => {
    return (
      <div className="games-list-container">
        <div className="list-header">
          <h2>Your Games</h2>
          <div className="list-controls">
            <div className="search-box">
              <input 
                type="text" 
                placeholder="Search games..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="filter-dropdown">
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Games</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>
        
        {filteredGames.length === 0 ? (
          <div className="no-games">
            <p>No games found.</p>
          </div>
        ) : (
          <div className="games-grid">
            {filteredGames.map(game => (
              <div 
                key={game.id} 
                className={`game-card ${game.status} ${game.yourTurn ? 'your-turn' : ''}`}
                onClick={() => handleSelectGame(game)}
              >
                <div className="game-card-header">
                  <div className="opponent-info">
                    <h3>{game.opponent.name}</h3>
                    <span className="rating">Rating: {game.opponent.rating}</span>
                  </div>
                  <div className="game-status-badge">
                    {game.status === 'active' ? (
                      game.yourTurn ? 'Your Turn' : 'Their Turn'
                    ) : (
                      game.result === 'win' ? 'Victory' : game.result === 'loss' ? 'Defeat' : 'Draw'
                    )}
                  </div>
                </div>
                
                <div className="board-preview">
                  <div className="mini-board" 
                    style={{ backgroundImage: game.preview_url 
                      ? `url(${game.preview_url})` 
                      : `url(/images/mini-boards/default.png)` 
                    }}
                  ></div>
                </div>
                
                <div className="game-card-footer">
                  <span className="game-type">{game.type}</span>
                  <span className="last-move">
                    {game.status === 'active' ? 'Last move: ' : ''}
                    {formatDate(game.lastMove)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="new-game-actions">
          <button 
            className="new-game-btn"
            onClick={handleStartNewGame}
          >
            Start New Game
          </button>
        </div>
      </div>
    );
  };
  
  // Render practice list
  const renderPracticeList = () => {
    return (
      <div className="practice-list-container">
        <div className="list-header">
          <h2>Practice Positions</h2>
          <div className="list-controls">
            <div className="search-box">
              <input 
                type="text" 
                placeholder="Search practice positions..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="filter-dropdown">
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="opening">Openings</option>
                <option value="tactics">Tactics</option>
                <option value="endgame">Endgames</option>
              </select>
            </div>
          </div>
        </div>
        
        {filteredPractice.length === 0 ? (
          <div className="no-practice">
            <p>No practice positions found.</p>
          </div>
        ) : (
          <div className="practice-grid">
            {filteredPractice.map(position => (
              <div 
                key={position.id} 
                className={`practice-card ${position.type} ${position.difficulty}`}
                onClick={() => handleSelectPractice(position)}
              >
                <div className="practice-card-header">
                  <h3>{position.title}</h3>
                  <div className="practice-badges">
                    <span className="type-badge">{position.type}</span>
                    <span className="difficulty-badge">{position.difficulty}</span>
                  </div>
                </div>
                
                <div className="practice-preview">
                  <div className="mini-board" 
                    style={{ backgroundImage: position.preview_url 
                      ? `url(${position.preview_url})` 
                      : `url(/images/practice-positions/default.png)` 
                    }}
                  ></div>
                </div>
                
                <div className="practice-card-content">
                  <p className="practice-description">{position.description}</p>
                </div>
                
                <div className="practice-card-footer">
                  <span className="engine-level">Engine Level: {position.engine_level}</span>
                  <span className="created-date">Added: {position.created_at}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="new-practice-actions">
          <button 
            className="create-practice-btn"
            onClick={handleCreatePracticePosition}
          >
            Create Custom Position
          </button>
        </div>
      </div>
    );
  };
  
  // Show loading state
  if (loading && !activeGame && !activePractice) {
    return (
      <div className="game-area-container">
        <h1>Chess Game Area</h1>
        <div className="loading">Loading chess content...</div>
      </div>
    );
  }
  
  // Show error state
  if (error && !activeGame && !activePractice) {
    return (
      <div className="game-area-container">
        <h1>Chess Game Area</h1>
        <div className="error-message">{error}</div>
      </div>
    );
  }
  
  // If viewing a game or practice, show that
  if (activeGame) return renderGameBoard();
  if (activePractice) return renderPracticeBoard();
  
  // Main game area view with tabs
  return (
    <div className="game-area-container">
      <h1>Chess Game Area</h1>
      
      <div className="game-area-tabs">
        <button 
          className={`tab-btn ${activeTab === 'games' ? 'active' : ''}`}
          onClick={() => setActiveTab('games')}
        >
          Your Games
        </button>
        <button 
          className={`tab-btn ${activeTab === 'practice' ? 'active' : ''}`}
          onClick={() => setActiveTab('practice')}
        >
          Practice
        </button>
      </div>
      
      <div className="tab-content">
        {activeTab === 'games' ? renderGamesList() : renderPracticeList()}
      </div>
    </div>
  );
};

export default GameArea;
