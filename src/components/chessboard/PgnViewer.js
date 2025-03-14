import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ChessboardWidget from './ChessboardWidget';

const PgnViewer = ({ 
  pgn, 
  width = '100%', 
  height = '500px',
  showControls = true,
  orientation = 'white',
  boardTheme = 'brown',
  pieceTheme = 'cburnett'
}) => {
  const [lichessStudyUrl, setLichessStudyUrl] = useState('');
  
  useEffect(() => {
    if (!pgn) return;
    
    // Create a URL for embedding the PGN in Lichess
    const encodedPgn = encodeURIComponent(pgn);
    const url = `https://lichess.org/study/embed?pgn=${encodedPgn}&theme=${boardTheme}&pieceSet=${pieceTheme}&bg=auto&orientation=${orientation}`;
    setLichessStudyUrl(url);
    
  }, [pgn, orientation, boardTheme, pieceTheme]);
  
  if (!pgn) {
    return (
      <div className="p-4 bg-gray-100 text-gray-500 rounded-md text-center">
        No PGN content provided
      </div>
    );
  }
  
  return (
    <div className="chess-pgn-viewer">
      {lichessStudyUrl && (
        <iframe 
          src={lichessStudyUrl}
          style={{ width, height }}
          title="Chess PGN Viewer"
          className="border-0"
          allowTransparency="true"
          frameBorder="0"
        ></iframe>
      )}
    </div>
  );
};

PgnViewer.propTypes = {
  pgn: PropTypes.string.isRequired,
  width: PropTypes.string,
  height: PropTypes.string,
  showControls: PropTypes.bool,
  orientation: PropTypes.oneOf(['white', 'black']),
  boardTheme: PropTypes.string,
  pieceTheme: PropTypes.string
};

export default PgnViewer;
