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
  
  const fetchChallenges = useCallback(async () => {
    try {
      const challengesResponse = await ApiService.getChallenges();
      
      if (challengesResponse && challengesResponse.success) {
        setChallenges(challengesResponse.challenges || []);
      } else {
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
    
    const interval = setInterval(() => {
      fetchOnlinePlayers();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    fetchChallenges();
  }, [playerStats, fetchChallenges]);
  
  const handleChallengePlayer = async (playerId, color, timeControl) => {
    try {
      const response = await ApiService.challengePlayer(playerId, {
        color,
        timeControl
      });
      
      if (response.success) {
        alert(`Challenge sent! You'll be redirected to the game board when your opponent accepts.`);
        setActiveTab('challenges');
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
  
  const handleAcceptChallenge = (gameId) => {
    navigate(`/chess/game/${gameId}`);
  };
  
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
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-center items-center h-64 text-indigo-700">Loading...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">{error}</div>
        <button 
          onClick={handleRefresh} 
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-indigo-900">Play Chess</h1>
        <div className="bg-indigo-700 text-white px-4 py-2 rounded-full">
          Your Rating: {playerStats ? playerStats.rating : 1200}
        </div>
      </div>
      
      <ChessNavigation />
      
      <div className="border-b border-gray-200 mb-6">
        <div className="flex flex-wrap -mb-px">
          <button 
            className={`mr-2 py-2 px-4 font-medium text-sm border-b-2 ${
              activeTab === 'players' 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('players')}
          >
            Online Players
          </button>
          <button 
            className={`mr-2 py-2 px-4 font-medium text-sm border-b-2 ${
              activeTab === 'challenges' 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } flex items-center`}
            onClick={() => setActiveTab('challenges')}
          >
            Challenges
            {challenges.length > 0 && (
              <span className="ml-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {challenges.length}
              </span>
            )}
          </button>
          <button 
            className={`mr-2 py-2 px-4 font-medium text-sm border-b-2 ${
              activeTab === 'computer' 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('computer')}
          >
            Play Computer
          </button>
          <button 
            className={`mr-2 py-2 px-4 font-medium text-sm border-b-2 ${
              activeTab === 'stats' 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('stats')}
          >
            My Stats
          </button>
        </div>
      </div>
      
      <div className="mt-6">
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
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-1/3 bg-indigo-50 rounded-lg p-6">
              <div className="mb-6">
                <label className="block text-indigo-900 font-medium mb-2">Engine Level</label>
                <div className="flex items-center space-x-2">
                  <input 
                    type="range" 
                    min="1" 
                    max="20" 
                    value={engineLevel} 
                    onChange={(e) => setEngineLevel(parseInt(e.target.value))} 
                    className="w-full"
                  />
                  <span className="font-bold text-indigo-700 w-6 text-center">{engineLevel}</span>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-indigo-900 font-medium mb-2">Play as</label>
                <div className="flex space-x-6">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="color"
                      value="white"
                      checked={engineColor === 'black'}
                      onChange={() => setEngineColor('black')}
                      className="text-indigo-600"
                    />
                    <span>White</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="color"
                      value="black"
                      checked={engineColor === 'white'}
                      onChange={() => setEngineColor('white')}
                      className="text-indigo-600"
                    />
                    <span>Black</span>
                  </label>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useOnlineAPI}
                    onChange={(e) => setUseOnlineAPI(e.target.checked)}
                    className="text-indigo-600 rounded"
                  />
                  <span className="text-indigo-900 font-medium">Use Online API (more powerful analysis)</span>
                </label>
                <p className="text-indigo-700 text-sm mt-1">
                  The online API provides stronger analysis but requires an internet connection.
                </p>
              </div>
            </div>
            
            <div className="w-full lg:w-2/3 bg-white rounded-lg shadow-md p-6 flex justify-center">
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
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-indigo-900 text-center mb-6">Your Chess Statistics</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-indigo-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-indigo-700 mb-1">{playerStats.rating}</div>
                <div className="text-sm text-indigo-900">Rating</div>
              </div>
              
              <div className="bg-indigo-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-indigo-700 mb-1">{playerStats.games_played}</div>
                <div className="text-sm text-indigo-900">Games Played</div>
              </div>
              
              <div className="bg-indigo-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-indigo-700 mb-1">{playerStats.win_rate}%</div>
                <div className="text-sm text-indigo-900">Win Rate</div>
              </div>
              
              <div className="bg-indigo-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-indigo-700 mb-1">{playerStats.rank}</div>
                <div className="text-sm text-indigo-900">Rank</div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 flex justify-between mb-8">
              <div className="text-center flex-1">
                <span className="block text-xl font-bold text-green-600 mb-1">{playerStats.games_won}</span>
                <span className="text-sm text-gray-700">Wins</span>
              </div>
              <div className="text-center flex-1">
                <span className="block text-xl font-bold text-yellow-600 mb-1">{playerStats.games_drawn}</span>
                <span className="text-sm text-gray-700">Draws</span>
              </div>
              <div className="text-center flex-1">
                <span className="block text-xl font-bold text-red-600 mb-1">{playerStats.games_lost}</span>
                <span className="text-sm text-gray-700">Losses</span>
              </div>
            </div>
            
            {playerStats.recent_games && playerStats.recent_games.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-indigo-900 mb-4">Recent Games</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opponent</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Color</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {playerStats.recent_games.map((game, index) => (
                        <tr key={index} className={game.result === 'active' ? 'bg-blue-50' : ''}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{game.opponent_name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              game.result === 'win' ? 'bg-green-100 text-green-800' : 
                              game.result === 'loss' ? 'bg-red-100 text-red-800' : 
                              game.result === 'draw' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {game.result === 'win' ? 'Won' : 
                               game.result === 'loss' ? 'Lost' : 
                               game.result === 'draw' ? 'Draw' : 'Active'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{game.player_color}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
