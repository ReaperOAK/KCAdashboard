import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ChallengeList from '../../components/chess/ChallengeList';
import PlayerList from '../../components/chess/PlayerList';
import ChessNavigation from '../../components/chess/ChessNavigation';
import ChessBoard from '../../components/chess/ChessBoard';
import ApiService from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';

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
        // Show a message indicating the challenge has been sent
        alert(`Challenge sent! You'll be redirected to the game board when your opponent accepts.`);
        
        // Redirect to waiting for the player to view and track the challenge
        setActiveTab('challenges');
        
        // Refresh the challenges list
        await Promise.all([
          fetchOnlinePlayers(),
          fetchPlayerStats(),
          fetchChallenges()
        ]);
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
      <div className="max-w-6xl mx-auto px-5 pb-10">
        <div className="flex justify-center items-center h-96 text-purple-700 font-bold">Loading...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-5 pb-10">
        <div className="flex justify-center items-center h-48 text-red-600 font-bold text-center mb-6">{error}</div>
        <button onClick={handleRefresh} className="block mx-auto px-4 py-2 bg-purple-700 text-white border-none rounded cursor-pointer">
          Retry
        </button>
      </div>
    );
  }
  return (
    <div className="max-w-6xl mx-auto px-5 pb-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-purple-900 m-0">Play Chess</h1>
        <div className="bg-purple-700 text-white px-4 py-2 rounded-full font-bold text-base">
          Your Rating: {playerStats ? playerStats.rating : 1200}
        </div>
      </div>
      
      <ChessNavigation />
      
      <div className="flex border-b border-gray-200 mb-6">
        <button 
          className={`px-6 py-3 bg-transparent border-none cursor-pointer text-base transition-all duration-200 relative ${
            activeTab === 'players' 
              ? 'text-purple-700 font-bold after:content-[""] after:absolute after:-bottom-px after:left-0 after:w-full after:h-0.5 after:bg-purple-700' 
              : 'text-gray-600 hover:bg-purple-50'
          }`}
          onClick={() => setActiveTab('players')}
        >
          Online Players
        </button>
        <button 
          className={`px-6 py-3 bg-transparent border-none cursor-pointer text-base transition-all duration-200 relative ${
            activeTab === 'challenges' 
              ? 'text-purple-700 font-bold after:content-[""] after:absolute after:-bottom-px after:left-0 after:w-full after:h-0.5 after:bg-purple-700' 
              : 'text-gray-600 hover:bg-purple-50'
          }`}
          onClick={() => setActiveTab('challenges')}
        >
          Challenges
          {challenges.length > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-600 text-white text-xs ml-2">
              {challenges.length}
            </span>
          )}
        </button>
        <button 
          className={`px-6 py-3 bg-transparent border-none cursor-pointer text-base transition-all duration-200 relative ${
            activeTab === 'computer' 
              ? 'text-purple-700 font-bold after:content-[""] after:absolute after:-bottom-px after:left-0 after:w-full after:h-0.5 after:bg-purple-700' 
              : 'text-gray-600 hover:bg-purple-50'
          }`}
          onClick={() => setActiveTab('computer')}
        >
          Play Computer
        </button>
        <button 
          className={`px-6 py-3 bg-transparent border-none cursor-pointer text-base transition-all duration-200 relative ${
            activeTab === 'stats' 
              ? 'text-purple-700 font-bold after:content-[""] after:absolute after:-bottom-px after:left-0 after:w-full after:h-0.5 after:bg-purple-700' 
              : 'text-gray-600 hover:bg-purple-50'
          }`}
          onClick={() => setActiveTab('stats')}
        >
          My Stats
        </button>
      </div>
      
      <div className="min-h-96">
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
          <div className="flex gap-6">
            <div className="flex-1 space-y-6">
              <div className="bg-purple-50 p-6 rounded-lg">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-purple-900 mb-2">Engine Level</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="range" 
                      min="1" 
                      max="20" 
                      value={engineLevel} 
                      onChange={(e) => setEngineLevel(parseInt(e.target.value))} 
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider:bg-purple-600"
                    />
                    <span className="min-w-[24px] text-center font-bold text-purple-700">{engineLevel}</span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-purple-900 mb-2">Play as</label>
                  <div className="flex gap-5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="color"
                        value="white"
                        checked={engineColor === 'black'}
                        onChange={() => setEngineColor('black')}
                        className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 focus:ring-purple-500"
                      />
                      <span className="text-gray-700">White</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="color"
                        value="black"
                        checked={engineColor === 'white'}
                        onChange={() => setEngineColor('white')}
                        className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 focus:ring-purple-500"
                      />
                      <span className="text-gray-700">Black</span>
                    </label>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useOnlineAPI}
                      onChange={(e) => setUseOnlineAPI(e.target.checked)}
                      className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-gray-700">Use Online API (more powerful analysis)</span>
                  </label>
                  <p className="text-sm text-gray-600 mt-1">
                    The online API provides stronger analysis but requires an internet connection.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex-shrink-0">
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
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-purple-900 text-center mb-6">Your Chess Statistics</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-purple-50 rounded-lg p-4 text-center shadow-sm">
                <div className="text-3xl font-bold text-purple-700 mb-2">{playerStats.rating}</div>
                <div className="text-gray-600">Rating</div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4 text-center shadow-sm">
                <div className="text-3xl font-bold text-purple-700 mb-2">{playerStats.games_played}</div>
                <div className="text-gray-600">Games Played</div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4 text-center shadow-sm">
                <div className="text-3xl font-bold text-purple-700 mb-2">{playerStats.win_rate}%</div>
                <div className="text-gray-600">Win Rate</div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4 text-center shadow-sm">
                <div className="text-3xl font-bold text-purple-700 mb-2">{playerStats.rank}</div>
                <div className="text-gray-600">Rank</div>
              </div>
            </div>
            
            <div className="flex justify-between bg-gray-50 rounded-lg p-4 mb-8 shadow-sm">
              <div className="flex flex-col items-center flex-1">
                <div className="text-2xl font-bold text-green-600 mb-1">{playerStats.games_won}</div>
                <div className="text-gray-600">Wins</div>
              </div>
              <div className="flex flex-col items-center flex-1">
                <div className="text-2xl font-bold text-yellow-600 mb-1">{playerStats.games_drawn}</div>
                <div className="text-gray-600">Draws</div>
              </div>
              <div className="flex flex-col items-center flex-1">
                <div className="text-2xl font-bold text-red-600 mb-1">{playerStats.games_lost}</div>
                <div className="text-gray-600">Losses</div>
              </div>
            </div>
            
            {playerStats.recent_games && playerStats.recent_games.length > 0 && (
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="text-xl font-semibold text-purple-700 mb-4 border-b border-gray-200 pb-2">Recent Games</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left p-3 text-purple-700">Opponent</th>
                        <th className="text-left p-3 text-purple-700">Result</th>
                        <th className="text-left p-3 text-purple-700">Color</th>
                        <th className="text-left p-3 text-purple-700">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {playerStats.recent_games.map((game, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="p-3">{game.opponent_name}</td>
                          <td className={`p-3 font-bold ${
                            game.result === 'win' ? 'text-green-600' : 
                            game.result === 'loss' ? 'text-red-600' : 
                            game.result === 'draw' ? 'text-yellow-600' : 'text-blue-600'
                          }`}>
                            {game.result === 'win' ? 'Won' : 
                             game.result === 'loss' ? 'Lost' : 
                             game.result === 'draw' ? 'Draw' : 'Active'}
                          </td>
                          <td className="p-3 capitalize">{game.player_color}</td>
                          <td className="p-3">
                            {new Date(game.last_move_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerVsPlayer;
