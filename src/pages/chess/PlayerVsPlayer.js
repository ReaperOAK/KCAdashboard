
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ChallengeList from '../../components/chess/ChallengeList';
import PlayerList from '../../components/chess/PlayerList';
import ChessNavigation from '../../components/chess/ChessNavigation';
import ChessBoard from '../../components/chess/ChessBoard';
import { ChessApi } from '../../api/chess';
import { useAuth } from '../../hooks/useAuth';
import AcceptedGamesModal from '../../components/chess/AcceptedGamesModal';
import TabButton from '../../components/chess/TabButton';
import LoadingState from '../../components/chess/LoadingState';
import ErrorState from '../../components/chess/ErrorState';
import ComputerSettings from '../../components/chess/ComputerSettings';
import StatsPanel from '../../components/chess/StatsPanel';

export const PlayerVsPlayer = React.memo(function PlayerVsPlayer() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('players');
  const [onlinePlayers, setOnlinePlayers] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [playerStats, setPlayerStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [engineLevel, setEngineLevel] = useState(10);
  const [engineColor, setEngineColor] = useState('black');
  const [useOnlineAPI, setUseOnlineAPI] = useState(false);
  const [acceptedGames, setAcceptedGames] = useState([]);
  const [showAcceptedGamesModal, setShowAcceptedGamesModal] = useState(false);
  const lastAcceptedGameIds = useRef(new Set());

  // Fetch online players
  const fetchOnlinePlayers = useCallback(async () => {
    try {
      const response = await ChessApi.getOnlinePlayers();
      if (response.success) setOnlinePlayers(response.players);
    } catch (error) {
      setError('Failed to load online players. Please try again later.');
    }
  }, []);

  // Fetch player stats
  const fetchPlayerStats = useCallback(async () => {
    try {
      const response = await ChessApi.getPlayerStats();
      if (response.success) setPlayerStats(response.stats);
    } catch (error) {
      // Silent fail, stats are not critical
    }
  }, []);

  // Fetch challenges and show accepted games modal if needed
  const fetchChallenges = useCallback(async () => {
    try {
      const challengesResponse = await ChessApi.getChallenges();
      if (challengesResponse && challengesResponse.success) {
        setChallenges(challengesResponse.challenges || []);
        const accepted = (challengesResponse.challenges || []).filter(
          c => c.direction === 'outgoing' && c.status === 'accepted' && c.gameId
        );
        const newAccepted = accepted.filter(g => !lastAcceptedGameIds.current.has(g.gameId));
        if (newAccepted.length > 0) {
          setAcceptedGames(newAccepted);
          setShowAcceptedGamesModal(true);
          newAccepted.forEach(g => lastAcceptedGameIds.current.add(g.gameId));
        }
      } else if (playerStats && playerStats.challenges) {
        setChallenges(playerStats.challenges);
      }
    } catch (error) {
      // Silent fail
    } finally {
      setIsLoading(false);
    }
  }, [playerStats]);

  // Resign accepted game
  const handleResignAcceptedGame = useCallback(async (gameId) => {
    try {
      const response = await ChessApi.resignGame(gameId);
      if (response.success) {
        setAcceptedGames(games => games.filter(g => g.gameId !== gameId));
        fetchChallenges();
      } else {
        alert(response.message || 'Failed to resign game.');
      }
    } catch (e) {
      alert('Failed to resign game.');
    }
  }, [fetchChallenges]);

  // Join accepted game
  const handleJoinAcceptedGame = useCallback((gameId) => {
    setShowAcceptedGamesModal(false);
    navigate(`/chess/game/${gameId}`);
  }, [navigate]);

  // Challenge a player
  const handleChallengePlayer = useCallback(async (playerId, color, timeControl) => {
    try {
      const response = await ChessApi.challengePlayer(playerId, { color, timeControl });
      if (response.success) {
        alert(`Challenge sent! You'll be redirected to the game board when your opponent accepts.`);
        setActiveTab('challenges');
        await Promise.all([
          fetchOnlinePlayers(),
          fetchPlayerStats(),
          fetchChallenges()
        ]);
      }
    } catch (error) {
      // Silent fail
    }
  }, [fetchOnlinePlayers, fetchPlayerStats, fetchChallenges]);

  // Accept a challenge
  const handleAcceptChallenge = useCallback((gameId) => {
    navigate(`/chess/game/${gameId}`);
  }, [navigate]);

  // Refresh all data
  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchOnlinePlayers(),
        fetchPlayerStats()
      ]);
    } catch (error) {
      // Silent fail
    } finally {
      setIsLoading(false);
    }
  }, [fetchOnlinePlayers, fetchPlayerStats]);

  // Initial load and polling
  useEffect(() => {
    setIsLoading(true);
    const loadData = async () => {
      try {
        await Promise.all([
          fetchOnlinePlayers(),
          fetchPlayerStats()
        ]);
      } catch (error) {
        setError('Failed to load data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
    const interval = setInterval(fetchOnlinePlayers, 30000);
    return () => clearInterval(interval);
  }, [fetchOnlinePlayers, fetchPlayerStats]);

  // Update challenges when player stats change
  useEffect(() => {
    fetchChallenges();
  }, [playerStats, fetchChallenges]);

  // Memoize tab badge
  const challengesBadge = useMemo(() => (
    challenges.length > 0 ? (
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-error text-white text-xs ml-2">
        {challenges.length}
      </span>
    ) : null
  ), [challenges.length]);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={handleRefresh} />;

  return (
    <div className="max-w-6xl mx-auto px-5 pb-10">
      {showAcceptedGamesModal && acceptedGames.length > 0 && (
        <AcceptedGamesModal
          games={acceptedGames}
          onJoin={handleJoinAcceptedGame}
          onResign={handleResignAcceptedGame}
          onClose={() => setShowAcceptedGamesModal(false)}
        />
      )}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <h1 className="text-3xl text-primary font-bold m-0">Play Chess</h1>
        <div className="bg-accent text-white px-4 py-2 rounded-full font-bold text-base w-full sm:w-auto text-center transition-all duration-200 shadow-md">
          Your Rating: {playerStats ? playerStats.rating : 1200}
        </div>
      </div>
      <ChessNavigation />
      <div className="flex overflow-x-auto border-b border-gray-light mb-6 no-scrollbar" role="tablist" aria-label="Chess Tabs">
        <div className="flex min-w-full sm:min-w-0">
          <TabButton isActive={activeTab === 'players'} onClick={() => setActiveTab('players')} ariaLabel="Online Players Tab">
            Online Players
          </TabButton>
          <TabButton isActive={activeTab === 'challenges'} onClick={() => setActiveTab('challenges')} ariaLabel="Challenges Tab" badge={challengesBadge}>
            Challenges
          </TabButton>
          <TabButton isActive={activeTab === 'computer'} onClick={() => setActiveTab('computer')} ariaLabel="Play Computer Tab">
            Play Computer
          </TabButton>
          <TabButton isActive={activeTab === 'stats'} onClick={() => setActiveTab('stats')} ariaLabel="My Stats Tab">
            My Stats
          </TabButton>
        </div>
      </div>
      <div className="min-h-96">
        {activeTab === 'players' && (
          <PlayerList
            players={onlinePlayers}
            currentUser={user}
            onChallenge={handleChallengePlayer}
            onRefresh={handleRefresh}
          />
        )}
        {activeTab === 'challenges' && (
          <ChallengeList
            challenges={challenges}
            onAccept={handleAcceptChallenge}
            onRefresh={handleRefresh}
          />
        )}
        {activeTab === 'computer' && (
          <div className="flex flex-col lg:flex-row gap-8 items-center justify-center">
            <div className="w-full max-w-full sm:max-w-[520px] md:max-w-[600px] lg:max-w-[640px] mx-auto lg:mx-0 flex-shrink-0 order-2 lg:order-1">
              <ChessBoard
                position="start"
                orientation={engineColor === 'black' ? 'white' : 'black'}
                allowMoves={true}
                showHistory={true}
                showAnalysis={false}
                engineLevel={engineLevel}
                playMode="vs-ai"
                width={520}
                useOnlineAPI={useOnlineAPI}
                className="w-full h-auto max-w-full shadow-lg rounded-lg border border-gray-light transition-all duration-200"
              />
            </div>
            <ComputerSettings
              engineLevel={engineLevel}
              setEngineLevel={setEngineLevel}
              engineColor={engineColor}
              setEngineColor={setEngineColor}
              useOnlineAPI={useOnlineAPI}
              setUseOnlineAPI={setUseOnlineAPI}
            />
          </div>
        )}
        {activeTab === 'stats' && (
          <StatsPanel playerStats={playerStats} />
        )}
      </div>
    </div>
  );
});

export default PlayerVsPlayer;
