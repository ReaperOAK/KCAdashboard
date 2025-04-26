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
    <div className="bg-[#f3f1f9] rounded-lg p-3 shadow-md flex flex-col">
      <h3 className="mt-0 mb-3 text-[#200e4a] text-base font-semibold">Engine Analysis</h3>
      
      {!engineEvaluation ? (
        <div className="text-[#3b3a52] italic text-center py-2.5">Waiting for analysis...</div>
      ) : (
        <>
          <div className="h-40 w-[30px] border border-[#c2c1d3] rounded overflow-hidden flex flex-col mx-auto mb-2.5">
            <div 
              className="bg-[#f0f0f0] w-full transition-height duration-500 ease-in-out" 
              style={{ height: `${whitePercentage}%` }}
            ></div>
            <div 
              className="bg-[#3b3a52] w-full transition-height duration-500 ease-in-out" 
              style={{ height: `${blackPercentage}%` }}
            ></div>
          </div>
          
          <div className="flex flex-col items-center mt-1">
            <div className="text-xl font-bold text-[#200e4a] mb-1">
              {formatEvaluation(engineEvaluation)}
            </div>
            <div className="flex flex-col items-center text-sm text-[#3b3a52]">
              <span className="my-0.5">Depth: {engineEvaluation.depth}</span>
              {engineEvaluation.bestMove && (
                <span className="my-0.5">Best: {engineEvaluation.bestMove}</span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EngineAnalysis;
