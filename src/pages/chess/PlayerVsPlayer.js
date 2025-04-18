import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ChallengeList from '../../components/chess/ChallengeList';
import PlayerList from '../../components/chess/PlayerList';
import ChessNavigation from '../../components/chess/ChessNavigation';
import ChessBoard from '../../components/chess/ChessBoard';
import ApiService from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';
import './PlayerVsPlayer.css';

const PlayerVsPlayer = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('players');
  const [onlinePlayers, setOnlinePlayers] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [playerStats, setPlayerStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [engineLevel, setEngineLevel] = useState(10);
  const [engineColor, setEngineColor] = useState('black');
  const [useOnlineAPI, setUseOnlineAPI] = useState(false);
  
  // Get online players
  const fetchOnlinePlayers = async () => {
    try {
      const response = await ApiService.getOnlinePlayers();
      if (response.success) {
        setOnlinePlayers(response.players);
      }
    } catch (error) {
      console.error('Failed to fetch online players:', error);
      setError('Failed to load online players. Please try again later.');
    }
  };
  
  // Get player stats
  const fetchPlayerStats = async () => {
    try {
      const response = await ApiService.getPlayerStats();
      if (response.success) {
        setPlayerStats(response.stats);
      }
    } catch (error) {
      console.error('Failed to fetch player stats:', error);
    }
  };
  
  // Load challenges
  const fetchChallenges = useCallback(async () => {
    try {
      // Get challenges directly from the dedicated endpoint
      const challengesResponse = await ApiService.getChallenges();
      
      if (challengesResponse && challengesResponse.success) {
        setChallenges(challengesResponse.challenges || []);
      } else {
        // Fallback to extracting challenges from player stats
        if (playerStats && playerStats.challenges) {
          setChallenges(playerStats.challenges);
        }
      }
    } catch (error) {
      console.error('Failed to fetch challenges:', error);
    } finally {
      setIsLoading(false);
    }
  }, [playerStats]);
  
  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchOnlinePlayers(),
          fetchPlayerStats()
        ]);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
    
    // Set up polling for online players
    const interval = setInterval(() => {
      fetchOnlinePlayers();
    }, 30000); // Poll every 30 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  // Update challenges when player stats are updated
  useEffect(() => {
    fetchChallenges();
  }, [playerStats, fetchChallenges]);
  
  // Handle challenging a player
  const handleChallengePlayer = async (playerId, color, timeControl) => {
    try {
      const response = await ApiService.challengePlayer(playerId, {
        color,
        timeControl
      });
      
      if (response.success) {
        // Refresh data after challenging
        await Promise.all([
          fetchOnlinePlayers(),
          fetchPlayerStats()
        ]);
        setActiveTab('challenges');
      }
    } catch (error) {
      console.error('Failed to challenge player:', error);
    }
  };
  
  // Handle accepting a challenge
  const handleAcceptChallenge = (gameId) => {
    // Navigate to the game page
    navigate(`/chess/game/${gameId}`);
  };
  
  // Handle refreshing data
  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchOnlinePlayers(),
        fetchPlayerStats()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="chess-page">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="chess-page">
        <div className="error-message">{error}</div>
        <button onClick={handleRefresh} className="refresh-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="chess-page">
      <div className="chess-header">
        <h1>Play Chess</h1>
        <div className="player-rating">
          Your Rating: {playerStats ? playerStats.rating : 1200}
        </div>
      </div>
      
      <ChessNavigation />
      
      <div className="chess-tabs">
        <button 
          className={`tab ${activeTab === 'players' ? 'active' : ''}`}
          onClick={() => setActiveTab('players')}
        >
          Online Players
        </button>
        <button 
          className={`tab ${activeTab === 'challenges' ? 'active' : ''}`}
          onClick={() => setActiveTab('challenges')}
        >
          Challenges
          {challenges.length > 0 && (
            <span className="challenge-count">{challenges.length}</span>
          )}
        </button>
        <button 
          className={`tab ${activeTab === 'computer' ? 'active' : ''}`}
          onClick={() => setActiveTab('computer')}
        >
          Play Computer
        </button>
        <button 
          className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          My Stats
        </button>
      </div>
      
      <div className="chess-content">
        {activeTab === 'players' && (
          <PlayerList 
            players={onlinePlayers} 
            currentUser={user}
            onChallenge={handleChallengePlayer}
            onRefresh={handleRefresh}
          />
        )}
        
        {activeTab === 'challenges' && (
          <ChallengeList 
            challenges={challenges}
            onAccept={handleAcceptChallenge}
            onRefresh={handleRefresh}
          />
        )}
        
        {activeTab === 'computer' && (
          <div className="computer-play-container">
            <div className="computer-options">
              <div className="option-group">
                <label>Engine Level</label>
                <input 
                  type="range" 
                  min="1" 
                  max="20" 
                  value={engineLevel} 
                  onChange={(e) => setEngineLevel(parseInt(e.target.value))} 
                  className="level-slider"
                />
                <span className="level-display">{engineLevel}</span>
              </div>
              
              <div className="option-group">
                <label>Play as</label>
                <div className="radio-options">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="color"
                      value="white"
                      checked={engineColor === 'black'}
                      onChange={() => setEngineColor('black')}
                    />
                    White
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="color"
                      value="black"
                      checked={engineColor === 'white'}
                      onChange={() => setEngineColor('white')}
                    />
                    Black
                  </label>
                </div>
              </div>
              
              <div className="option-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={useOnlineAPI}
                    onChange={(e) => setUseOnlineAPI(e.target.checked)}
                  />
                  Use Online API (more powerful analysis)
                </label>
                <p className="option-hint">
                  The online API provides stronger analysis but requires an internet connection.
                </p>
              </div>
            </div>
            
            <div className="computer-board-container">
              <ChessBoard 
                position="start"
                orientation={engineColor === 'black' ? 'white' : 'black'}
                allowMoves={true}
                showHistory={true}
                showAnalysis={false}
                engineLevel={engineLevel}
                playMode="vs-ai"
                width={560}
                useOnlineAPI={useOnlineAPI}
              />
            </div>
          </div>
        )}
        
        {activeTab === 'stats' && playerStats && (
          <div className="player-stats">
            <h2>Your Chess Statistics</h2>
            
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{playerStats.rating}</div>
                <div className="stat-label">Rating</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-value">{playerStats.games_played}</div>
                <div className="stat-label">Games Played</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-value">{playerStats.win_rate}%</div>
                <div className="stat-label">Win Rate</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-value">{playerStats.rank}</div>
                <div className="stat-label">Rank</div>
              </div>
            </div>
            
            <div className="record-breakdown">
              <div className="record-item wins">
                <span className="record-value">{playerStats.games_won}</span>
                <span className="record-label">Wins</span>
              </div>
              <div className="record-item draws">
                <span className="record-value">{playerStats.games_drawn}</span>
                <span className="record-label">Draws</span>
              </div>
              <div className="record-item losses">
                <span className="record-value">{playerStats.games_lost}</span>
                <span className="record-label">Losses</span>
              </div>
            </div>
            
            {playerStats.recent_games && playerStats.recent_games.length > 0 && (
              <div className="recent-games">
                <h3>Recent Games</h3>
                <table className="games-table">
                  <thead>
                    <tr>
                      <th>Opponent</th>
                      <th>Result</th>
                      <th>Color</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {playerStats.recent_games.map((game, index) => (
                      <tr key={index} className={game.result}>
                        <td>{game.opponent_name}</td>
                        <td className={`result ${game.result}`}>
                          {game.result === 'win' ? 'Won' : 
                           game.result === 'loss' ? 'Lost' : 
                           game.result === 'draw' ? 'Draw' : 'Active'}
                        </td>
                        <td>{game.player_color}</td>
                        <td>
                          {new Date(game.last_move_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerVsPlayer;
