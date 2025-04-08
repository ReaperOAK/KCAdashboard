import React, { useState, useEffect } from 'react';
import './EngineAnalysis.css';

const EngineAnalysis = ({ evaluation, fen, stockfishRef }) => {
  const [bestMove, setBestMove] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [depth, setDepth] = useState(15);

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

  // Request deeper analysis
  const analyzePosition = () => {
    if (stockfishRef.current && !isAnalyzing) {
      setIsAnalyzing(true);
      stockfishRef.current.postMessage(`position fen ${fen}`);
      stockfishRef.current.postMessage(`go depth ${depth}`);
      
      // Set up one-time handler for best move
      const originalOnMessage = stockfishRef.current.onmessage;
      stockfishRef.current.onmessage = (e) => {
        const message = e.data;
        
        if (message.startsWith('bestmove')) {
          const tokens = message.split(' ');
          setBestMove(tokens[1]);
          setIsAnalyzing(false);
          
          // Restore original handler
          stockfishRef.current.onmessage = originalOnMessage;
        } else {
          // Pass message to original handler
          originalOnMessage(e);
        }
      };
    }
  };

  useEffect(() => {
    // Reset best move when position changes
    setBestMove(null);
  }, [fen]);

  return (
    <div className="engine-analysis">
      <h3>Engine Analysis</h3>
      
      <div className="evaluation-bar-container">
        <div 
          className="evaluation-bar"
          style={{ height: `${getEvaluationPercent(evaluation)}%` }}
        ></div>
      </div>
      
      <div className="evaluation-info">
        <div className="eval-score">
          <span>Evaluation:</span>
          <strong>{formatEvaluation(evaluation)}</strong>
        </div>
        {evaluation && (
          <div className="eval-depth">
            <span>Depth:</span>
            <strong>{evaluation.depth || 0}</strong>
          </div>
        )}
      </div>
      
      {bestMove && (
        <div className="best-move">
          <span>Best move:</span>
          <strong>{bestMove}</strong>
        </div>
      )}
      
      <div className="analysis-controls">
        <div className="depth-control">
          <label htmlFor="depth-slider">Depth:</label>
          <input 
            id="depth-slider"
            type="range" 
            min="10" 
            max="20" 
            value={depth}
            onChange={(e) => setDepth(parseInt(e.target.value))}
            disabled={isAnalyzing}
          />
          <span>{depth}</span>
        </div>
        
        <button 
          className="analyze-btn"
          onClick={analyzePosition}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze Position'}
        </button>
      </div>
    </div>
  );
};

export default EngineAnalysis;
