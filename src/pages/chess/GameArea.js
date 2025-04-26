import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import ChessNavigation from '../../components/chess/ChessNavigation';
import ApiService from '../../utils/api';

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
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-indigo-900 mb-4">Chess Game Area</h1>
      
      <ChessNavigation />
      
      <div className="border-b border-gray-200 mb-6">
        <div className="flex flex-wrap -mb-px">
          <button 
            className={`mr-2 py-2 px-4 font-medium text-sm border-b-2 ${
              activeTab === 'games' 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('games')}
          >
            My Games
          </button>
          <button 
            className={`mr-2 py-2 px-4 font-medium text-sm border-b-2 ${
              activeTab === 'practice' 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('practice')}
          >
            Practice Positions
          </button>
          <button 
            className={`mr-2 py-2 px-4 font-medium text-sm border-b-2 ${
              activeTab === 'challenges' 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => navigate('/chess/play')}
          >
            Find Opponents
          </button>
        </div>
      </div>
      
      {activeTab === 'games' && (
        <div>
          <div className="flex justify-end mb-4">
            <select 
              value={gameStatus} 
              onChange={(e) => setGameStatus(e.target.value)}
              className="border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
              <option value="active">Active Games</option>
              <option value="completed">Completed Games</option>
              <option value="all">All Games</option>
            </select>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64 text-indigo-700">Loading games...</div>
          ) : error ? (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">{error}</div>
          ) : games.length === 0 ? (
            <div className="flex flex-col items-center justify-center bg-indigo-50 rounded-lg p-8 text-center">
              <p className="text-indigo-800 mb-4">No games found. Challenge someone to play!</p>
              <button onClick={() => navigate('/chess/play')} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                Find Opponents
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {games.map(game => (
                <div key={game.id} className="bg-white rounded-lg shadow overflow-hidden cursor-pointer" 
                  onClick={() => handleSelectGame(game.id)}>
                  <div className="h-40 bg-indigo-50 flex items-center justify-center">
                    <div className="w-4/5 h-4/5 bg-center bg-no-repeat bg-contain" 
                      style={{ backgroundImage: game.preview_url ? `url(${game.preview_url})` : '' }}></div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-sm font-medium text-gray-900">{game.white_player.name}</div>
                      <span className="text-xs text-gray-500">vs</span>
                      <div className="text-sm font-medium text-gray-900">{game.black_player.name}</div>
                    </div>
                    <div className="flex justify-between items-center mb-2 text-xs text-gray-500">
                      <span>{game.time_control || 'Standard'}</span>
                      <span>{formatDate(game.last_move_at)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        game.status === 'active' ? 'bg-blue-100 text-blue-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>{game.status}</span>
                      {game.result && <span className="text-sm font-medium text-indigo-700">{game.result}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'practice' && (
        <div>
          {loading ? (
            <div className="flex justify-center items-center h-64 text-indigo-700">Loading practice positions...</div>
          ) : error ? (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">{error}</div>
          ) : practicePositions.length === 0 ? (
            <div className="flex flex-col items-center justify-center bg-indigo-50 rounded-lg p-8 text-center">
              <p className="text-indigo-800">No practice positions found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {practicePositions.map(position => (
                <div key={position.id} className="bg-white rounded-lg shadow overflow-hidden cursor-pointer"
                  onClick={() => handleSelectPractice(position)}>
                  <div className="h-40 bg-indigo-50 flex items-center justify-center">
                    <div className="w-4/5 h-4/5 bg-center bg-no-repeat bg-contain" 
                      style={{ backgroundImage: position.preview_url ? `url(${position.preview_url})` : '' }}></div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-indigo-800 mb-2">{position.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{position.description}</p>
                    <div className="flex justify-between items-center mb-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">{position.type}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        position.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                        position.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>{position.difficulty}</span>
                    </div>
                    <div className="text-right text-xs text-gray-500">
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
