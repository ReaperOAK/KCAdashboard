import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChessBoard from '../../components/chess/ChessBoard';
import ChessNavigation from '../../components/chess/ChessNavigation';
import ApiService from '../../utils/api';

const InteractiveBoard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [position, setPosition] = useState('start');
  const [loading, setLoading] = useState(id ? true : false);
  const [error, setError] = useState(null);
  const [gameData, setGameData] = useState(null);
  const [orientation, setOrientation] = useState('white');
  const [lastMoveAt, setLastMoveAt] = useState(null);
  // Simul/active games state
  const [activeGames, setActiveGames] = useState([]);

  // Fetch active games for switcher (simul support)
  useEffect(() => {
    ApiService.getChessGames('active').then(res => {
      if (res.success && Array.isArray(res.games)) {
        // Try to get user ID from localStorage (if stored as 'user' object)
        let userId = null;
        try {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const userObj = JSON.parse(userStr);
            userId = userObj.id || userObj.user_id || userObj._id;
          }
        } catch {}

        // Fallback: try to infer from first game if not found
        if (!userId && res.games.length > 0) {
          // If you are always white or black in all games, this will not work for all users
          // but it's a fallback for single-user dev
          userId = res.games[0].white_player?.id;
        }

        // Attach opponent name and your color to each game
        const gamesWithOpponent = res.games.map(game => {
          let yourColor = '';
          let opponent = { name: 'Unknown' };
          if (userId) {
            if (game.white_player && String(game.white_player.id) === String(userId)) {
              yourColor = 'white';
              opponent = game.black_player || { name: 'Unknown' };
            } else if (game.black_player && String(game.black_player.id) === String(userId)) {
              yourColor = 'black';
              opponent = game.white_player || { name: 'Unknown' };
            }
          }
          return { ...game, yourColor, opponent };
        });
        setActiveGames(gamesWithOpponent);
      }
    });
  }, []);

  // Simple function to poll for game updates and handle game over
  const pollGameUpdates = useCallback(async () => {
    if (!id) return;
    try {
      const response = await ApiService.getGameDetails(id);
      if (response.success && response.game) {
        // If game is no longer active, redirect both players
        if (response.game.status && response.game.status !== 'active') {
          // Optionally, show a message before redirecting
          alert('Game over: ' + (response.game.reason || response.game.status) + '\nYou will be redirected to the game lobby.');
          navigate('/chess/play');
          return;
        }
        // Only update if the position has changed
        if (response.game.position !== position) {
          console.log("Game updated with opponent's move:", {
            newPosition: response.game.position,
            lastMoveAt: response.game.lastMove
          });
          setGameData(response.game);
          setPosition(response.game.position);
          setLastMoveAt(response.game.lastMove);
        }
      }
    } catch (err) {
      console.error("Error polling for game updates:", err);
    }
  }, [id, position, navigate]);

  // Load game data when ID is provided
  useEffect(() => {
    let pollInterval = null;
    
    if (id) {
      // Initial game load
      const loadGame = async () => {
        try {
          setLoading(true);
          const response = await ApiService.getGameDetails(id);
          
          if (response.success && response.game) {
            setGameData(response.game);
            setPosition(response.game.position || 'start');
            setLastMoveAt(response.game.lastMove);
            
            // Set orientation based on player color
            if (response.game.yourColor === 'black') {
              setOrientation('black');
            }
          } else {
            setError('Failed to load game data');
          }
        } catch (err) {
          console.error('Error loading game:', err);
          setError('Failed to load game. Please refresh the page.');
        } finally {
          setLoading(false);
        }
      };
      
      // Load the game initially
      loadGame();
      
      // Set up polling for opponent's moves every 2 seconds
      pollInterval = setInterval(pollGameUpdates, 2000);
    }
    
    // Clean up interval on unmount
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [id, pollGameUpdates]);
  
  // Check if a challenge has been accepted (only run when not viewing a game)
  useEffect(() => {
    let checkChallengeInterval = null;
    
    if (!id) {
      const checkForAcceptedChallenges = async () => {
        try {
          const response = await ApiService.getChallenges();
          
          if (response.success && response.challenges) {
            // Find an accepted challenge with a game ID
            const acceptedChallenge = response.challenges.find(
              c => c.direction === 'outgoing' && c.gameId && c.status === 'accepted'
            );
            
            if (acceptedChallenge) {
              // Navigate to the game
              navigate(`/chess/game/${acceptedChallenge.gameId}`);
            }
          }
        } catch (err) {
          console.error("Error checking challenges:", err);
        }
      };
      
      // Check immediately and then every 3 seconds
      checkForAcceptedChallenges();
      checkChallengeInterval = setInterval(checkForAcceptedChallenges, 3000);
    }
    
    return () => {
      if (checkChallengeInterval) {
        clearInterval(checkChallengeInterval);
      }
    };
  }, [id, navigate]);
  
  // Handle move submission
  const handleMove = async (move, fen) => {
    if (!id) {
      // Just update local position for analysis board
      setPosition(fen);
      return;
    }
    
    try {
      // Update UI immediately for a responsive feel
      setPosition(fen);
      setGameData(prev => ({
        ...prev,
        yourTurn: false
      }));
      
      // Send move to server
      await ApiService.makeGameMove(id, move, fen);
      
      // No need to poll right away - the regular polling will handle it
    } catch (error) {
      console.error('Failed to submit move:', error);
      
      // Revert to last known good state on error
      const response = await ApiService.getGameDetails(id);
      if (response.success && response.game) {
        setGameData(response.game);
        setPosition(response.game.position);
      }
    }
  };
  if (loading) {
    return <div className="flex justify-center items-center min-h-96 text-purple-700 font-bold text-lg">Loading chess board...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 space-y-4">
        <div className="text-red-600 font-bold text-center">{error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-purple-700 text-white border-none rounded cursor-pointer hover:bg-purple-800 transition-colors"
        >
          Reload Page
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-5 pb-10">
      <h1 className="text-3xl font-bold text-purple-900 mb-5">{id ? 'Game Board' : 'Analysis Board'}</h1>
      <ChessNavigation />

      {/* Simul/Active Games Switcher */}
      {activeGames.length > 1 && id && (
        <div className="mb-6 flex items-center gap-2">
          <span className="font-semibold">Switch Game:</span>
          <select
            value={id}
            onChange={e => navigate(`/chess/game/${e.target.value}`)}
            className="border rounded px-2 py-1"
          >
            {activeGames.map(game => (
              <option key={game.id} value={game.id}>
                vs {game.opponent?.name || 'Unknown'} ({game.yourColor})
                {game.status === 'active' ? '' : ' (ended)'}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex justify-center mb-6">
        <ChessBoard 
          position={position}
          orientation={orientation}
          allowMoves={id ? (gameData && gameData.yourTurn && gameData.status === 'active') : true}
          showHistory={true}
          showAnalysis={!id}
          onMove={handleMove}
          playMode={id ? 'vs-human' : 'analysis'}
          width={600}
          gameId={id}
        />
      </div>
      {gameData && (
        <div className="bg-white rounded-lg p-6 shadow-sm max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-purple-700 mb-4">Game Information</h2>
          {gameData.status === 'abandoned' && (
            <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg mb-4">
              <div className="text-orange-800 font-semibold">Game Expired</div>
              <div className="text-orange-700 text-sm">
                This game was automatically expired due to inactivity. 
                {gameData.reason === 'inactivity timeout' && ' No moves were made for an extended period.'}
              </div>
            </div>
          )}
          <div className="space-y-2">
            <p><strong className="text-gray-700">Opponent:</strong> <span className="text-gray-900">{gameData.opponent && gameData.opponent.name}</span></p>
            <p><strong className="text-gray-700">Your Color:</strong> <span className="text-gray-900 capitalize">{gameData.yourColor}</span></p>
            <p><strong className="text-gray-700">Time Control:</strong> <span className="text-gray-900">{gameData.timeControl || 'Standard'}</span></p>
            <p><strong className="text-gray-700">Turn:</strong> <span className={`font-semibold ${gameData.yourTurn ? "text-green-600" : "text-blue-600"}`}>
              {gameData.yourTurn ? 'Your move' : "Opponent's move"}
            </span></p>
            {lastMoveAt && <p><strong className="text-gray-700">Last Move:</strong> <span className="text-gray-900">{new Date(lastMoveAt).toLocaleString()}</span></p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveBoard;
