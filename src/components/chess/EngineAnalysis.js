import React from 'react';

const EngineAnalysis = ({ engineEvaluation }) => {
  // Format evaluation score
  const formatEvaluation = (evaluation) => {
    if (!evaluation) return '0.0';
    
    if (evaluation.scoreType === 'mate') {
      return evaluation.scoreValue > 0 
        ? `Mate in ${evaluation.scoreValue}` 
        : `Mate in ${Math.abs(evaluation.scoreValue)}`;
    }
    
    const score = evaluation.score;
    const formattedScore = score > 0 ? `+${score.toFixed(1)}` : score.toFixed(1);
    return formattedScore;
  };
  
  // Determine win percentage (simplified)
  const getWinPercentage = (evaluation) => {
    if (!evaluation) return 50;
    
    if (evaluation.scoreType === 'mate') {
      return evaluation.scoreValue > 0 ? 100 : 0;
    }
    
    // Convert evaluation to win percentage using a sigmoid function
    const score = evaluation.score;
    const percentage = 50 + 50 * (2 / (1 + Math.exp(-0.5 * score)) - 1);
    
    // Ensure it's within 0-100 range
    return Math.min(Math.max(percentage, 0), 100);
  };

  const whitePercentage = engineEvaluation ? getWinPercentage(engineEvaluation) : 50;
  const blackPercentage = 100 - whitePercentage;

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-purple-900 mb-3">Engine Analysis</h3>
      
      {!engineEvaluation ? (
        <div className="text-gray-500 text-center py-4">Waiting for analysis...</div>
      ) : (
        <>
          <div className="relative w-8 h-32 bg-gray-200 rounded mx-auto mb-4">
            <div 
              className="absolute bottom-0 left-0 w-full bg-gray-800 rounded-b transition-all duration-300" 
              style={{ height: `${whitePercentage}%` }}
            ></div>            <div 
              className="absolute top-0 left-0 w-full bg-white rounded-t transition-all duration-300" 
              style={{ height: `${blackPercentage}%` }}
            ></div>
          </div>
          
          <div className="space-y-2">
            <div className="text-center">
              <span className="text-xl font-bold text-purple-900 font-mono">
                {formatEvaluation(engineEvaluation)}
              </span>
            </div>
            <div className="text-center space-y-1">
              <div className="text-sm text-gray-600">Depth: {engineEvaluation.depth}</div>
              {engineEvaluation.bestMove && (
                <div className="text-sm text-gray-600">Best: <span className="font-mono font-semibold">{engineEvaluation.bestMove}</span></div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EngineAnalysis;
