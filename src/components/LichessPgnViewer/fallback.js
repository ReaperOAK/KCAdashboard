import React from 'react';

/**
 * A simple fallback component that displays PGN content if the viewer fails
 */
const PgnFallback = ({ pgn = '', title = 'PGN Content' }) => {
  if (!pgn) return null;
  
  return (
    <div className="pgn-fallback p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-medium mb-2 text-[#200e4a]">{title}</h3>
      <pre className="p-4 bg-[#f3f1f9] font-mono text-sm overflow-auto rounded border border-[#c2c1d3] max-h-80 text-[#270185]">
        {pgn}
      </pre>
      <div className="mt-4 p-3 bg-[#f3f1f9] border-l-4 border-[#461fa3] rounded">
        <p className="text-sm text-[#270185]">
          The interactive viewer couldn't load. You can still download the PGN file or copy the content above.
        </p>
        <a 
          href={`data:text/plain;charset=utf-8,${encodeURIComponent(pgn)}`}
          download="chess-game.pgn"
          className="mt-2 inline-block px-3 py-1 bg-[#461fa3] text-white text-sm rounded hover:bg-[#7646eb] transition-colors"
        >
          Download PGN
        </a>
      </div>
    </div>
  );
};

export default PgnFallback;
