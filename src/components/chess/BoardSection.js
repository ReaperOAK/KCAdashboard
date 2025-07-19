import React from 'react';
import ChessBoard from './ChessBoard';
import PGNDownloadButton from './PGNDownloadButton';


const BoardSection = React.memo(function BoardSection({
  id,
  pgn,
  position,
  orientation,
  allowMoves,
  showHistory,
  showAnalysis,
  onMove,
  playMode,
  width,
  gameId,
  backendMoveHistory,
  fenHistory,
  currentMoveIndex,
  goToMove
}) {
  // Only handles board and PGN download, single responsibility
  return (
    <section
      className="w-full max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-7xl mx-auto flex flex-col items-center justify-center mb-8 px-2 sm:px-0"
      aria-label="Chess Board Section"
    >
      <div className="w-full bg-background-light dark:bg-background-dark rounded-xl shadow-md border border-gray-light p-4 flex flex-col gap-4">
        {id && pgn && (
          <div className="flex justify-end mb-2">
            <PGNDownloadButton id={id} pgn={pgn} />
          </div>
        )}
        <div className="flex justify-center items-center w-full">
          <ChessBoard
            position={position}
            orientation={orientation}
            allowMoves={allowMoves}
            showHistory={showHistory}
            showAnalysis={showAnalysis}
            onMove={onMove}
            playMode={playMode}
            width={width}
            gameId={gameId}
            backendMoveHistory={backendMoveHistory}
            fenHistory={fenHistory}
            currentMoveIndex={currentMoveIndex}
            goToMove={goToMove}
            className="w-full h-auto max-w-full aspect-square"
          />
        </div>
      </div>
    </section>
  );
});

export default BoardSection;
