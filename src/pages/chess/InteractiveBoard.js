import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChessBoard from '../../components/chess/ChessBoard';
import ChessNavigation from '../../components/chess/ChessNavigation';
import ApiService from '../../utils/api';
import './InteractiveBoard.css';

const InteractiveBoard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [position, setPosition] = useState('start');
  const [loading, setLoading] = useState(id ? true : false);
  const [error, setError] = useState(null);
  const [gameData, setGameData] = useState(null);
  const [orientation, setOrientation] = useState('white');
  const [lastMoveAt, setLastMoveAt] = useState(null);

  // Simple function to poll for game updates
  const pollGameUpdates = useCallback(async () => {
    if (!id) return;
    
    try {
      const response = await ApiService.getGameDetails(id);
      
      if (response.success && response.game) {
        // Only update if the position has changed
        if (response.game.position !== position) {
          console.log("Game updated with opponent's move:", {
            newPosition: response.game.position,
            lastMoveAt: response.game.lastMove
          });
          
          // Update the board with the new position
          setGameData(response.game);
          setPosition(response.game.position);
          setLastMoveAt(response.game.lastMove);
        }
      }
    } catch (err) {
      console.error("Error polling for game updates:", err);
    }
  }, [id, position]);

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
    return <div className="loading">Loading chess board...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error">{error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="reload-button"
        >
          Reload Page
        </button>
      </div>
    );
  }

  return (
    <div className="interactive-board-page">
      <h1>{id ? 'Game Board' : 'Analysis Board'}</h1>
      
      <ChessNavigation />
      
      <div className="board-container">
        <ChessBoard 
          position={position}
          orientation={orientation}
          allowMoves={id ? (gameData && gameData.yourTurn) : true}
          showHistory={true}
          showAnalysis={!id}
          onMove={handleMove}
          playMode={id ? 'vs-human' : 'analysis'}
          width={600}
        />
      </div>
      
      {gameData && (
        <div className="game-info">
          <h2>Game Information</h2>
          <p><strong>Opponent:</strong> {gameData.opponent && gameData.opponent.name}</p>
          <p><strong>Your Color:</strong> {gameData.yourColor}</p>
          <p><strong>Time Control:</strong> {gameData.timeControl || 'Standard'}</p>
          <p><strong>Turn:</strong> <span className={gameData.yourTurn ? "your-turn" : "opponent-turn"}>
            {gameData.yourTurn ? 'Your move' : "Opponent's move"}
          </span></p>
          {lastMoveAt && <p><strong>Last Move:</strong> {new Date(lastMoveAt).toLocaleString()}</p>}
        </div>
      )}
    </div>
  );
};

export default InteractiveBoard;
