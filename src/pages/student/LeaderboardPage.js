

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { QuizApi } from '../../api/quiz';
import { FaTrophy, FaFilter } from 'react-icons/fa';
import LoadingSpinner from '../../components/leaderboard/LoadingSpinner';
import ErrorState from '../../components/leaderboard/ErrorState';
import QuizFilterBar from '../../components/leaderboard/QuizFilterBar';
import LeaderboardTable from '../../components/leaderboard/LeaderboardTable';

// Main Leaderboard Page
const LeaderboardPage = () => {
  const [leaderboards, setLeaderboards] = useState({});
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeQuiz, setActiveQuiz] = useState('overall');
  const [error, setError] = useState(null);

  // Memoized time formatter
  const formatTime = useCallback((seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  }, []);

  // Fetch quizzes and initial leaderboards
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const quizzesResponse = await QuizApi.getAll();
        const quizzesList = quizzesResponse.quizzes || [];
        const overallResponse = await QuizApi.getOverallLeaderboard ? await QuizApi.getOverallLeaderboard() : { leaderboard: [] };
        const leaderboardsData = { overall: overallResponse.leaderboard };
        // Preload top 3 quiz leaderboards for snappy UX
        const topQuizzes = quizzesList.slice(0, 3);
        await Promise.all(topQuizzes.map(async (quiz) => {
          const quizLeaderboard = QuizApi.getQuizLeaderboard ? await QuizApi.getQuizLeaderboard(quiz.id) : { leaderboard: [] };
          leaderboardsData[quiz.id] = quizLeaderboard.leaderboard;
        }));
        if (isMounted) {
          setQuizzes(quizzesList);
          setLeaderboards(leaderboardsData);
          setLoading(false);
        }
      } catch (e) {
        if (isMounted) {
          setError('Failed to load leaderboard data');
          setLoading(false);
        }
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, []);

  // Memoized handler for quiz change
  const handleQuizChange = useCallback(
    (quizId) => () => {
      setActiveQuiz(quizId);
      if (!leaderboards[quizId]) {
        setLoading(true);
        (QuizApi.getQuizLeaderboard ? QuizApi.getQuizLeaderboard(quizId) : Promise.resolve({ leaderboard: [] }))
          .then((response) => {
            setLeaderboards((prev) => ({ ...prev, [quizId]: response.leaderboard }));
            setLoading(false);
          })
          .catch(() => {
            setError('Failed to load leaderboard data');
            setLoading(false);
          });
      }
    },
    [leaderboards]
  );

  // Memoized leaderboard data for current quiz
  const leaderboardData = useMemo(() => leaderboards[activeQuiz] || [], [leaderboards, activeQuiz]);

  return (
    <div className="min-h-screen bg-background-light px-2 sm:px-4 md:px-8 py-6 flex flex-col">
      <div className="w-full max-w-5xl mx-auto flex-1 flex flex-col gap-8">
        {/* Header */}
        <header className="mb-2 sm:mb-6 text-center flex flex-col items-center gap-2">
          <h1 className="text-2xl sm:text-4xl font-bold text-primary flex items-center justify-center gap-2 tracking-tight leading-tight">
            <FaTrophy className="text-yellow-500 drop-shadow-lg" aria-hidden="true" />
            <span>Chess Quiz Leaderboards</span>
          </h1>
          <p className="text-gray-dark text-base sm:text-lg">Compare your performance with other students</p>
        </header>

        {/* Quiz Filter Bar */}
        <section className="bg-white/95 rounded-2xl shadow-lg mb-2 sm:mb-4 overflow-hidden border border-gray-light" aria-label="Quiz filter">
          <div className="p-4 border-b bg-gray-light flex items-center gap-2">
            <FaFilter className="text-secondary mr-2 text-lg sm:text-xl" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-primary">Select Quiz</h2>
          </div>
          <QuizFilterBar quizzes={quizzes} activeQuiz={activeQuiz} onQuizChange={handleQuizChange} />
        </section>

        {/* Leaderboard Table */}
        <section className="bg-white/95 rounded-2xl shadow-lg overflow-hidden border border-gray-light flex-1 flex flex-col" aria-label="Leaderboard table">
          <div className="p-4 sm:p-6 border-b flex items-center justify-between bg-background-light">
            <h2 className="text-lg sm:text-xl font-bold text-primary">
              {activeQuiz === 'overall'
                ? 'Overall Student Ranking'
                : `Leaderboard: ${quizzes.find((q) => q.id === activeQuiz)?.title || ''}`}
            </h2>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <ErrorState message={error} />
            ) : leaderboardData.length === 0 ? (
              <div className="p-8 flex flex-col items-center justify-center gap-4">
                <svg width="64" height="64" fill="none" viewBox="0 0 24 24" className="text-gray-light mb-2"><path d="M12 2v20M2 12h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <p className="text-gray-dark text-lg">No leaderboard data available yet.</p>
              </div>
            ) : (
              <LeaderboardTable data={leaderboardData} activeQuiz={activeQuiz} quizzes={quizzes} formatTime={formatTime} />
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default React.memo(LeaderboardPage);
