import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import './ChessBoard.css';

const ChessBoard = ({
  position = 'start',
  orientation = 'white',
  allowMoves = true,
  showNotation = true,
  showHistory = true,
  showAnalysis = false,
  onMove = null,
  engineLevel = 10,
  playMode = 'analysis', // analysis, vs-ai, vs-human
  timeControl = null,
  customSquareStyles = {},
  width = 560,
}) => {
  const [game, setGame] = useState(new Chess(position !== 'start' ? position : undefined));
  const [fen, setFen] = useState(game.fen());
  const [moveFrom, setMoveFrom] = useState('');
  const [rightClickedSquares, setRightClickedSquares] = useState({});
  const [optionSquares, setOptionSquares] = useState({});
  const [history, setHistory] = useState([]);
  const [currentMove, setCurrentMove] = useState(-1);
  const [orientation_, setOrientation] = useState(orientation);
  const [engineEvaluation, setEngineEvaluation] = useState(null);
  const [isChecked, setIsChecked] = useState(false);
  const [gameOver, setGameOver] = useState({
    isOver: false,
    result: '',
    reason: ''
  });
  
  const stockfishWorker = useRef(null);
  
  // Initialize Stockfish worker if analysis is enabled
  useEffect(() => {
    if (showAnalysis && stockfishWorker.current === null) {
      stockfishWorker.current = new Worker('/stockfish.js');

      stockfishWorker.current.onmessage = (e) => {
        const message = e.data;
        
        if (message.startsWith('info depth') && message.includes('score')) {
          const tokens = message.split(' ');
          const depthIndex = tokens.indexOf('depth');
          const scoreIndex = tokens.indexOf('score');
          
          if (depthIndex !== -1 && scoreIndex !== -1) {
            const depth = parseInt(tokens[depthIndex + 1]);
            const scoreType = tokens[scoreIndex + 1]; // cp (centipawns) or mate
            const scoreValue = parseInt(tokens[scoreIndex + 2]);
            
            if (depth >= 12) { // Only use deeper analysis
              let evaluation = 0;
              if (scoreType === 'cp') {
                evaluation = scoreValue / 100; // Convert centipawns to pawns
              } else if (scoreType === 'mate') {
                evaluation = scoreValue > 0 ? 100 : -100; // Arbitrary high value for mate
              }
              
              setEngineEvaluation({
                score: evaluation,
                depth,
                scoreType,
                scoreValue
              });
            }
          }
        }
      };

      // Set engine level
      stockfishWorker.current.postMessage(`setoption name Skill Level value ${engineLevel}`);
    }

    return () => {
      if (stockfishWorker.current) {
        stockfishWorker.current.terminate();
        stockfishWorker.current = null;
      }
    };
  }, [showAnalysis, engineLevel]);

  // Update FEN and analyze position
  useEffect(() => {
    setFen(game.fen());
    setIsChecked(game.inCheck());
    
    // Check for game over conditions
    if (game.isGameOver()) {
      const result = { isOver: true };
      
      if (game.isCheckmate()) {
        result.reason = 'checkmate';
        result.result = game.turn() === 'w' ? '0-1' : '1-0';
      } else if (game.isDraw()) {
        result.reason = game.isStalemate() ? 'stalemate' : 
                        game.isThreefoldRepetition() ? 'repetition' : 
                        game.isInsufficientMaterial() ? 'insufficient material' : 'fifty-move rule';
        result.result = '½-½';
      }
      
      setGameOver(result);
    }

    // Analyze position with Stockfish
    if (showAnalysis && stockfishWorker.current) {
      stockfishWorker.current.postMessage(`position fen ${game.fen()}`);
      stockfishWorker.current.postMessage('go depth 15');
    }
  }, [game, showAnalysis]);

  // Record move history
  useEffect(() => {
    const moveHistory = [];
    const history = game.history({ verbose: true });
    
    for (let i = 0; i < history.length; i += 2) {
      const moveNumber = Math.floor(i / 2) + 1;
      const whiteMove = history[i];
      const blackMove = history[i + 1];
      
      moveHistory.push({
        moveNumber,
        white: whiteMove ? { from: whiteMove.from, to: whiteMove.to, san: whiteMove.san } : null,
        black: blackMove ? { from: blackMove.from, to: blackMove.to, san: blackMove.san } : null
      });
    }
    
    setHistory(moveHistory);
    setCurrentMove(history.length - 1);
  }, [game]);

  // Get possible moves for a square
  function getMoveOptions(square) {
    const moves = game.moves({
      square,
      verbose: true
    });
    
    if (moves.length === 0) {
      return;
    }

    const newSquares = {};
    moves.forEach((move) => {
      newSquares[move.to] = {
        background:
          game.get(move.to) && game.get(move.to).color !== game.get(square).color
            ? 'radial-gradient(circle, rgba(255,0,0,.1) 85%, transparent 85%)'
            : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
        borderRadius: '50%'
      };
    });
    newSquares[square] = {
      background: 'rgba(255, 255, 0, 0.4)'
    };
    setOptionSquares(newSquares);
  }

  function resetFirstMove() {
    setMoveFrom('');
    setOptionSquares({});
  }

  // Square click handler for making moves
  function onSquareClick(square) {
    if (!allowMoves) return;
    
    const turnColor = game.turn() === 'w' ? 'white' : 'black';
    const playerOrientation = orientation_.charAt(0).toLowerCase();
    
    // In vs-ai or vs-human mode, only allow moving pieces when it's your turn
    if ((playMode === 'vs-ai' || playMode === 'vs-human') && 
        ((playerOrientation === 'w' && turnColor !== 'white') || 
         (playerOrientation === 'b' && turnColor !== 'black'))) {
      return;
    }
    
    // If we already have a piece selected
    if (moveFrom) {
      // Try to make a move
      const gameCopy = new Chess(game.fen());
      const move = {
        from: moveFrom,
        to: square,
        promotion: 'q' // Always promote to queen for simplicity
      };

      try {
        gameCopy.move(move);
        setGame(gameCopy);
        setMoveFrom('');
        setOptionSquares({});
        
        // Call onMove callback if provided
        if (onMove) {
          onMove(move, gameCopy.fen());
        }
        
        // In vs-ai mode, make the AI move after player moves
        if (playMode === 'vs-ai' && stockfishWorker.current) {
          setTimeout(() => {
            stockfishWorker.current.postMessage(`position fen ${gameCopy.fen()}`);
            stockfishWorker.current.postMessage('go movetime 1000');
            
            // Listen for the best move
            const originalOnMessage = stockfishWorker.current.onmessage;
            stockfishWorker.current.onmessage = (e) => {
              const message = e.data;
              if (message.startsWith('bestmove')) {
                const bestMove = message.split(' ')[1];
                if (bestMove) {
                  const from = bestMove.substring(0, 2);
                  const to = bestMove.substring(2, 4);
                  const promotion = bestMove.length > 4 ? bestMove.substring(4, 5) : undefined;
                  
                  const aiMove = { from, to, promotion };
                  const aiGameCopy = new Chess(gameCopy.fen());
                  aiGameCopy.move(aiMove);
                  setGame(aiGameCopy);
                  
                  if (onMove) {
                    onMove(aiMove, aiGameCopy.fen());
                  }
                  
                  // Restore original message handler
                  stockfishWorker.current.onmessage = originalOnMessage;
                }
              } else {
                // Pass other messages to the original handler
                originalOnMessage(e);
              }
            };
          }, 500);
        }
      } catch (error) {
        // Illegal move, reset selection
        resetFirstMove();
      }
    } else {
      // No piece was selected yet, try to select one
      const piece = game.get(square);
      if (piece && piece.color === game.turn()) {
        setMoveFrom(square);
        getMoveOptions(square);
      }
    }
  }

  // Right-click handler for square highlighting
  function onSquareRightClick(square) {
    const colour = "rgba(0, 0, 255, 0.4)";
    setRightClickedSquares({
      ...rightClickedSquares,
      [square]:
        rightClickedSquares[square] && rightClickedSquares[square].backgroundColor === colour
          ? undefined
          : { backgroundColor: colour }
    });
  }

  // Go to a specific move in the history
  const goToMove = useCallback((moveIndex) => {
    const gameCopy = new Chess();
    const moves = game.history({ verbose: true });
    
    for (let i = 0; i <= moveIndex && i < moves.length; i++) {
      gameCopy.move(moves[i]);
    }
    
    setGame(gameCopy);
    setCurrentMove(moveIndex);
  }, [game]);

  // Handle key navigation for moves
  const handleKeyDown = useCallback((e) => {
    if (!allowMoves) return;
    
    if (e.key === 'ArrowLeft') {
      const prevMove = Math.max(currentMove - 1, -1);
      goToMove(prevMove);
    } else if (e.key === 'ArrowRight') {
      const nextMove = Math.min(currentMove + 1, game.history().length - 1);
      goToMove(nextMove);
    }
  }, [allowMoves, currentMove, game, goToMove]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Flip board orientation
  function flipBoard() {
    setOrientation(orientation_ === 'white' ? 'black' : 'white');
  }

  // Reset the board to starting position
  function resetBoard() {
    setGame(new Chess());
    setMoveFrom('');
    setOptionSquares({});
    setRightClickedSquares({});
    setGameOver({
      isOver: false,
      result: '',
      reason: ''
    });
  }

  // Calculate square styles
  const squareStyles = {
    ...optionSquares,
    ...rightClickedSquares,
    ...customSquareStyles,
    ...(isChecked ? {
      [game.turn() === 'w' ? 
        game.board().flat().find(p => p && p.type === 'k' && p.color === 'w')?.square :
        game.board().flat().find(p => p && p.type === 'k' && p.color === 'b')?.square]: {
        backgroundColor: 'rgba(255, 0, 0, 0.5)'
      }
    } : {})
  };

  // Move history component
  const MoveHistory = () => {
    return (
      <div className="move-history">
        <h3>Move History</h3>
        <div className="moves-container">
          <table className="moves-table">
            <thead>
              <tr>
                <th>#</th>
                <th>White</th>
                <th>Black</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan="3" className="no-moves">No moves yet</td>
                </tr>
              ) : (
                history.map((move, index) => (
                  <tr key={index}>
                    <td>{move.moveNumber}</td>
                    <td 
                      className={`move ${currentMove === 2 * index ? 'current-move' : ''}`}
                      onClick={() => move.white && goToMove(2 * index)}
                    >
                      {move.white?.san || ''}
                    </td>
                    <td 
                      className={`move ${currentMove === 2 * index + 1 ? 'current-move' : ''}`}
                      onClick={() => move.black && goToMove(2 * index + 1)}
                    >
                      {move.black?.san || ''}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Engine analysis component
  const EngineAnalysis = () => {
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
      </div>
    );
  };

  // Render the chess board with controls
  return (
    <div className="chess-board-container">
      <div className="board-and-controls">
        <div className="chess-board" style={{ width }}>
          <Chessboard
            id="chess-board"
            position={fen}
            onSquareClick={onSquareClick}
            onSquareRightClick={onSquareRightClick}
            customSquareStyles={squareStyles}
            boardOrientation={orientation_}
            arePiecesDraggable={allowMoves}
            showBoardNotation={showNotation}
          />
        </div>
        
        <div className="board-controls">
          <button onClick={flipBoard} className="control-btn">
            Flip Board
          </button>
          <button onClick={resetBoard} className="control-btn">
            Reset Board
          </button>
          
          {gameOver.isOver && (
            <div className="game-result">
              <span>Game Over: {gameOver.result}</span>
              <span>Reason: {gameOver.reason}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="sidebar">
        {showHistory && <MoveHistory />}
        {showAnalysis && <EngineAnalysis />}
      </div>
    </div>
  );
};

export default ChessBoard;
