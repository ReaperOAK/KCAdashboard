
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import ApiService from '../../utils/api';
import { FaTrophy, FaChartLine, FaClock, FaRedo, FaList } from 'react-icons/fa';

// --- Loading Spinner ---
const LoadingSpinner = React.memo(() => (
  <div className="min-h-screen bg-background-light p-8 flex items-center justify-center">
    <p className="text-xl text-gray-dark">Loading results...</p>
  </div>
));

// --- Result Card ---
const ResultCard = React.memo(function ResultCard({ quizTitle, percentageScore, isPassing, resultData, timeTaken, onTryAgain, onViewHistory, onBackToQuizzes }) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
      <div className={`p-6 text-center ${isPassing ? 'bg-green-50' : 'bg-red-50'}`}> 
        <h1 className="text-3xl font-bold text-primary mb-2">{quizTitle}</h1>
        <p className="text-xl font-semibold mb-4">
          {isPassing ? 'Congratulations!' : 'Keep practicing!'}
        </p>
        <div className="flex justify-center">
          <div className="w-32 h-32 rounded-full border-8 border-secondary flex items-center justify-center bg-white">
            <span className="text-4xl font-bold text-secondary">{percentageScore}%</span>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <ResultStat icon={FaTrophy} label="Score" value={`${resultData.score} / ${resultData.total_questions}`} />
          <ResultStat icon={FaClock} label="Time Taken" value={formatTime(timeTaken)} />
          <ResultStat icon={FaChartLine} label="Percentile" value={resultData.percentile || '-'} />
        </div>
        {resultData.feedback && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-1">Feedback</h3>
            <p className="text-blue-700">{resultData.feedback}</p>
          </div>
        )}
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            type="button"
            onClick={onTryAgain}
            className="px-4 py-2 rounded-lg bg-secondary text-white hover:bg-accent flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Try quiz again"
          >
            <FaRedo className="mr-2" aria-hidden="true" /> Try Again
          </button>
          <button
            type="button"
            onClick={onViewHistory}
            className="px-4 py-2 rounded-lg border border-secondary text-secondary hover:bg-background-light flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="View quiz history"
          >
            <FaList className="mr-2" aria-hidden="true" /> View History
          </button>
          <button
            type="button"
            onClick={onBackToQuizzes}
            className="px-4 py-2 rounded-lg border border-secondary text-secondary hover:bg-background-light focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Back to quizzes"
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    </div>
  );
});

// --- Result Stat ---
const ResultStat = React.memo(function ResultStat({ icon: Icon, label, value }) {
  return (
    <div className="bg-gray-light/40 p-4 rounded-lg text-center">
      <Icon className="mx-auto text-accent text-xl mb-2" aria-hidden="true" />
      <p className="text-sm text-gray-dark">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
});

// --- Leaderboard Table ---
const LeaderboardTable = React.memo(function LeaderboardTable({ leaderboard, resultData }) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-light">
        <h2 className="text-xl font-bold text-primary">Quiz Leaderboard</h2>
      </div>
      <div className="p-6">
        {leaderboard.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-light">
                  <th className="py-2 px-4 text-left">Rank</th>
                  <th className="py-2 px-4 text-left">Student</th>
                  <th className="py-2 px-4 text-left">Score</th>
                  <th className="py-2 px-4 text-left">Time</th>
                  <th className="py-2 px-4 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, index) => (
                  <tr
                    key={index}
                    className={`border-b border-gray-light ${resultData.user_id === entry.user_id ? 'bg-background-light' : ''}`}
                  >
                    <td className="py-2 px-4">
                      {index === 0 ? (
                        <span className="flex items-center"><FaTrophy className="text-yellow-500 mr-1" aria-hidden="true" /> 1</span>
                      ) : index === 1 ? (
                        <span className="flex items-center"><FaTrophy className="text-gray-400 mr-1" aria-hidden="true" /> 2</span>
                      ) : index === 2 ? (
                        <span className="flex items-center"><FaTrophy className="text-amber-700 mr-1" aria-hidden="true" /> 3</span>
                      ) : (
                        index + 1
                      )}
                    </td>
                    <td className="py-2 px-4">{entry.student_name}</td>
                    <td className="py-2 px-4">{entry.score}</td>
                    <td className="py-2 px-4">{formatTime(entry.time_taken)}</td>
                    <td className="py-2 px-4">{new Date(entry.completed_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-dark py-4">No leaderboard data available yet.</p>
        )}
      </div>
    </div>
  );
});

// --- Utility: Format time ---
function formatTime(seconds) {
  if (!seconds && seconds !== 0) return '-';
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}m ${secs}s`;
}

// --- Main QuizResultsPage ---
const QuizResultsPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [latestResult, setLatestResult] = useState(null);

  // Extract result from location state
  const result = location.state?.result;
  const quizTitle = location.state?.quizTitle;
  const timeTaken = location.state?.timeTaken;

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (!result) {
        try {
          const response = await ApiService.get(`/quiz/get-latest-result.php?quiz_id=${id}`);
          setLatestResult(response);
        } catch (error) {
          // Could add error state here
        }
      }
      try {
        const leaderboardData = await ApiService.get(`/quiz/get-leaderboard.php?quiz_id=${id}`);
        setLeaderboard(leaderboardData.leaderboard);
      } catch (error) {
        // Could add error state here
      }
      setLoading(false);
    };
    fetchData();
  }, [id, result]);

  // If no result and not loading, probably navigated directly to this page
  useEffect(() => {
    if (!result && !latestResult && !loading) {
      navigate('/student/quiz');
    }
  }, [result, latestResult, loading, navigate]);

  // Use either the passed result or the fetched latest result
  const resultData = useMemo(() => result || latestResult, [result, latestResult]);
  const percentageScore = useMemo(() => resultData ? Math.round((resultData.score / resultData.total_questions) * 100) : 0, [resultData]);
  const isPassing = useMemo(() => percentageScore >= 70, [percentageScore]);

  // Handlers
  const handleTryAgain = useCallback(() => navigate(`/student/quiz/${id}`), [navigate, id]);
  const handleViewHistory = useCallback(() => navigate('/student/quiz-history'), [navigate]);
  const handleBackToQuizzes = useCallback(() => navigate('/student/quiz'), [navigate]);

  if (loading) return <LoadingSpinner />;
  if (!resultData) return null;

  return (
    <div className="min-h-screen bg-background-light px-4 sm:px-6 md:px-8 py-8">
      <div className="max-w-4xl mx-auto">
        <ResultCard
          quizTitle={quizTitle}
          percentageScore={percentageScore}
          isPassing={isPassing}
          resultData={resultData}
          timeTaken={timeTaken}
          onTryAgain={handleTryAgain}
          onViewHistory={handleViewHistory}
          onBackToQuizzes={handleBackToQuizzes}
        />
        <div className="mt-8">
          <LeaderboardTable leaderboard={leaderboard} resultData={resultData} />
        </div>
      </div>
    </div>
  );
};

export { QuizResultsPage };
export default QuizResultsPage;
