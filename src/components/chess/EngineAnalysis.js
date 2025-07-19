
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

// Optional: pass icon as prop for analysis state
const AnalysisBar = React.memo(function AnalysisBar({ whitePercentage, blackPercentage }) {
  // Use Tailwind tokens for bar colors
  return (
    <div
      className="relative w-8 h-32 bg-gray-light rounded-lg mx-auto mb-4 border border-gray-light shadow"
      aria-label="Engine evaluation bar"
      role="presentation"
    >
      <div
        className="absolute bottom-0 left-0 w-full bg-accent rounded-b-lg transition-all duration-300"
        style={{ height: `${whitePercentage}%` }}
        aria-label={`White win chance: ${Math.round(whitePercentage)}%`}
      />
      <div
        className="absolute top-0 left-0 w-full bg-highlight rounded-t-lg transition-all duration-300"
        style={{ height: `${blackPercentage}%` }}
        aria-label={`Black win chance: ${Math.round(blackPercentage)}%`}
      />
    </div>
  );
});

const EngineAnalysis = React.memo(function EngineAnalysis({ engineEvaluation, icon = null }) {
  const whitePercentage = useMemo(
    () => getWinPercentage(engineEvaluation),
    [engineEvaluation]
  );
  const blackPercentage = useMemo(
    () => 100 - whitePercentage,
    [whitePercentage]
  );

  return (
    <section
      className="bg-background-light dark:bg-background-dark border border-gray-light shadow-md rounded-xl p-4 sm:p-6 max-w-md mx-auto flex flex-row items-center justify-center transition-all duration-200"
      aria-label="Engine analysis panel"
    >
      {icon && (
        <div className="mb-2 text-accent text-3xl" aria-hidden="true">{icon}</div>
      )}
      <h3 className="text-xl font-semibold text-primary mb-3">Engine Analysis</h3>
      {!engineEvaluation ? (
        <div className="text-gray-dark text-center py-4 text-base font-medium flex flex-col items-center gap-2" role="status">
          <span>Waiting for analysis...</span>
        </div>
      ) : (
        <>
          <AnalysisBar whitePercentage={whitePercentage} blackPercentage={blackPercentage} />
          <div className="space-y-2 w-full">
            <div className="text-center">
              <span className="text-2xl font-bold text-primary font-mono">
                {formatEvaluation(engineEvaluation)}
              </span>
            </div>
            <div className="text-center space-y-1"> 
              <div className="text-sm text-gray-dark">Depth: {engineEvaluation.depth}</div>
              {engineEvaluation.bestMove && (
                <div className="text-sm text-gray-dark">
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
