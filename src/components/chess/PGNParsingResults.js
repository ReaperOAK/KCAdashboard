import React, { useMemo } from 'react';

function StatCard({ value, label, colorClass }) {
  return (
    <div className={`p-4 rounded-xl ${colorClass} flex flex-col items-center shadow-md`}>
      <div className="text-2xl font-bold text-primary">{value}</div>
      <div className="text-sm mt-1 text-gray-dark">{label}</div>
    </div>
  );
}

function GameStatusCell({ isValid, errors, warnings }) {
  return (
    <div className="flex items-center gap-2">
      {isValid ? (
        <span className="bg-success text-white px-2 py-1 rounded-full text-xs font-semibold" aria-label="Valid game">✓ Valid</span>
      ) : (
        <span className="bg-error text-white px-2 py-1 rounded-full text-xs font-semibold" title={errors?.join(', ')} aria-label="Invalid game">✗ Invalid</span>
      )}
      {warnings && warnings.length > 0 && (
        <span className="bg-warning text-white px-2 py-1 rounded-full text-xs font-semibold" title={warnings.join(', ')} aria-label="Game has warnings">⚠ Warning</span>
      )}
    </div>
  );
}

/**
 * PGNParsingResults - Accessible, memoized parsing results table and stats for PGN uploads.
 * @param {Array} parsedGames
 * @param {Object} metadata
 * @param {Function} formatFileSize
 */
const PGNParsingResults = React.memo(function PGNParsingResults({ parsedGames, metadata, formatFileSize }) {
  const validGames = useMemo(() => metadata.validGames || (metadata.totalGames - metadata.gamesWithErrors), [metadata]);
  if (!parsedGames.length) return null;
  return (
    <section className="mb-6 w-full max-w-7xl mx-auto bg-background-light dark:bg-background-dark border border-gray-light shadow-md rounded-xl p-6">
      <h3 className="text-2xl text-primary font-medium mb-4">Parsing Results</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <StatCard value={metadata.totalGames} label="Total Games" colorClass="bg-accent/10" />
        <StatCard value={validGames} label="Valid Games" colorClass="bg-success/10" />
        <StatCard value={formatFileSize(metadata.estimatedSize)} label="File Size" colorClass="bg-gray-light/20" />
      </div>
      <div className="max-h-64 overflow-y-auto border border-gray-light rounded-lg" tabIndex={0} aria-label="Parsed games table">
        <table className="w-full text-xs sm:text-sm">
          <thead className="bg-primary text-white text-xs sm:text-sm uppercase sticky top-0 z-10">
            <tr>
              <th className="px-4 py-2 text-left">#</th>
              <th className="px-4 py-2 text-left">White</th>
              <th className="px-4 py-2 text-left">Black</th>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Moves</th>
              <th className="px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {parsedGames.map((game, index) => (
              <tr
                key={index}
                className="border-t border-gray-light hover:bg-gray-light/40 focus-within:bg-accent/10 transition-colors"
                tabIndex={-1}
              >
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">{game.headers.White || 'Unknown'}</td>
                <td className="px-4 py-2">{game.headers.Black || 'Unknown'}</td>
                <td className="px-4 py-2">{game.headers.Date || 'Unknown'}</td>
                <td className="px-4 py-2">{game.moveCount}</td>
                <td className="px-4 py-2">
                  <GameStatusCell isValid={game.isValid} errors={game.errors} warnings={game.warnings} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
});

export default PGNParsingResults;
