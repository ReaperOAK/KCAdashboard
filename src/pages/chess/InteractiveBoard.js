import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ChessBoard from '../../components/chess/ChessBoard';
import ChessNavigation from '../../components/chess/ChessNavigation';
import ApiService from '../../utils/api';
import './InteractiveBoard.css';

const InteractiveBoard = () => {
  const { id } = useParams();
  const [position, setPosition] = useState('start');
  const [loading, setLoading] = useState(id ? true : false);
  const [error, setError] = useState(null);
  const [gameData, setGameData] = useState(null);
  const [orientation, setOrientation] = useState('white');

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
            
            // Set orientation based on player color
            if (response.game.player_color === 'black') {
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
    }
  }, [id]);

  // Handle move submission
  const handleMove = async (move, fen) => {
    if (!id) {
      // Just update the local position for the analysis board
      setPosition(fen);
      return;
    }
    
    try {
      // For online games, submit the move to the server
      await ApiService.makeGameMove(id, move, fen);
      // Update local position
      setPosition(fen);
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
          allowMoves={true}
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
          <p><strong>Opponent:</strong> {gameData.opponent_name}</p>
          <p><strong>Your Color:</strong> {gameData.player_color}</p>
          <p><strong>Time Control:</strong> {gameData.time_control || 'Standard'}</p>
          <p><strong>Status:</strong> {gameData.status}</p>
        </div>
      )}
    </div>
  );
};

export default InteractiveBoard;
