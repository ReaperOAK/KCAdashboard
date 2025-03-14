import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ChessboardWidget = ({ 
  fen = 'start',
  orientation = 'white',
  showCoordinates = true,
  showPieces = true,
  width = '100%',
  height = '400px',
  onMove = null,
  boardTheme = 'brown',
  pieceTheme = 'cburnett',
  mode = 'normal',
  highlightLegalMoves = true
}) => {
  const [boardUrl, setBoardUrl] = useState('');
  
  useEffect(() => {
    // Construct the Lichess embedded URL
    const baseUrl = 'https://lichess.org/embed/';
    
    let url;
    switch (mode) {
      case 'analysis':
        url = `${baseUrl}analysis?fen=${encodeURIComponent(fen)}`;
        break;
      case 'editor':
        url = `${baseUrl}editor?fen=${encodeURIComponent(fen)}`;
        break;
      case 'game':
        url = `${baseUrl}game/${fen}`; // In this case, FEN should be a game ID
        break;
      case 'puzzle':
        url = `${baseUrl}training/${fen}`; // In this case, FEN should be a puzzle ID
        break;
      default:
        url = `${baseUrl}?fen=${encodeURIComponent(fen)}`;
        break;
    }
    
    // Add parameters
    const params = new URLSearchParams();
    
    if (orientation === 'black') {
      params.append('color', 'black');
    }
    
    if (!showCoordinates) {
      params.append('coords', '0');
    }
    
    params.append('theme', boardTheme);
    params.append('pieceSet', pieceTheme);
    
    if (highlightLegalMoves) {
      params.append('highlight', '1');
    }
    
    // Apply parameters
    url = `${url}&${params.toString()}`;
    
    setBoardUrl(url);
  }, [fen, orientation, showCoordinates, boardTheme, pieceTheme, mode, highlightLegalMoves]);
  
  const handleIframeMessage = (event) => {
    // Handle messages from the Lichess embedded board
    if (event.origin === 'https://lichess.org') {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'move' && onMove) {
          onMove(data.move);
        }
      } catch (e) {
        console.error('Error handling Lichess iframe message:', e);
      }
    }
  };
  
  useEffect(() => {
    // Listen for messages from the Lichess embedded board
    if (onMove) {
      window.addEventListener('message', handleIframeMessage);
      return () => {
        window.removeEventListener('message', handleIframeMessage);
      };
    }
  }, [onMove]);
  
  return (
    <div className="chess-board-container" style={{ width, height }}>
      {boardUrl ? (
        <iframe
          src={boardUrl}
          title="Chess Board"
          className="w-full h-full border-0"
          allowTransparency="true"
          frameBorder="0"
        ></iframe>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">
          Loading chessboard...
        </div>
      )}
    </div>
  );
};

ChessboardWidget.propTypes = {
  fen: PropTypes.string,
  orientation: PropTypes.oneOf(['white', 'black']),
  showCoordinates: PropTypes.bool,
  showPieces: PropTypes.bool,
  width: PropTypes.string,
  height: PropTypes.string,
  onMove: PropTypes.func,
  boardTheme: PropTypes.string,
  pieceTheme: PropTypes.string,
  mode: PropTypes.oneOf(['normal', 'analysis', 'editor', 'game', 'puzzle']),
  highlightLegalMoves: PropTypes.bool
};

export default ChessboardWidget;
