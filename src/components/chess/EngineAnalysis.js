import React from 'react';
import './EngineAnalysis.css';

const EngineAnalysis = ({ engineEvaluation }) => {
  // Format evaluation score for display
  const formatEvaluation = (eval_) => {
    if (!eval_) return 'N/A';
    
    if (eval_.scoreType === 'mate') {
      return `Mate in ${Math.abs(eval_.scoreValue)}`;
    }
    
    const score = parseFloat(eval_.score);
    return score > 0 ? `+${score.toFixed(2)}` : score.toFixed(2);
  };

  // Calculate evaluation bar percentage
  const getEvaluationPercent = (eval_) => {
    if (!eval_) return 50;
    
    if (eval_.scoreType === 'mate') {
      return eval_.scoreValue > 0 ? 95 : 5;
    }
    
    const score = parseFloat(eval_.score);
    // Use sigmoid function to convert evaluation to percentage
    const percentage = 100 / (1 + Math.exp(-0.5 * score));
    return Math.max(5, Math.min(95, percentage));
  };

  return (
    <div className="engine-analysis">
      <h3>Engine Analysis</h3>
      
      <div className="evaluation-bar-container">
        <div 
          className="evaluation-bar"
          style={{ height: `${getEvaluationPercent(engineEvaluation)}%` }}
        ></div>
      </div>
      
      <div className="evaluation-info">
        <div className="eval-score">
          <span>Evaluation:</span>
          <strong>{formatEvaluation(engineEvaluation)}</strong>
        </div>
        {engineEvaluation && (
          <div className="eval-depth">
            <span>Depth:</span>
            <strong>{engineEvaluation.depth || 0}</strong>
          </div>
        )}
      </div>

      <div className="engine-best-moves">
        {engineEvaluation && engineEvaluation.bestMove && (
          <div className="best-move">
            <span>Best Move:</span>
            <strong>{engineEvaluation.bestMove}</strong>
          </div>
        )}
      </div>
    </div>
  );
};

export default EngineAnalysis;
