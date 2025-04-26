import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import MoveHistory from './MoveHistory';
import EngineAnalysis from './EngineAnalysis';
import ChessEngineFactory from '../../utils/ChessEngineFactory';

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
  gameOverState = null,
  useOnlineAPI = false, // New prop for using Stockfish online API
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
  const [isThinking, setIsThinking] = useState(false);
  const [engineLoadError, setEngineLoadError] = useState(false);
  
  const engineRef = useRef(null);
  const engineMoveTimeoutRef = useRef(null);
  
  const analyzeCurrentPosition = useCallback(async () => {
    if (!engineRef.current || isThinking) return;
    
    try {
      setIsThinking(true);
      const analysis = await engineRef.current.evaluatePosition(game.fen(), 15);
      setEngineEvaluation(analysis);
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setIsThinking(false);
    }
  }, [game, isThinking]);

  const makeFallbackMove = useCallback((legalMoves, gameFen) => {
    if (legalMoves.length > 0) {
      const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
      console.log('Used fallback random move:', randomMove);
      
      const fallbackGameCopy = new Chess(gameFen);
      fallbackGameCopy.move(randomMove);
      setGame(fallbackGameCopy);
      
      if (onMove) {
        onMove({
          from: randomMove.from,
          to: randomMove.to,
          promotion: randomMove.promotion
        }, fallbackGameCopy.fen());
      }
    }
  }, [onMove]);

  const makeEngineMove = useCallback(async () => {
    if (!engineRef.current || isThinking || gameOver.isOver) return;
    
    try {
      setIsThinking(true);
      
      engineMoveTimeoutRef.current = setTimeout(async () => {
        try {
          const currentFen = game.fen();
          const bestMove = await engineRef.current.getBestMove(currentFen, 1000);
          
          if (bestMove && bestMove.length >= 4) {
            const from = bestMove.substring(0, 2);
            const to = bestMove.substring(2, 4);
            const promotion = bestMove.length > 4 ? bestMove.substring(4, 5) : undefined;
            
            try {
              const aiGameCopy = new Chess(currentFen);
              const moveResult = aiGameCopy.move({ from, to, promotion });
              
              if (moveResult) {
                setGame(aiGameCopy);
                
                if (onMove) {
                  onMove({ from, to, promotion }, aiGameCopy.fen());
                }
              } else {
                console.warn('Invalid move received but not caught by chess.js:', bestMove);
                const legalMoves = game.moves({ verbose: true });
                makeFallbackMove(legalMoves, currentFen);
              }
            } catch (moveError) {
              console.error('Engine move error:', moveError, 'for move:', bestMove);
              const legalMoves = game.moves({ verbose: true });
              makeFallbackMove(legalMoves, currentFen);
            }
          } else {
            const legalMoves = game.moves({ verbose: true });
            makeFallbackMove(legalMoves, currentFen);
          }
        } catch (error) {
          console.error('Engine move processing error:', error);
          const legalMoves = game.moves({ verbose: true });
          const currentFen = game.fen();
          makeFallbackMove(legalMoves, currentFen);
        } finally {
          setIsThinking(false);
        }
      }, 500);
    } catch (error) {
      console.error('AI move error:', error);
      setIsThinking(false);
    }
  }, [game, isThinking, gameOver.isOver, onMove, makeFallbackMove]);

  useEffect(() => {
    if ((showAnalysis || playMode === 'vs-ai') && !engineRef.current) {
      try {
        engineRef.current = ChessEngineFactory.createEngine({
          useOnlineAPI,
          skillLevel: engineLevel
        });
      } catch (error) {
        console.error('Failed to initialize chess engine:', error);
        setEngineLoadError(true);
      }
    }

    return () => {
      if (engineRef.current) {
        engineRef.current.terminate();
        engineRef.current = null;
      }
      
      if (engineMoveTimeoutRef.current) {
        clearTimeout(engineMoveTimeoutRef.current);
      }
    };
  }, [engineLevel, playMode, showAnalysis, useOnlineAPI]);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setSkillLevel(engineLevel);
    }
  }, [engineLevel]);

  useEffect(() => {
    setFen(game.fen());
    setIsChecked(game.inCheck());
    const currentTurn = game.turn();
    
    if (game.isGameOver()) {
      const result = { isOver: true };
      
      if (game.isCheckmate()) {
        result.reason = 'checkmate';
        result.result = currentTurn === 'w' ? '0-1' : '1-0';
      } else if (game.isDraw()) {
        result.reason = game.isStalemate() ? 'stalemate' : 
                        game.isThreefoldRepetition() ? 'repetition' : 
                        game.isInsufficientMaterial() ? 'insufficient material' : 'fifty-move rule';
        result.result = '½-½';
      }
      
      setGameOver(result);
    } else {
      if (gameOver.isOver) {
        setGameOver({ isOver: false, result: '', reason: '' });
      }
    }

    if (showAnalysis && engineRef.current && !isThinking) {
      analyzeCurrentPosition();
    }
    
    if (playMode === 'vs-ai' && !gameOver.isOver && 
        ((orientation_.charAt(0) === 'w' && currentTurn === 'b') || 
         (orientation_.charAt(0) === 'b' && currentTurn === 'w'))) {
      makeEngineMove();
    }
  }, [game, showAnalysis, playMode, orientation_, gameOver.isOver, analyzeCurrentPosition, makeEngineMove, isThinking]);

  useEffect(() => {
    if (gameOverState && gameOverState.isOver) {
      setGameOver(gameOverState);
    }
  }, [gameOverState]);

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

  function onSquareClick(square) {
    if (!allowMoves || isThinking) return;
    
    const playerColor = orientation_.charAt(0).toLowerCase();
    const currentTurn = game.turn();
    
    if ((playMode === 'vs-ai' || playMode === 'vs-human') && playerColor !== currentTurn) {
      return;
    }
    
    if (moveFrom) {
      const gameCopy = new Chess(game.fen());
      const move = {
        from: moveFrom,
        to: square,
        promotion: 'q'
      };

      try {
        gameCopy.move(move);
        setGame(gameCopy);
        setMoveFrom('');
        setOptionSquares({});
        
        if (onMove) {
          onMove(move, gameCopy.fen());
        }
      } catch (error) {
        resetFirstMove();
      }
    } else {
      const piece = game.get(square);
      if (piece && piece.color === game.turn()) {
        setMoveFrom(square);
        getMoveOptions(square);
      }
    }
  }

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

  const goToMove = useCallback((moveIndex) => {
    const gameCopy = new Chess();
    const moves = game.history({ verbose: true });
    
    for (let i = 0; i <= moveIndex && i < moves.length; i++) {
      gameCopy.move(moves[i]);
    }
    
    setGame(gameCopy);
    setCurrentMove(moveIndex);
  }, [game]);

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

  function flipBoard() {
    setOrientation(orientation_ === 'white' ? 'black' : 'white');
  }

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

  return (
    <div className="flex flex-row md:flex-col gap-5 mb-5 max-w-full">
      {engineLoadError && (
        <div className="bg-[#ffebee] border-l-4 border-[#af0505] text-[#af0505] px-4 py-3 mb-4 rounded flex flex-col gap-2">
          <p className="m-0">Using lightweight chess engine. Some advanced analysis features may be limited.</p>
          <div className="flex gap-2">
            <button 
              className="bg-[#3b3a52] text-white border-none py-1.5 px-3 rounded cursor-pointer text-sm hover:bg-[#200e4a]"
              onClick={() => window.open('/stockfish/test.html', '_blank')}
            >
              Run Engine Test
            </button>
          </div>
        </div>
      )}
      
      {useOnlineAPI && (
        <div className="py-1 px-2.5 bg-[#e6f2ff] border-l-3 border-[#0066cc] mb-2.5 text-sm">
          <p className="m-0 text-[#0052a5]">Using Stockfish Online API for analysis</p>
        </div>
      )}
      
      <div className="flex flex-col gap-2.5">
        <div className="relative shadow-md rounded overflow-hidden" style={{ width }}>
          <Chessboard
            id="chess-board"
            position={fen}
            onSquareClick={onSquareClick}
            onSquareRightClick={onSquareRightClick}
            customSquareStyles={squareStyles}
            boardOrientation={orientation_}
            arePiecesDraggable={allowMoves && !isThinking}
            showBoardNotation={showNotation}
          />
          {isThinking && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-70 text-white py-2.5 px-4 rounded flex items-center z-10">
              <div className="w-5 h-5 border-3 border-white border-opacity-30 rounded-full border-t-white animate-spin mr-2.5"></div>
              <span>Thinking...</span>
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2.5 mt-2.5">
          <button 
            onClick={flipBoard} 
            className="py-2 px-3 bg-[#461fa3] text-white border-none rounded cursor-pointer font-medium text-sm transition-colors hover:bg-[#7646eb]"
          >
            Flip Board
          </button>
          <button 
            onClick={resetBoard} 
            className={`py-2 px-3 text-white border-none rounded cursor-pointer font-medium text-sm transition-colors ${
              isThinking 
                ? 'bg-[#c2c1d3] cursor-not-allowed' 
                : 'bg-[#461fa3] hover:bg-[#7646eb]'
            }`}
            disabled={isThinking}
          >
            Reset Board
          </button>
          
          {gameOver.isOver && (
            <div className="flex flex-col bg-[#f3f1f9] border-l-4 border-[#7646eb] py-2 px-3 mt-2.5 rounded">
              <span className="text-[#200e4a] font-medium">Game Over: {gameOver.result}</span>
              <span className="text-[#200e4a] font-medium">Reason: {gameOver.reason}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex-1 flex flex-col gap-5 min-w-[250px] max-w-[300px] md:max-w-full">
        {showHistory && <MoveHistory history={history} currentMove={currentMove} goToMove={goToMove} />}
        {showAnalysis && <EngineAnalysis engineEvaluation={engineEvaluation} />}
      </div>
    </div>
  );
};

export default ChessBoard;
