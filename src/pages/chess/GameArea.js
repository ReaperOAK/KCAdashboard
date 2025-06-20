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
    <div className="max-w-6xl mx-auto px-5 pb-10">
      <h1 className="text-3xl font-bold text-purple-900 mb-5">Chess Game Area</h1>
      
      <ChessNavigation />
      
      <div className="flex border-b border-gray-200 mb-6">
        <button 
          className={`px-6 py-3 bg-transparent border-none cursor-pointer text-base transition-all duration-200 relative ${
            activeTab === 'games' 
              ? 'text-purple-700 font-bold after:content-[""] after:absolute after:-bottom-px after:left-0 after:w-full after:h-0.5 after:bg-purple-700' 
              : 'text-gray-600 hover:bg-purple-50'
          }`}
          onClick={() => setActiveTab('games')}
        >
          My Games
        </button>
        <button 
          className={`px-6 py-3 bg-transparent border-none cursor-pointer text-base transition-all duration-200 relative ${
            activeTab === 'practice' 
              ? 'text-purple-700 font-bold after:content-[""] after:absolute after:-bottom-px after:left-0 after:w-full after:h-0.5 after:bg-purple-700' 
              : 'text-gray-600 hover:bg-purple-50'
          }`}
          onClick={() => setActiveTab('practice')}
        >
          Practice Positions
        </button>
        <button 
          className={`px-6 py-3 bg-transparent border-none cursor-pointer text-base transition-all duration-200 relative ${
            activeTab === 'challenges' 
              ? 'text-purple-700 font-bold after:content-[""] after:absolute after:-bottom-px after:left-0 after:w-full after:h-0.5 after:bg-purple-700' 
              : 'text-gray-600 hover:bg-purple-50'
          }`}
          onClick={() => navigate('/chess/play')}
        >
          Find Opponents
        </button>
      </div>
        {activeTab === 'games' && (
        <div>
          <div className="flex justify-end mb-5">
            <select 
              value={gameStatus} 
              onChange={(e) => setGameStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded text-base bg-white min-w-40"
            >
              <option value="active">Active Games</option>
              <option value="completed">Completed Games</option>
              <option value="all">All Games</option>
            </select>
          </div>
          
          {loading ? (
            <div className="text-center py-15 text-purple-700 font-bold">Loading games...</div>
          ) : error ? (
            <div className="text-center py-15 text-red-600 font-bold">{error}</div>
          ) : games.length === 0 ? (
            <div className="bg-purple-50 p-8 rounded-lg text-center">
              <p className="mb-4 text-gray-700">No games found. Challenge someone to play!</p>
              <button onClick={() => navigate('/chess/play')} className="px-4 py-2 bg-purple-700 text-white border-none rounded cursor-pointer hover:bg-purple-800 transition-colors">
                Find Opponents
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {games.map(game => (
                <div key={game.id} className="bg-white rounded-lg overflow-hidden shadow-lg transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-xl" onClick={() => handleSelectGame(game.id)}>                  <div className="h-36 bg-purple-50 flex items-center justify-center border-b border-gray-200">
                    <div className="w-30 h-30 bg-gray-200 bg-contain bg-center bg-no-repeat border border-gray-300" style={{ backgroundImage: game.preview_url ? `url(${game.preview_url})` : '' }}></div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-purple-700 font-semibold">{game.white_player.name}</div>
                      <span className="text-gray-500 text-sm">vs</span>
                      <div className="text-purple-700 font-semibold">{game.black_player.name}</div>
                    </div>
                    <div className="flex justify-between items-center mb-3 text-sm text-gray-600">
                      <span>{game.time_control || 'Standard'}</span>
                      <span>{formatDate(game.last_move_at)}</span>
                    </div>                    <div className="flex justify-between items-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        game.status === 'active' ? 'bg-green-100 text-green-800' : 
                        game.status === 'completed' ? 'bg-gray-100 text-gray-800' : 
                        game.status === 'abandoned' ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>{game.status === 'abandoned' ? 'Expired' : game.status}</span>
                      {game.result && <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">{game.result}</span>}
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
            <div className="text-center py-15 text-purple-700 font-bold">Loading practice positions...</div>
          ) : error ? (
            <div className="text-center py-15 text-red-600 font-bold">{error}</div>          ) : practicePositions.length === 0 ? (
            <div className="bg-purple-50 p-8 rounded-lg text-center">
              <p className="text-gray-700">No practice positions found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {practicePositions.map(position => (
                <div key={position.id} className="bg-white rounded-lg overflow-hidden shadow-lg transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-xl" onClick={() => handleSelectPractice(position)}>
                  <div className="h-36 bg-purple-50 flex items-center justify-center border-b border-gray-200">
                    <div className="w-30 h-30 bg-gray-200 bg-contain bg-center bg-no-repeat border border-gray-300" style={{ backgroundImage: position.preview_url ? `url(${position.preview_url})` : '' }}></div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-purple-700 mb-2">{position.title}</h3>
                    <p className="text-gray-600 text-sm mb-3 overflow-hidden" style={{
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      display: '-webkit-box'
                    }}>{position.description}</p>
                    <div className="flex justify-between items-center mb-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium capitalize">{position.type}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                        position.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                        position.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>{position.difficulty}</span>
                    </div>
                    <div className="text-xs text-gray-500">
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
