
import React, { useMemo } from 'react';

function formatEvaluation(evaluation) {
  if (!evaluation) return '0.0';
  if (evaluation.scoreType === 'mate') {
    return evaluation.scoreValue > 0
      ? `Mate in ${evaluation.scoreValue}`
      : `Mate in ${Math.abs(evaluation.scoreValue)}`;
  }
  const score = evaluation.score;
  return score > 0 ? `+${score.toFixed(1)}` : score.toFixed(1);
}

function getWinPercentage(evaluation) {
  if (!evaluation) return 50;
  if (evaluation.scoreType === 'mate') {
    return evaluation.scoreValue > 0 ? 100 : 0;
  }
  const score = evaluation.score;
  const percentage = 50 + 50 * (2 / (1 + Math.exp(-0.5 * score)) - 1);
  return Math.min(Math.max(percentage, 0), 100);
}

const AnalysisBar = React.memo(function AnalysisBar({ whitePercentage, blackPercentage }) {
  // Accessibility: aria-label for bar, role for progressbar
  return (
    <div
      className="relative w-8 h-32 bg-gray-200 rounded mx-auto mb-4"
      aria-label="Engine evaluation bar"
      role="presentation"
    >
      <div
        className="absolute bottom-0 left-0 w-full bg-gray-800 rounded-b transition-all duration-300"
        style={{ height: `${whitePercentage}%` }}
        aria-label={`White win chance: ${Math.round(whitePercentage)}%`}
      />
      <div
        className="absolute top-0 left-0 w-full bg-white rounded-t transition-all duration-300"
        style={{ height: `${blackPercentage}%` }}
        aria-label={`Black win chance: ${Math.round(blackPercentage)}%`}
      />
    </div>
  );
});

const EngineAnalysis = React.memo(function EngineAnalysis({ engineEvaluation }) {
  const whitePercentage = useMemo(
    () => getWinPercentage(engineEvaluation),
    [engineEvaluation]
  );
  const blackPercentage = useMemo(
    () => 100 - whitePercentage,
    [whitePercentage]
  );

  return (
    <section className="bg-white rounded-lg p-4 shadow-md" aria-label="Engine analysis panel">
      <h3 className="text-lg font-semibold text-primary mb-3">Engine Analysis</h3>
      {!engineEvaluation ? (
        <div className="text-gray-500 text-center py-4" role="status">Waiting for analysis...</div>
      ) : (
        <>
          <AnalysisBar whitePercentage={whitePercentage} blackPercentage={blackPercentage} />
          <div className="space-y-2">
            <div className="text-center">
              <span className="text-xl font-bold text-primary font-mono">
                {formatEvaluation(engineEvaluation)}
              </span>
            </div>
            <div className="text-center space-y-1">
              <div className="text-sm text-gray-600">Depth: {engineEvaluation.depth}</div>
              {engineEvaluation.bestMove && (
                <div className="text-sm text-gray-600">
                  Best: <span className="font-mono font-semibold">{engineEvaluation.bestMove}</span>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
});

export default EngineAnalysis;
