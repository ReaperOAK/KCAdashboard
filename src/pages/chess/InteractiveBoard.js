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

  // Function to poll for game updates - defined before being used in useEffect
  const pollGameUpdates = useCallback(async () => {
    try {
      const response = await ApiService.getGameDetails(id);
      
      if (response.success && response.game) {
        // Only update if there's a new move (position changed)
        if (response.game.position !== position) {
          setGameData(response.game);
          setPosition(response.game.position);
          setLastMoveAt(response.game.lastMove);
          console.log("Game updated with opponent's move");
        }
      }
    } catch (err) {
      console.error("Error polling for game updates:", err);
    }
  }, [id, position]);

  // Load game data if ID is provided
  useEffect(() => {
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
          } else {
            setError('Failed to load game data');
          }
        } catch (err) {
          setError(err.message || 'Failed to load game');
        } finally {
          setLoading(false);
        }
      };
      
      loadGame();
      
      // Set up polling for game updates every 3 seconds
      const pollInterval = setInterval(() => {
        if (id) {
          pollGameUpdates();
        }
      }, 3000);
      
      return () => clearInterval(pollInterval);
    }
  }, [id, pollGameUpdates]);
  
  // Poll for outgoing challenges that might have been accepted
  useEffect(() => {
    // Only run this effect if we're not already viewing a game
    if (!id) {
      const pollChallenges = async () => {
        try {
          const response = await ApiService.getChallenges();
          
          console.log("Polling for accepted challenges:", response);
          
          if (response.success && response.challenges) {
            // First check for challenges with gameId directly
            const acceptedChallengeWithGameId = response.challenges.find(
              c => c.direction === 'outgoing' && c.gameId
            );
            
            if (acceptedChallengeWithGameId) {
              console.log("Found accepted challenge with gameId:", acceptedChallengeWithGameId);
              // Navigate to the game board
              navigate(`/chess/game/${acceptedChallengeWithGameId.gameId}`);
              return;
            }
            
            // Also check for challenges marked as accepted
            const acceptedChallenge = response.challenges.find(
              c => c.direction === 'outgoing' && c.status === 'accepted'
            );
            
            if (acceptedChallenge) {
              console.log("Found accepted challenge without gameId:", acceptedChallenge);
              
              // If we have a recently created game between these players, try to find it
              if (acceptedChallenge.challenger && acceptedChallenge.recipient) {
                try {
                  const gamesResponse = await ApiService.getChessGames();
                  console.log("Checking games for match:", gamesResponse);
                  
                  if (gamesResponse.success && gamesResponse.games) {
                    // Find the most recent game between these players
                    const matchingGame = gamesResponse.games.find(g => 
                      (g.white_player.id === acceptedChallenge.challenger.id && 
                       g.black_player.id === acceptedChallenge.recipient.id) ||
                      (g.white_player.id === acceptedChallenge.recipient.id && 
                       g.black_player.id === acceptedChallenge.challenger.id)
                    );
                    
                    if (matchingGame) {
                      console.log("Found matching game:", matchingGame);
                      navigate(`/chess/game/${matchingGame.id}`);
                      return;
                    }
                  }
                } catch (err) {
                  console.error("Error fetching games to match with challenge:", err);
                }
              }
            }
          }
        } catch (err) {
          console.error("Error polling for challenges:", err);
        }
      };
      
      // Run once immediately
      pollChallenges();
      
      // Then set up polling every 3 seconds (reduced from 5 for faster response)
      const challengeInterval = setInterval(pollChallenges, 3000);
      
      return () => clearInterval(challengeInterval);
    }
  }, [id, navigate]);
  
  // Handle move submission
  const handleMove = async (move, fen) => {
    if (!id) {
      // Just update the local position for the analysis board
      setPosition(fen);
      return;
    }
    
    try {
      // For online games, submit the move to the server
      const response = await ApiService.makeGameMove(id, move, fen);
      if (response.success) {
        // Update local position
        setPosition(fen);
        setLastMoveAt(response.lastMoveAt);
        
        // Update game data to reflect it's the opponent's turn now
        setGameData(prev => ({
          ...prev,
          yourTurn: false
        }));
      }
    } catch (error) {
      console.error('Failed to submit move:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading chess board...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
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
          <p><strong>Opponent:</strong> {gameData.opponent.name}</p>
          <p><strong>Your Color:</strong> {gameData.yourColor}</p>
          <p><strong>Time Control:</strong> {gameData.timeControl || 'Standard'}</p>
          <p><strong>Status:</strong> {gameData.status}</p>
          <p><strong>Turn:</strong> {gameData.yourTurn ? 'Your move' : "Opponent's move"}</p>
          <p><strong>Last Move At:</strong> {new Date(lastMoveAt).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
};

export default InteractiveBoard;
