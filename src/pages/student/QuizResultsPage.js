
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { QuizApi } from '../../api/quiz';
import LoadingSpinner from '../../components/quiz/LoadingSpinner';
import ResultCard from '../../components/quiz/ResultCard';
import LeaderboardTable from '../../components/quiz/LeaderboardTable';

function formatTime(seconds) {
  if (!seconds && seconds !== 0) return '-';
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}m ${secs}s`;
}

const QuizResultsPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [latestResult, setLatestResult] = useState(null);

  const result = location.state?.result;
  const quizTitle = location.state?.quizTitle;
  const timeTaken = location.state?.timeTaken;

  useEffect(() => {
    const fetchData = async () => {
      if (!result) {
        try {
          const response = QuizApi.getLatestResult ? await QuizApi.getLatestResult(id) : {};
          setLatestResult(response);
        } catch (error) {}
      }
      try {
        const leaderboardData = QuizApi.getQuizLeaderboard ? await QuizApi.getQuizLeaderboard(id) : { leaderboard: [] };
        setLeaderboard(leaderboardData.leaderboard);
      } catch (error) {}
      setLoading(false);
    };
    fetchData();
  }, [id, result]);

  useEffect(() => {
    if (!result && !latestResult && !loading) {
      navigate('/student/quiz');
    }
  }, [result, latestResult, loading, navigate]);

  const resultData = useMemo(() => {
    const data = result || latestResult;
    if (!data) return null;
    return {
      ...data,
      timeTakenFormatted: formatTime(timeTaken),
    };
  }, [result, latestResult, timeTaken]);
  const percentageScore = useMemo(() => resultData ? Math.round((resultData.score / resultData.total_questions) * 100) : 0, [resultData]);
  const isPassing = useMemo(() => percentageScore >= 70, [percentageScore]);

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
