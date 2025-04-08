import React, { useState, useEffect } from 'react';
import ChessBoard from '../../components/chess/ChessBoard';
import './GameArea.css';

const GameArea = () => {
  const [activeTab, setActiveTab] = useState('practice');
  const [games, setGames] = useState([]);
  const [practicePositions, setPracticePositions] = useState([]);
  const [activeGame, setActiveGame] = useState(null);
  const [activePractice, setActivePractice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Mock games data
      const mockGames = [
        {
          id: 1,
          opponent: {
            id: 201,
            name: 'John Teacher',
            rating: 1850
          },
          status: 'active',
          lastMove: '2023-10-25T14:30:00Z',
          yourTurn: true,
          position: 'rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2',
          yourColor: 'black',
          type: 'correspondence'
        },
        {
          id: 2,
          opponent: {
            id: 202,
            name: 'Sarah Coach',
            rating: 2100
          },
          status: 'active',
          lastMove: '2023-10-24T09:15:00Z',
          yourTurn: false,
          position: 'rnbqkb1r/pppp1ppp/5n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
          yourColor: 'black',
          type: 'correspondence'
        },
        {
          id: 3,
          opponent: {
            id: 203,
            name: 'Mike Student',
            rating: 1200
          },
          status: 'completed',
          lastMove: '2023-10-20T16:45:00Z',
          yourTurn: false,
          position: '8/5pk1/p1p2n2/2P4p/PP3P1P/5KP1/8/8 b - - 0 43',
          yourColor: 'white',
          result: 'win',
          type: 'correspondence'
        }
      ];
      
      // Mock practice positions
      const mockPracticePositions = [
        {
          id: 101,
          title: 'Queen\'s Gambit Accepted',
          description: 'Practice the QGA opening with common variations',
          difficulty: 'intermediate',
          position: 'rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq - 0 2',
          type: 'opening',
          engine_level: 5,
          created_at: '2023-10-05'
        },
        {
          id: 102,
          title: 'Rook Endgame',
          description: 'Practice rook endgame patterns',
          difficulty: 'advanced',
          position: '8/8/8/8/8/4k3/4p3/4K2R w K - 0 1',
          type: 'endgame',
          engine_level: 10,
          created_at: '2023-10-10'
        },
        {
          id: 103,
          title: 'Knight Fork Tactics',
          description: 'Find the winning knight fork',
          difficulty: 'beginner',
          position: 'r2qkb1r/pp2pppp/2p2n2/8/3P4/2NB4/PPP2PPP/R1BQK2R w KQkq - 0 9',
          type: 'tactics',
          engine_level: 3,
          created_at: '2023-10-15'
        },
        {
          id: 104,
          title: 'Sicilian Defense',
          description: 'Play against the Sicilian Najdorf',
          difficulty: 'intermediate',
          position: 'rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6',
          type: 'opening',
          engine_level: 7,
          created_at: '2023-10-18'
        }
      ];
      
      setGames(mockGames);
      setPracticePositions(mockPracticePositions);
      setLoading(false);
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
  const handleSelectGame = (game) => {
    setActiveGame(game);
    setActivePractice(null);
  };
  
  // Handle practice position selection
  const handleSelectPractice = (position) => {
    setActivePractice(position);
    setActiveGame(null);
  };
  
  // Handle move in game
  const handleGameMove = (move, fen) => {
    // In a real app, this would send the move to the backend
    if (activeGame) {
      setActiveGame({
        ...activeGame,
        position: fen,
        yourTurn: false,
        lastMove: new Date().toISOString()
      });
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
              <button className="offer-draw-btn">Offer Draw</button>
              <button className="resign-btn">Resign</button>
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
            orientation="white"
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
          
          <button className="reset-btn">Reset Position</button>
          <button className="flip-btn">Flip Board</button>
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
                  <div className="mini-board" style={{ backgroundImage: `url(/images/mini-boards/${game.id}.png)` }}></div>
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
          <button className="new-game-btn">Start New Game</button>
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
                  <div className="mini-board" style={{ backgroundImage: `url(/images/practice-positions/${position.id}.png)` }}></div>
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
          <button className="create-practice-btn">Create Custom Position</button>
        </div>
      </div>
    );
  };
  
  // Show loading state
  if (loading) {
    return (
      <div className="game-area-container">
        <h1>Chess Game Area</h1>
        <div className="loading">Loading chess content...</div>
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
