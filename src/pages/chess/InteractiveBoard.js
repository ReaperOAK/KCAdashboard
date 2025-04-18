import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  // Use ref to track consecutive error count for polling
  const errorCountRef = useRef(0);
  const maxConsecutiveErrors = 5;

  // Function to poll for game updates - defined before being used in useEffect
  const pollGameUpdates = useCallback(async () => {
    if (!id) return;
    
    try {
      const response = await ApiService.getGameDetails(id);
      
      // Reset error count on successful request
      errorCountRef.current = 0;
      
      if (response.success && response.game) {
        // Check if there's new data to update - use multiple conditions to detect changes
        const shouldUpdate = (
          // Position has changed
          response.game.position !== position ||
          // Turn has changed
          (gameData && response.game.yourTurn !== gameData.yourTurn) ||
          // Last move timestamp is different
          (response.game.lastMove && lastMoveAt !== response.game.lastMove)
        );
        
        if (shouldUpdate) {
          console.log("Game updated with opponent's move:", {
            oldPosition: position,
            newPosition: response.game.position,
            lastMoveAt: response.game.lastMove
          });
          
          // Update all game data
          setGameData(response.game);
          setPosition(response.game.position);
          setLastMoveAt(response.game.lastMove);
        }
      }
    } catch (err) {
      // Increment error counter
      errorCountRef.current += 1;
      console.error(`Error polling for game updates (${errorCountRef.current}/${maxConsecutiveErrors}):`, err);
      
      // If too many consecutive errors, stop polling and show error
      if (errorCountRef.current >= maxConsecutiveErrors) {
        setError(`Connection issues detected. Please reload the page. (${err.message})`);
      }
    }
  }, [id, position, gameData, lastMoveAt]);

  // Load game data if ID is provided
  useEffect(() => {
    let pollInterval = null;
    
    if (id) {
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
            
            // Mark initial load as complete
            setInitialLoadComplete(true);
          } else {
            setError('Failed to load game data');
          }
        } catch (err) {
          console.error('Error loading game:', err);
          setError(err.message || 'Failed to load game');
        } finally {
          setLoading(false);
        }
      };
      
      // Load the game data
      loadGame();
      
      // Set up polling only after the initial load is complete
      pollInterval = setInterval(() => {
        if (id && !loading) {
          pollGameUpdates();
        }
      }, 1500);
    }
    
    // Clean up interval on unmount
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [id, pollGameUpdates, loading]);
  
  // Poll for outgoing challenges that might have been accepted
  useEffect(() => {
    // Only run this effect if we're not already viewing a game
    let challengeInterval = null;
    
    if (!id) {
      // Track whether we've already found and processed a challenge
      const foundChallengesRef = useRef(new Set());
      
      const pollChallenges = async () => {
        try {
          const response = await ApiService.getChallenges();
          
          if (response.success && response.challenges) {
            // First check for challenges with gameId directly - but only process each once
            const acceptedChallengeWithGameId = response.challenges.find(
              c => c.direction === 'outgoing' && c.gameId && 
                  c.status === 'accepted' && 
                  !foundChallengesRef.current.has(`${c.id}-${c.gameId}`)
            );
            
            if (acceptedChallengeWithGameId) {
              console.log("Found new accepted challenge with gameId:", acceptedChallengeWithGameId);
              
              // Mark this challenge as processed
              foundChallengesRef.current.add(`${acceptedChallengeWithGameId.id}-${acceptedChallengeWithGameId.gameId}`);
              
              // Check if the game was created in the last 5 minutes (300 seconds)
              const challengeTime = new Date(acceptedChallengeWithGameId.created_at).getTime();
              const currentTime = new Date().getTime();
              const fiveMinutesInMs = 5 * 60 * 1000;
              
              if (currentTime - challengeTime < fiveMinutesInMs) {
                // Navigate to the game board for recently created games only
                navigate(`/chess/game/${acceptedChallengeWithGameId.gameId}`);
                return;
              }
            }
          }
        } catch (err) {
          console.error("Error polling for challenges:", err);
        }
      };
      
      // Run once immediately
      pollChallenges();
      
      // Then set up polling every 5 seconds
      challengeInterval = setInterval(pollChallenges, 5000);
    }
    
    return () => {
      if (challengeInterval) {
        clearInterval(challengeInterval);
      }
    };
  }, [id, navigate]);
  
  // Handle move submission
  const handleMove = async (move, fen) => {
    if (!id) {
      // Just update the local position for the analysis board
      setPosition(fen);
      return;
    }
    
    try {
      // Optimistically update the UI first for a smoother experience
      setPosition(fen);
      
      // Update game data to reflect it's the opponent's turn now
      setGameData(prev => ({
        ...prev,
        yourTurn: false,
        position: fen
      }));
      
      // For online games, submit the move to the server
      const response = await ApiService.makeGameMove(id, move, fen);
      if (response.success) {
        // Update timestamp from server response
        setLastMoveAt(response.lastMoveAt || new Date().toISOString());
        
        // Force a poll update after a short delay to ensure synchronization
        setTimeout(() => {
          pollGameUpdates();
        }, 500);
      }
    } catch (error) {
      console.error('Failed to submit move:', error);
      
      // On error, reload the game state to ensure consistency
      try {
        const response = await ApiService.getGameDetails(id);
        if (response.success && response.game) {
          setGameData(response.game);
          setPosition(response.game.position);
          setLastMoveAt(response.game.lastMove);
        }
      } catch (refreshError) {
        console.error('Failed to refresh game after move error:', refreshError);
      }
    }
  };

  if (loading && !initialLoadComplete) {
    return <div className="loading">Loading chess board...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error">{error}</div>
        <button 
          className="reload-button" 
          onClick={() => window.location.reload()}
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
          showAnalysis={!id} // Only show analysis in analysis mode
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
          <p><strong>Status:</strong> {gameData.status}</p>
          <p><strong>Turn:</strong> {gameData.yourTurn ? 'Your move' : "Opponent's move"}</p>
          {lastMoveAt && <p><strong>Last Move At:</strong> {new Date(lastMoveAt).toLocaleString()}</p>}
        </div>
      )}
    </div>
  );
};

export default InteractiveBoard;
