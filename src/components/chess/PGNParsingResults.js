import React, { useMemo } from 'react';

function StatCard({ value, label, colorClass }) {
  return (
    <div className={`p-4 rounded-lg ${colorClass} flex flex-col items-center`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm mt-1">{label}</div>
    </div>
  );
}

function GameStatusCell({ isValid, errors, warnings }) {
  return (
    <div className="flex items-center gap-2">
      {isValid ? (
        <span className="text-green-600 " aria-label="Valid game">✓ Valid</span>
      ) : (
        <span className="text-red-600 " title={errors?.join(', ')} aria-label="Invalid game">✗ Invalid</span>
      )}
      {warnings && warnings.length > 0 && (
        <span className="text-yellow-600 " title={warnings.join(', ')} aria-label="Game has warnings">⚠ Warning</span>
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
export const PGNParsingResults = React.memo(function PGNParsingResults({ parsedGames, metadata, formatFileSize }) {
  const validGames = useMemo(() => metadata.validGames || (metadata.totalGames - metadata.gamesWithErrors), [metadata]);
  if (!parsedGames.length) return null;
  return (
    <div className="mb-6">
      <h3 className="text-2xl text-text-dark  font-semibold mb-4">Parsing Results</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <StatCard value={metadata.totalGames} label="Total Games" colorClass="bg-blue-50  text-blue-600 " />
        <StatCard value={validGames} label="Valid Games" colorClass="bg-green-50  text-green-600 " />
        <StatCard value={formatFileSize(metadata.estimatedSize)} label="File Size" colorClass="bg-gray-50  text-gray-600 " />
      </div>
      <div className="max-h-64 overflow-y-auto border border-gray-light  rounded-lg" tabIndex={0} aria-label="Parsed games table">
        <table className="w-full text-sm">
          <thead className="bg-background-light ">
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
                className="border-t border-gray-light  hover:bg-gray-light/40 /40 focus-within:bg-accent/10"
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
    </div>
  );
});

export default PGNParsingResults;
