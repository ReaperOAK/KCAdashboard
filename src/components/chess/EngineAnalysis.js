import React from 'react';
import './EngineAnalysis.css';

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
    <div className="engine-analysis">
      <h3>Engine Analysis</h3>
      
      {!engineEvaluation ? (
        <div className="waiting-analysis">Waiting for analysis...</div>
      ) : (
        <>
          <div className="evaluation-bar">
            <div 
              className="white-eval" 
              style={{ height: `${whitePercentage}%` }}
            ></div>
            <div 
              className="black-eval" 
              style={{ height: `${blackPercentage}%` }}
            ></div>
          </div>
          
          <div className="evaluation-info">
            <div className="eval-score">
              {formatEvaluation(engineEvaluation)}
            </div>
            <div className="eval-detail">
              <span>Depth: {engineEvaluation.depth}</span>
              {engineEvaluation.bestMove && (
                <span>Best: {engineEvaluation.bestMove}</span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EngineAnalysis;
