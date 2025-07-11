import React from 'react';
import ChessBoard from './ChessBoard';
import PGNDownloadButton from './PGNDownloadButton';

const BoardSection = React.memo(function BoardSection({
  id,
  pgn,
  activeGames,
  currentId,
  onSwitch,
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
  return (
    <section className="w-full max-w-full sm:max-w-2xl mx-auto flex justify-center mb-6 animate-fade-in">
      <div className="w-full">
        {id && pgn && <PGNDownloadButton id={id} pgn={pgn} />}
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
          className="w-full h-auto"
        />
      </div>
    </section>
  );
});

export default BoardSection;
