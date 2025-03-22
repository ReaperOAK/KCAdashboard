import React, { useState, useEffect } from 'react';
import ApiService from '../../utils/api';
import { FaTrophy, FaMedal, FaChess, FaFilter } from 'react-icons/fa';

const LeaderboardPage = () => {
  const [leaderboards, setLeaderboards] = useState({});
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeQuiz, setActiveQuiz] = useState('overall');
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get all quizzes first
        const quizzesResponse = await ApiService.get('/quiz/get-all.php');
        setQuizzes(quizzesResponse.quizzes);
        
        // Get overall leaderboard
        const overallResponse = await ApiService.get('/quiz/get-overall-leaderboard.php');
        
        const leaderboardsData = {
          'overall': overallResponse.leaderboard
        };
        
        // Get top quiz leaderboards
        const topQuizzes = quizzesResponse.quizzes.slice(0, 3);
        for (const quiz of topQuizzes) {
          const quizLeaderboard = await ApiService.get(`/quiz/get-leaderboard.php?quiz_id=${quiz.id}`);
          leaderboardsData[quiz.id] = quizLeaderboard.leaderboard;
        }
        
        setLeaderboards(leaderboardsData);
        setLoading(false);
      } catch (error) {
        setError('Failed to load leaderboard data');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };
  
  const handleQuizChange = (quizId) => {
    setActiveQuiz(quizId);
    
    // Fetch leaderboard data for this quiz if we don't have it yet
    if (!leaderboards[quizId]) {
      setLoading(true);
      ApiService.get(`/quiz/get-leaderboard.php?quiz_id=${quizId}`)
        .then(response => {
          setLeaderboards(prev => ({
            ...prev,
            [quizId]: response.leaderboard
          }));
          setLoading(false);
        })
        .catch(error => {
          setError('Failed to load leaderboard data');
          setLoading(false);
        });
    }
  };
  
  return (
    <div className="min-h-screen bg-[#f3f1f9] p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-[#200e4a] mb-2 flex items-center justify-center">
            <FaTrophy className="text-yellow-500 mr-3" /> Chess Quiz Leaderboards
          </h1>
          <p className="text-gray-600">Compare your performance with other students</p>
        </div>
        
        {/* Quiz Filter */}
        <div className="bg-white rounded-lg shadow mb-6 overflow-hidden">
          <div className="p-4 border-b bg-gray-50 flex items-center">
            <FaFilter className="text-[#461fa3] mr-2" />
            <h2 className="text-lg font-semibold">Select Quiz</h2>
          </div>
          
          <div className="p-4 flex flex-wrap gap-2">
            <button
              onClick={() => handleQuizChange('overall')}
              className={`px-4 py-2 rounded-lg text-sm font-medium
                ${activeQuiz === 'overall' 
                  ? 'bg-[#461fa3] text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Overall Ranking
            </button>
            
            {quizzes.map(quiz => (
              <button
                key={quiz.id}
                onClick={() => handleQuizChange(quiz.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center
                  ${activeQuiz === quiz.id
                    ? 'bg-[#461fa3] text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <FaChess className="mr-1" /> {quiz.title}
              </button>
            ))}
          </div>
        </div>
        
        {/* Leaderboard Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-[#200e4a]">
              {activeQuiz === 'overall' ? 'Overall Student Ranking' : 
                `Leaderboard: ${quizzes.find(q => q.id === activeQuiz)?.title || ''}`}
            </h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-12 h-12 border-4 border-[#461fa3] border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>Loading leaderboard data...</p>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-600">
              <p>{error}</p>
            </div>
          ) : leaderboards[activeQuiz]?.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">No leaderboard data available yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
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
                  {leaderboards[activeQuiz]?.map((entry, index) => (
                    <tr key={index} className="border-t hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {index === 0 ? (
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white">1</div>
                          </div>
                        ) : index === 1 ? (
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white">2</div>
                          </div>
                        ) : index === 2 ? (
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-amber-700 flex items-center justify-center text-white">3</div>
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                            {index + 1}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {entry.student_name}
                      </td>
                      {activeQuiz === 'overall' ? (
                        <>
                          <td className="py-3 px-4 font-semibold text-[#461fa3]">
                            {entry.total_score}
                          </td>
                          <td className="py-3 px-4">
                            {entry.quizzes_completed}
                          </td>
                          <td className="py-3 px-4">
                            {entry.average_score}%
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-3 px-4 font-semibold text-[#461fa3]">
                            {entry.score}
                          </td>
                          <td className="py-3 px-4">
                            {formatTime(entry.time_taken)}
                          </td>
                          <td className="py-3 px-4">
                            {new Date(entry.completed_at).toLocaleDateString()}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
