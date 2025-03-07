import React, { useEffect, useRef } from 'react';

/**
 * A simple PGN viewer that only uses an iframe to Lichess
 * This avoids all import issues with the npm package
 */
const SimplePgnViewer = ({ pgn }) => {
  const iframeRef = useRef(null);

  useEffect(() => {
    if (!pgn || !iframeRef.current) return;
    
    // Clean the PGN and encode it for the URL
    const cleanedPgn = pgn.trim();
    
    // Use different approaches based on PGN size
    if (cleanedPgn.length > 2000) {
      // For large PGNs, load the basic analysis board first
      iframeRef.current.src = 'https://lichess.org/analysis';
      
      // After the iframe loads, try to inject the PGN
      iframeRef.current.onload = () => {
        try {
          iframeRef.current.contentWindow.postMessage({
            action: 'analyse.load',
            pgn: cleanedPgn
          }, 'https://lichess.org');
        } catch (e) {
          console.error('Error sending PGN to iframe:', e);
        }
      };
    } else {
      // For smaller PGNs, use URL parameter approach
      iframeRef.current.src = `https://lichess.org/analysis/pgn/${encodeURIComponent(cleanedPgn)}`;
    }
  }, [pgn]);

  return (
    <div className="w-full h-full min-h-[500px] bg-gray-100 rounded border">
      {/* Instructions for users */}
      <div className="bg-blue-50 p-2 text-sm text-blue-700 border-b border-blue-200">
        Viewing PGN in Lichess analysis board. You can move pieces and explore variations.
      </div>
      
      {/* The actual iframe */}
      <iframe
        ref={iframeRef}
        title="Lichess Analysis Board"
        className="w-full h-[calc(100%-36px)]"
        style={{ minHeight: '465px', border: 'none' }}
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default SimplePgnViewer;
