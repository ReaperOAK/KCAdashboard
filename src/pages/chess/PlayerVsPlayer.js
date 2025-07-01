
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ChallengeList from '../../components/chess/ChallengeList';
import PlayerList from '../../components/chess/PlayerList';
import ChessNavigation from '../../components/chess/ChessNavigation';
import ChessBoard from '../../components/chess/ChessBoard';
import ApiService from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';
import AcceptedGamesModal from '../../components/chess/AcceptedGamesModal';

// Tab Button (memoized)
const TabButton = React.memo(function TabButton({ isActive, onClick, children, badge, ariaLabel }) {
  return (
    <button
      type="button"
      className={`px-6 py-3 bg-transparent border-none cursor-pointer text-base transition-all duration-200 relative focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
        isActive
          ? 'text-primary font-bold after:content-[""] after:absolute after:-bottom-px after:left-0 after:w-full after:h-0.5 after:bg-primary'
          : 'text-gray-dark hover:bg-background-light'
      }`}
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      aria-label={ariaLabel}
    >
      {children}
      {badge}
    </button>
  );
});

// Loading and Error States
const LoadingState = () => (
  <div className="max-w-6xl mx-auto px-5 pb-10">
    <div className="flex justify-center items-center h-96 text-primary font-bold">Loading...</div>
  </div>
);
const ErrorState = ({ error, onRetry }) => (
  <div className="max-w-6xl mx-auto px-5 pb-10">
    <div className="flex justify-center items-center h-48 text-red-600 font-bold text-center mb-6">{error}</div>
    <button onClick={onRetry} className="block mx-auto px-4 py-2 bg-primary text-white rounded hover:bg-secondary transition-colors">
      Retry
    </button>
  </div>
);

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
      const response = await ApiService.getOnlinePlayers();
      if (response.success) setOnlinePlayers(response.players);
    } catch (error) {
      setError('Failed to load online players. Please try again later.');
    }
  }, []);

  // Fetch player stats
  const fetchPlayerStats = useCallback(async () => {
    try {
      const response = await ApiService.getPlayerStats();
      if (response.success) setPlayerStats(response.stats);
    } catch (error) {
      // Silent fail, stats are not critical
    }
  }, []);

  // Fetch challenges and show accepted games modal if needed
  const fetchChallenges = useCallback(async () => {
    try {
      const challengesResponse = await ApiService.getChallenges();
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
      const response = await ApiService.resignGame(gameId);
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
      const response = await ApiService.challengePlayer(playerId, { color, timeControl });
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
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-600 text-white text-xs ml-2">
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
        <h1 className="text-2xl sm:text-3xl font-bold text-primary m-0">Play Chess</h1>
        <div className="bg-accent text-white px-4 py-2 rounded-full font-bold text-base w-full sm:w-auto text-center">
          Your Rating: {playerStats ? playerStats.rating : 1200}
        </div>
      </div>
      <ChessNavigation />
      <div className="flex overflow-x-auto border-b border-gray-dark mb-6 no-scrollbar" role="tablist" aria-label="Chess Tabs">
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
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:flex-1 space-y-6">
              <div className="bg-background-light p-4 sm:p-6 rounded-lg">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-primary mb-2">Engine Level</label>
                  <div className="flex flex-col xs:flex-row items-start xs:items-center gap-3">
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={engineLevel}
                      onChange={e => setEngineLevel(parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-light rounded-lg appearance-none cursor-pointer slider:bg-accent min-w-0"
                      aria-label="Engine Level"
                    />
                    <span className="min-w-[24px] text-center font-bold text-primary">{engineLevel}</span>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-primary mb-2">Play as</label>
                  <div className="flex flex-col xs:flex-row gap-3 xs:gap-5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="color"
                        value="white"
                        checked={engineColor === 'black'}
                        onChange={() => setEngineColor('black')}
                        className="w-4 h-4 text-accent bg-gray-light border-gray-light focus:ring-accent"
                        aria-label="Play as White"
                      />
                      <span className="text-gray-dark">White</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="color"
                        value="black"
                        checked={engineColor === 'white'}
                        onChange={() => setEngineColor('white')}
                        className="w-4 h-4 text-accent bg-gray-light border-gray-light focus:ring-accent"
                        aria-label="Play as Black"
                      />
                      <span className="text-gray-dark">Black</span>
                    </label>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useOnlineAPI}
                      onChange={e => setUseOnlineAPI(e.target.checked)}
                      className="w-4 h-4 text-accent bg-gray-light border-gray-light rounded focus:ring-accent"
                      aria-label="Use Online API"
                    />
                    <span className="text-gray-dark">Use Online API (more powerful analysis)</span>
                  </label>
                  <p className="text-sm text-gray-dark mt-1">
                    The online API provides stronger analysis but requires an internet connection.
                  </p>
                </div>
              </div>
            </div>
            <div className="w-full max-w-full sm:max-w-[420px] mx-auto lg:mx-0 flex-shrink-0">
              <ChessBoard
                position="start"
                orientation={engineColor === 'black' ? 'white' : 'black'}
                allowMoves={true}
                showHistory={true}
                showAnalysis={false}
                engineLevel={engineLevel}
                playMode="vs-ai"
                width={undefined}
                useOnlineAPI={useOnlineAPI}
                className="w-full h-auto max-w-full"
              />
            </div>
          </div>
        )}
        {activeTab === 'stats' && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-primary text-center mb-6">Your Chess Statistics</h2>
            {!playerStats ? (
              <div className="text-center py-8">
                <div className="text-primary font-bold text-lg mb-4">Loading your stats...</div>
                <p className="text-gray-dark">If this is your first time, your stats will appear after playing your first game.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                  <div className="bg-background-light rounded-lg p-4 text-center shadow-sm">
                    <div className="text-3xl font-bold text-primary mb-2">{playerStats.rating || 1200}</div>
                    <div className="text-gray-dark">Rating</div>
                  </div>
                  <div className="bg-background-light rounded-lg p-4 text-center shadow-sm">
                    <div className="text-3xl font-bold text-primary mb-2">{playerStats.games_played || 0}</div>
                    <div className="text-gray-dark">Games Played</div>
                  </div>
                  <div className="bg-background-light rounded-lg p-4 text-center shadow-sm">
                    <div className="text-3xl font-bold text-primary mb-2">{playerStats.win_rate || 0}%</div>
                    <div className="text-gray-dark">Win Rate</div>
                  </div>
                  <div className="bg-background-light rounded-lg p-4 text-center shadow-sm">
                    <div className="text-3xl font-bold text-primary mb-2">{playerStats.rank || 'N/A'}</div>
                    <div className="text-gray-dark">Rank</div>
                  </div>
                </div>
                <div className="flex flex-col xs:flex-row justify-between bg-gray-light rounded-lg p-4 mb-8 shadow-sm gap-4 xs:gap-0">
                  <div className="flex flex-col items-center flex-1">
                    <div className="text-2xl font-bold text-green-600 mb-1">{playerStats.games_won || 0}</div>
                    <div className="text-gray-dark">Wins</div>
                  </div>
                  <div className="flex flex-col items-center flex-1">
                    <div className="text-2xl font-bold text-yellow-600 mb-1">{playerStats.games_drawn || 0}</div>
                    <div className="text-gray-dark">Draws</div>
                  </div>
                  <div className="flex flex-col items-center flex-1">
                    <div className="text-2xl font-bold text-red-600 mb-1">{playerStats.games_lost || 0}</div>
                    <div className="text-gray-dark">Losses</div>
                  </div>
                </div>
                {playerStats.recent_games && playerStats.recent_games.length > 0 ? (
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h3 className="text-xl font-semibold text-primary mb-4 border-b border-gray-dark pb-2">Recent Games</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b-2 border-gray-dark">
                            <th className="text-left p-3 text-primary">Opponent</th>
                            <th className="text-left p-3 text-primary">Result</th>
                            <th className="text-left p-3 text-primary">Color</th>
                            <th className="text-left p-3 text-primary">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {playerStats.recent_games.map((game, index) => (
                            <tr key={index} className="border-b border-gray-light">
                              <td className="p-3">{game.opponent_name}</td>
                              <td className={`p-3 font-bold ${
                                game.result === 'win' ? 'text-green-600' :
                                game.result === 'loss' ? 'text-red-600' :
                                game.result === 'draw' ? 'text-yellow-600' : 'text-blue-600'
                              }`}>
                                {game.result === 'win' ? 'Won' :
                                 game.result === 'loss' ? 'Lost' :
                                 game.result === 'draw' ? 'Draw' : 'Active'}
                              </td>
                              <td className="p-3 capitalize">{game.player_color}</td>
                              <td className="p-3">
                                {new Date(game.last_move_at).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg p-8 shadow-sm text-center">
                    <p className="text-gray-dark mb-4">No recent games found.</p>
                    <p className="text-sm text-gray-dark">Start playing to see your game history!</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

export default PlayerVsPlayer;
