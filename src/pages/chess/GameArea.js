import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import ChessNavigation from '../../components/chess/ChessNavigation';
import ApiService from '../../utils/api';
import './GameArea.css';

const GameArea = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('games');
  const [games, setGames] = useState([]);
  const [practicePositions, setPracticePositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gameStatus, setGameStatus] = useState('active');

  // Load games and practice positions
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load games
        const gamesResponse = await ApiService.getChessGames(gameStatus);
        if (gamesResponse.success) {
          setGames(gamesResponse.games || []);
        }
        
        // Load practice positions if on practice tab
        if (activeTab === 'practice') {
          const practiceResponse = await ApiService.getPracticePositions();
          if (practiceResponse.success) {
            setPracticePositions(practiceResponse.positions || []);
          }
        }
      } catch (error) {
        setError(error.message || 'Failed to load chess data');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [activeTab, gameStatus]);

  // Handle game selection
  const handleSelectGame = (gameId) => {
    navigate(`/chess/game/${gameId}`);
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return dateString;
    }
  };

  // Handle practice position selection
  const handleSelectPractice = (position) => {
    // Redirect to interactive board with position data
    navigate('/chess/board', { state: { position: position.position } });
  };

  return (
    <div className="game-area-page">
      <h1>Chess Game Area</h1>
      
      <ChessNavigation />
      
      <div className="game-area-tabs">
        <button 
          className={`tab ${activeTab === 'games' ? 'active' : ''}`}
          onClick={() => setActiveTab('games')}
        >
          My Games
        </button>
        <button 
          className={`tab ${activeTab === 'practice' ? 'active' : ''}`}
          onClick={() => setActiveTab('practice')}
        >
          Practice Positions
        </button>
        <button 
          className={`tab ${activeTab === 'challenges' ? 'active' : ''}`}
          onClick={() => navigate('/chess/play')}
        >
          Find Opponents
        </button>
      </div>
      
      {activeTab === 'games' && (
        <div className="games-container">
          <div className="filter-controls">
            <select 
              value={gameStatus} 
              onChange={(e) => setGameStatus(e.target.value)}
              className="status-filter"
            >
              <option value="active">Active Games</option>
              <option value="completed">Completed Games</option>
              <option value="all">All Games</option>
            </select>
          </div>
          
          {loading ? (
            <div className="loading">Loading games...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : games.length === 0 ? (
            <div className="no-games">
              <p>No games found. Challenge someone to play!</p>
              <button onClick={() => navigate('/chess/play')} className="challenge-btn">
                Find Opponents
              </button>
            </div>
          ) : (
            <div className="games-grid">
              {games.map(game => (
                <div key={game.id} className="game-card" onClick={() => handleSelectGame(game.id)}>
                  <div className="game-card-preview">
                    <div className="mini-board" style={{ backgroundImage: game.preview_url ? `url(${game.preview_url})` : '' }}></div>
                  </div>
                  <div className="game-card-content">
                    <div className="game-players">
                      <div className="white-player">{game.white_player.name}</div>
                      <span className="vs">vs</span>
                      <div className="black-player">{game.black_player.name}</div>
                    </div>
                    <div className="game-meta">
                      <span className="game-time-control">{game.time_control || 'Standard'}</span>
                      <span className="game-last-move">{formatDate(game.last_move_at)}</span>
                    </div>
                    <div className="game-status">
                      <span className={`status-badge ${game.status}`}>{game.status}</span>
                      {game.result && <span className="result-badge">{game.result}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'practice' && (
        <div className="practice-container">
          {loading ? (
            <div className="loading">Loading practice positions...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : practicePositions.length === 0 ? (
            <div className="no-practice">
              <p>No practice positions found.</p>
            </div>
          ) : (
            <div className="practice-grid">
              {practicePositions.map(position => (
                <div key={position.id} className="practice-card" onClick={() => handleSelectPractice(position)}>
                  <div className="practice-card-preview">
                    <div className="mini-board" style={{ backgroundImage: position.preview_url ? `url(${position.preview_url})` : '' }}></div>
                  </div>
                  <div className="practice-card-content">
                    <h3>{position.title}</h3>
                    <p className="practice-description">{position.description}</p>
                    <div className="practice-meta">
                      <span className="practice-type">{position.type}</span>
                      <span className="practice-difficulty">{position.difficulty}</span>
                    </div>
                    <div className="practice-creator">
                      By {position.creator.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GameArea;
