import React from 'react';

/**
 * A simple fallback component that displays PGN content if the viewer fails
 */
const PgnFallback = ({ pgn = '', title = 'PGN Content' }) => {
  if (!pgn) return null;
  
  return (
    <div className="pgn-fallback">
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <pre className="p-4 bg-gray-100 font-mono text-sm overflow-auto rounded border border-gray-300 max-h-80">
        {pgn}
      </pre>
      <div className="mt-2 text-sm text-gray-600">
        <p>The interactive viewer couldn't load. You can still download the PGN file or copy the content above.</p>
      </div>
    </div>
  );
};

export default PgnFallback;
