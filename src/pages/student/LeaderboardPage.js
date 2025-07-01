
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ApiService from '../../utils/api';
import { FaTrophy, FaChess, FaFilter } from 'react-icons/fa';

// Spinner for loading state
const LoadingSpinner = React.memo(() => (
  <div className="flex flex-col items-center justify-center p-8" role="status" aria-live="polite">
    <div className="animate-spin w-12 h-12 border-4 border-secondary border-t-transparent rounded-full mb-4" />
    <span className="text-gray-dark">Loading leaderboard data...</span>
  </div>
));

// Error state
const ErrorState = React.memo(({ message }) => (
  <div className="p-6 text-center text-red-700 bg-red-50 border border-red-200 rounded" role="alert">
    <span>{message}</span>
  </div>
));

// Quiz filter bar
const QuizFilterBar = React.memo(({ quizzes, activeQuiz, onQuizChange }) => (
  <nav className="p-4 flex flex-wrap gap-2" aria-label="Quiz selection">
    <button
      type="button"
      onClick={onQuizChange('overall')}
      className={`px-4 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent transition-colors
        ${activeQuiz === 'overall' ? 'bg-secondary text-white' : 'bg-gray-light text-primary hover:bg-gray-dark hover:text-white'}`}
      aria-pressed={activeQuiz === 'overall'}
      tabIndex={0}
    >
      Overall Ranking
    </button>
    {quizzes.map(quiz => (
      <button
        key={quiz.id}
        type="button"
        onClick={onQuizChange(quiz.id)}
        className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center focus:outline-none focus:ring-2 focus:ring-accent transition-colors
          ${activeQuiz === quiz.id ? 'bg-secondary text-white' : 'bg-gray-light text-primary hover:bg-gray-dark hover:text-white'}`}
        aria-pressed={activeQuiz === quiz.id}
        tabIndex={0}
      >
        <FaChess className="mr-1" aria-hidden="true" /> {quiz.title}
      </button>
    ))}
  </nav>
));

// Renders the leaderboard table
const LeaderboardTable = React.memo(({ data, activeQuiz, quizzes, formatTime }) => {
  // quizTitle was unused, so it is removed to fix the eslint warning
  return (
    <div className="overflow-x-auto">
      <table className="w-full" aria-label="Leaderboard">
        <thead>
          <tr className="bg-primary text-white text-sm uppercase">
            <th className="py-3 px-4 text-left">Rank</th>
            <th className="py-3 px-4 text-left">Student</th>
            {activeQuiz === 'overall' ? (
              <>
                <th className="py-3 px-4 text-left">Total Score</th>
                <th className="py-3 px-4 text-left">Quizzes Completed</th>
                <th className="py-3 px-4 text-left">Average Score</th>
              </>
            ) : (
              <>
                <th className="py-3 px-4 text-left">Score</th>
                <th className="py-3 px-4 text-left">Time</th>
                <th className="py-3 px-4 text-left">Date</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((entry, index) => (
            <tr key={index} className="border-b border-gray-dark hover:bg-gray-light focus-within:bg-gray-light">
              <td className="py-3 px-4">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  index === 0
                    ? 'bg-yellow-500 text-white'
                    : index === 1
                    ? 'bg-gray-400 text-white'
                    : index === 2
                    ? 'bg-amber-700 text-white'
                    : 'bg-gray-200 text-primary'
                }`} aria-label={`Rank ${index + 1}`}>{index + 1}</span>
              </td>
              <td className="py-3 px-4 font-medium">{entry.student_name}</td>
              {activeQuiz === 'overall' ? (
                <>
                  <td className="py-3 px-4 font-semibold text-secondary">{entry.total_score}</td>
                  <td className="py-3 px-4">{entry.quizzes_completed}</td>
                  <td className="py-3 px-4">{entry.average_score}%</td>
                </>
              ) : (
                <>
                  <td className="py-3 px-4 font-semibold text-secondary">{entry.score}</td>
                  <td className="py-3 px-4">{formatTime(entry.time_taken)}</td>
                  <td className="py-3 px-4">{new Date(entry.completed_at).toLocaleDateString()}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

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
        const quizzesResponse = await ApiService.get('/quiz/get-all.php');
        const quizzesList = quizzesResponse.quizzes || [];
        const overallResponse = await ApiService.get('/quiz/get-overall-leaderboard.php');
        const leaderboardsData = { overall: overallResponse.leaderboard };
        // Preload top 3 quiz leaderboards for snappy UX
        const topQuizzes = quizzesList.slice(0, 3);
        await Promise.all(topQuizzes.map(async (quiz) => {
          const quizLeaderboard = await ApiService.get(`/quiz/get-leaderboard.php?quiz_id=${quiz.id}`);
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
        ApiService.get(`/quiz/get-leaderboard.php?quiz_id=${quizId}`)
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
    <div className="min-h-screen bg-background-light px-4 sm:px-6 md:px-8 py-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-4 sm:mb-8 text-center">
          <h1 className="text-2xl sm:text-4xl font-bold text-primary mb-2 flex items-center justify-center">
            <FaTrophy className="text-yellow-500 mr-3" aria-hidden="true" /> Chess Quiz Leaderboards
          </h1>
          <p className="text-gray-dark">Compare your performance with other students</p>
        </header>
        <section className="bg-white rounded-lg shadow mb-4 sm:mb-6 overflow-hidden" aria-label="Quiz filter">
          <div className="p-4 border-b bg-gray-light flex items-center">
            <FaFilter className="text-secondary mr-2" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Select Quiz</h2>
          </div>
          <QuizFilterBar quizzes={quizzes} activeQuiz={activeQuiz} onQuizChange={handleQuizChange} />
        </section>
        <section className="bg-white rounded-lg shadow overflow-hidden" aria-label="Leaderboard table">
          <div className="p-4 sm:p-6 border-b">
            <h2 className="text-lg sm:text-xl font-bold text-primary">
              {activeQuiz === 'overall'
                ? 'Overall Student Ranking'
                : `Leaderboard: ${quizzes.find((q) => q.id === activeQuiz)?.title || ''}`}
            </h2>
          </div>
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <ErrorState message={error} />
          ) : leaderboardData.length === 0 ? (
            <div className="p-4 sm:p-6 text-center">
              <p className="text-gray-dark">No leaderboard data available yet.</p>
            </div>
          ) : (
            <LeaderboardTable data={leaderboardData} activeQuiz={activeQuiz} quizzes={quizzes} formatTime={formatTime} />
          )}
        </section>
      </div>
    </div>
  );
};

export default React.memo(LeaderboardPage);
