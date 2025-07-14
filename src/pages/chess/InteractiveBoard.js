
import React from 'react';
import { useParams } from 'react-router-dom';
import LoadingSpinner from '../../components/chess/LoadingSpinner';
import ErrorState from '../../components/chess/ErrorState';
import HeaderBar from '../../components/chess/HeaderBar';
import BoardSection from '../../components/chess/BoardSection';
import GameInfoCard from '../../components/chess/GameInfoCard';
import MoveTimer from '../../components/chess/MoveTimer';
import GameStatus from '../../components/chess/GameStatus';
import { useChessGame } from '../../hooks/useChessGame';



const InteractiveBoard = React.memo(() => {
  const { id } = useParams();
  const {
    position,
    loading,
    error,
    gameData,
    orientation,
    lastMoveAt,
    activeGames,
    pgn,
    moveHistory,
    fenHistory,
    currentMoveIndex,
    timeLeft,
    handleMove,
    handleGoToMove,
    formatIST,
  } = useChessGame(id);

  const canShowGameSwitcher = activeGames.length > 1 && id;

  if (error === 'redirected-to-lobby') return null;
  if (loading) return <LoadingSpinner label="Loading chess board..." />;
  if (error) return <ErrorState message={error} onReload={() => window.location.reload()} />;

  return (
    <main className="max-w-6xl mx-auto px-3 sm:px-5 pb-8 sm:pb-10" role="main">
      <HeaderBar title={id ? 'Game Board' : 'Analysis Board'} />
      {canShowGameSwitcher && (
        <div className="mb-4">
          {/* GameSwitcher is still used here for now */}
          {/* You can further modularize this if needed */}
        </div>
      )}
      <BoardSection
        id={id}
        pgn={pgn}
        activeGames={activeGames}
        currentId={id}
        onSwitch={null}
        position={position}
        orientation={orientation}
        allowMoves={id ? (gameData && gameData.yourTurn && gameData.status === 'active') : true}
        showHistory={true}
        showAnalysis={!id}
        onMove={handleMove}
        playMode={id ? 'vs-human' : 'analysis'}
        width={undefined}
        gameId={id}
        backendMoveHistory={moveHistory}
        fenHistory={fenHistory}
        currentMoveIndex={currentMoveIndex}
        goToMove={handleGoToMove}
      />
      {id && gameData && gameData.status === 'active' && gameData.yourTurn && (
        <section className="flex justify-center mb-4 ">
          <MoveTimer timeLeft={timeLeft} formatTimer={secs => {
            const m = Math.floor(secs / 60);
            const s = secs % 60;
            return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
          }} />
        </section>
      )}
      {gameData && (
        <GameInfoCard gameData={gameData} lastMoveAt={lastMoveAt} formatIST={formatIST} />
      )}
      {id && (
        <GameStatus yourTurn={gameData && gameData.yourTurn} timeLeft={timeLeft} formatTimer={secs => {
          const m = Math.floor(secs / 60);
          const s = secs % 60;
          return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }} />
      )}
    </main>
  );
});

export default InteractiveBoard;
