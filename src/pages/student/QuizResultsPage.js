import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import ApiService from '../../utils/api';
import { FaTrophy, FaChartLine, FaClock, FaRedo, FaList } from 'react-icons/fa';

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
  
  // Format time
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };
  
  useEffect(() => {
    // If we don't have result data in location state, try to fetch it
    const fetchData = async () => {
      if (!result) {
        try {
          // Fetch the latest quiz result for this quiz
          const response = await ApiService.get(`/quiz/get-latest-result.php?quiz_id=${id}`);
          setLatestResult(response); // Use the response by setting it to state
        } catch (error) {
          console.error("Failed to fetch quiz result:", error);
        }
      }
      
      // Fetch leaderboard regardless
      try {
        const leaderboardData = await ApiService.get(`/quiz/get-leaderboard.php?quiz_id=${id}`);
        setLeaderboard(leaderboardData.leaderboard);
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      }
      
      setLoading(false);
    };
    
    fetchData();
  }, [id, result]);
  
  // If no result and not loading, probably navigated directly to this page
  if (!result && !latestResult && !loading) {
    navigate('/student/quiz');
    return null;
  }
  
  // Use either the passed result or the fetched latest result
  const resultData = result || latestResult;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3f1f9] p-8 flex items-center justify-center">
        <p>Loading results...</p>
      </div>
    );
  }
  
  const percentageScore = Math.round((resultData.score / resultData.total_questions) * 100);
  const isPassing = percentageScore >= 70;
  
  return (
    <div className="min-h-screen bg-[#f3f1f9] p-8">
      <div className="max-w-4xl mx-auto">
        {/* Result Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className={`p-6 text-center ${isPassing ? 'bg-green-50' : 'bg-red-50'}`}>
            <h1 className="text-3xl font-bold text-[#200e4a] mb-2">{quizTitle}</h1>
            <p className="text-xl font-semibold mb-4">
              {isPassing ? 'Congratulations!' : 'Keep practicing!'}
            </p>
            <div className="flex justify-center">
              <div className="w-32 h-32 rounded-full border-8 border-[#461fa3] flex items-center justify-center bg-white">
                <span className="text-4xl font-bold text-[#461fa3]">{percentageScore}%</span>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <FaTrophy className="mx-auto text-[#7646eb] text-xl mb-2" />
                <p className="text-sm text-gray-500">Score</p>
                <p className="text-xl font-semibold">{resultData.score} / {resultData.total_questions}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <FaClock className="mx-auto text-[#7646eb] text-xl mb-2" />
                <p className="text-sm text-gray-500">Time Taken</p>
                <p className="text-xl font-semibold">{formatTime(timeTaken)}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <FaChartLine className="mx-auto text-[#7646eb] text-xl mb-2" />
                <p className="text-sm text-gray-500">Percentile</p>
                <p className="text-xl font-semibold">{resultData.percentile || '-'}</p>
              </div>
            </div>
            
            {resultData.feedback && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-1">Feedback</h3>
                <p className="text-blue-700">{resultData.feedback}</p>
              </div>
            )}
            
            <div className="flex flex-wrap gap-3 justify-center">
              <button 
                onClick={() => navigate(`/student/quiz/${id}`)}
                className="px-4 py-2 rounded-lg bg-[#461fa3] text-white hover:bg-[#7646eb] flex items-center"
              >
                <FaRedo className="mr-2" /> Try Again
              </button>
              <button 
                onClick={() => navigate('/student/quiz-history')}
                className="px-4 py-2 rounded-lg border border-[#461fa3] text-[#461fa3] hover:bg-[#f3f1f9] flex items-center"
              >
                <FaList className="mr-2" /> View History
              </button>
              <button 
                onClick={() => navigate('/student/quiz')}
                className="px-4 py-2 rounded-lg border border-[#461fa3] text-[#461fa3] hover:bg-[#f3f1f9]"
              >
                Back to Quizzes
              </button>
            </div>
          </div>
        </div>
        
        {/* Leaderboard */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-[#200e4a]">Quiz Leaderboard</h2>
          </div>
          
          <div className="p-6">
            {leaderboard.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
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
                        className={`border-b ${resultData.user_id === entry.user_id ? 'bg-[#f3f1f9]' : ''}`}
                      >
                        <td className="py-2 px-4">
                          {index === 0 ? (
                            <span className="flex items-center">
                              <FaTrophy className="text-yellow-500 mr-1" /> 1
                            </span>
                          ) : index === 1 ? (
                            <span className="flex items-center">
                              <FaTrophy className="text-gray-400 mr-1" /> 2
                            </span>
                          ) : index === 2 ? (
                            <span className="flex items-center">
                              <FaTrophy className="text-amber-700 mr-1" /> 3
                            </span>
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
              <p className="text-center text-gray-500 py-4">No leaderboard data available yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizResultsPage;
