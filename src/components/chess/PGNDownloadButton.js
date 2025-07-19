
import React, { useCallback } from 'react';

/**
 * PGNDownloadButton
 * Beautiful, accessible download button for chess PGN files.
 * - Responsive, right-aligned card/panel
 * - Strict Tailwind color tokens and design system
 * - Accessibility: ARIA label, keyboard navigation
 */
const PGNDownloadButton = React.memo(function PGNDownloadButton({ id, pgn }) {
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
    <section className="w-full flex justify-end mb-4" aria-label="Download PGN">
      <button
        type="button"
        className="px-5 py-2 bg-accent text-white rounded-lg shadow-md hover:bg-secondary transition-all duration-200 font-semibold focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 text-sm sm:text-base"
        onClick={handleDownload}
        aria-label="Download PGN file"
        tabIndex={0}
      >
        Download PGN
      </button>
    </section>
  );
});

export default PGNDownloadButton;
