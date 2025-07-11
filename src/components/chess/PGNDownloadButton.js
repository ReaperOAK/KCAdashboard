import React, { useCallback } from 'react';

const PGNDownloadButton = React.memo(({ id, pgn }) => {
  const handleDownload = useCallback(() => {
    const blob = new Blob([pgn], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `game-${id}.pgn`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }, [id, pgn]);
  return (
    <div className="mb-4 flex justify-end">
      <button
        type="button"
        className="px-4 py-2 bg-accent text-white rounded hover:bg-secondary transition-all duration-200 font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus:ring-offset-2"
        onClick={handleDownload}
        aria-label="Download PGN file"
        tabIndex={0}
      >
        Download PGN
      </button>
    </div>
  );
});

export default PGNDownloadButton;
