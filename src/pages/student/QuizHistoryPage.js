import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../utils/api';
import { FaHistory, FaFilter, FaChartLine, FaTrophy, FaEye } from 'react-icons/fa';

const QuizHistoryPage = () => {
  const navigate = useNavigate();
  const [quizHistory, setQuizHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [stats, setStats] = useState(null);
  
  useEffect(() => {
    const fetchQuizHistory = async () => {
      try {
        const response = await ApiService.get(`/quiz/get-user-history.php?filter=${filter}`);
        setQuizHistory(response.history);
        setStats(response.stats);
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch quiz history');
        setLoading(false);
      }
    };
    
    fetchQuizHistory();
  }, [filter]);
  
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };
  
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setLoading(true);
  };
  
  const handleSort = (criteria) => {
    if (sortBy === criteria) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(criteria);
      setSortOrder('desc');
    }
  };
  
  // Sort quiz history based on current sort settings
  const sortedHistory = [...quizHistory].sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === 'date') {
      comparison = new Date(a.completed_at) - new Date(b.completed_at);
    } else if (sortBy === 'score') {
      comparison = a.score - b.score;
    } else if (sortBy === 'time') {
      comparison = a.time_taken - b.time_taken;
    } else if (sortBy === 'difficulty') {
      const difficultyOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
      comparison = difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });
  
  return (
    <div className="min-h-screen bg-[#f3f1f9] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#200e4a] flex items-center">
            <FaHistory className="mr-3" /> Quiz History
          </h1>
          <button
            onClick={() => navigate('/student/quiz')}
            className="px-4 py-2 bg-[#461fa3] text-white rounded-lg hover:bg-[#7646eb]"
          >
            Take New Quiz
          </button>
        </div>
        
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Quizzes</p>
                  <p className="text-3xl font-bold text-[#461fa3]">{stats.total_attempts}</p>
                </div>
                <FaChartLine className="text-4xl text-gray-200" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Average Score</p>
                  <p className="text-3xl font-bold text-[#461fa3]">{stats.average_score}%</p>
                </div>
                <FaTrophy className="text-4xl text-gray-200" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Highest Score</p>
                  <p className="text-3xl font-bold text-[#461fa3]">{stats.highest_score}%</p>
                </div>
                <div className={`text-lg font-bold px-3 py-1 rounded-full
                  ${stats.highest_difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                  stats.highest_difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'}`}
                >
                  {stats.highest_difficulty}
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Unique Quizzes</p>
                  <p className="text-3xl font-bold text-[#461fa3]">{stats.unique_quizzes}</p>
                </div>
                <FaEye className="text-4xl text-gray-200" />
              </div>
            </div>
          </div>
        )}
        
        {/* Filter Options */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-4 border-b flex items-center">
            <FaFilter className="text-[#461fa3] mr-2" />
            <h2 className="text-lg font-semibold">Filters</h2>
          </div>
          
          <div className="p-4 flex flex-wrap gap-3">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-4 py-2 rounded-lg text-sm
                ${filter === 'all' 
                  ? 'bg-[#461fa3] text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              All Quizzes
            </button>
            <button
              onClick={() => handleFilterChange('beginner')}
              className={`px-4 py-2 rounded-lg text-sm
                ${filter === 'beginner' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
            >
              Beginner
            </button>
            <button
              onClick={() => handleFilterChange('intermediate')}
              className={`px-4 py-2 rounded-lg text-sm
                ${filter === 'intermediate' 
                  ? 'bg-yellow-600 text-white' 
                  : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'}`}
            >
              Intermediate
            </button>
            <button
              onClick={() => handleFilterChange('advanced')}
              className={`px-4 py-2 rounded-lg text-sm
                ${filter === 'advanced' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
            >
              Advanced
            </button>
            <button
              onClick={() => handleFilterChange('passed')}
              className={`px-4 py-2 rounded-lg text-sm
                ${filter === 'passed' 
                  ? 'bg-[#461fa3] text-white' 
                  : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}`}
            >
              Passed Only
            </button>
          </div>
        </div>
        
        {/* History Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-[#200e4a]">Quiz Attempts</h2>
          </div>
          
          {loading ? (
            <div className="p-6 text-center">
              <p>Loading quiz history...</p>
            </div>
          ) : error ? (
            <div className="p-6">
              <p className="text-red-500">{error}</p>
            </div>
          ) : sortedHistory.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">No quiz history found.</p>
              <button
                onClick={() => navigate('/student/quiz')}
                className="mt-4 px-4 py-2 bg-[#461fa3] text-white rounded-lg hover:bg-[#7646eb]"
              >
                Take Your First Quiz
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th 
                      className="py-3 px-4 text-left cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('date')}
                    >
                      <div className="flex items-center">
                        Date
                        {sortBy === 'date' && (
                          <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th className="py-3 px-4 text-left">Quiz Title</th>
                    <th 
                      className="py-3 px-4 text-left cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('difficulty')}
                    >
                      <div className="flex items-center">
                        Difficulty
                        {sortBy === 'difficulty' && (
                          <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="py-3 px-4 text-left cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('score')}
                    >
                      <div className="flex items-center">
                        Score
                        {sortBy === 'score' && (
                          <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="py-3 px-4 text-left cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('time')}
                    >
                      <div className="flex items-center">
                        Time Taken
                        {sortBy === 'time' && (
                          <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th className="py-3 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedHistory.map((attempt) => {
                    const percentageScore = Math.round((attempt.score / attempt.total_questions) * 100);
                    const isPassing = percentageScore >= 70;
                    
                    return (
                      <tr key={attempt.id} className="border-t hover:bg-gray-50">
                        <td className="py-3 px-4">
                          {new Date(attempt.completed_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 font-medium">{attempt.quiz_title}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs
                            ${attempt.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                            attempt.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'}`}
                          >
                            {attempt.difficulty}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`font-semibold ${isPassing ? 'text-green-600' : 'text-red-600'}`}>
                            {percentageScore}%
                          </span>
                          <span className="text-gray-500 text-sm ml-1">
                            ({attempt.score}/{attempt.total_questions})
                          </span>
                        </td>
                        <td className="py-3 px-4">{formatTime(attempt.time_taken)}</td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => navigate(`/student/quiz/${attempt.quiz_id}`)}
                            className="text-[#461fa3] hover:text-[#7646eb] font-medium"
                          >
                            Retry
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizHistoryPage;
