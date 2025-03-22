import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../utils/api';
import QuizCard from '../../components/student/QuizCard';
import { FaSearch, FaTrophy, FaHistory } from 'react-icons/fa';

const QuizPage = () => {
    const navigate = useNavigate();
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filters = [
        { id: 'all', label: 'All Quizzes' },
        { id: 'beginner', label: 'Beginner' },
        { id: 'intermediate', label: 'Intermediate' },
        { id: 'advanced', label: 'Advanced' }
    ];

    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const endpoint = activeFilter === 'all' 
                    ? '/quiz/get-all.php'
                    : `/quiz/get-by-difficulty.php?difficulty=${activeFilter}`;
                
                const response = await ApiService.get(endpoint);
                setQuizzes(response.quizzes);
                setLoading(false);
            } catch (error) {
                setError('Failed to fetch quizzes');
                setLoading(false);
            }
        };

        fetchQuizzes();
    }, [activeFilter]);

    // Filter quizzes based on search query
    const filteredQuizzes = quizzes.filter(quiz => 
        quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quiz.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#f3f1f9]">
            <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-[#200e4a]">Chess Quizzes</h1>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => navigate('/student/quiz-history')}
                            className="px-4 py-2 rounded-lg bg-white border border-[#461fa3] text-[#461fa3] hover:bg-[#f3f1f9] flex items-center"
                        >
                            <FaHistory className="mr-2" />
                            Quiz History
                        </button>
                        <button
                            onClick={() => navigate('/student/leaderboard')}
                            className="px-4 py-2 rounded-lg bg-[#461fa3] text-white hover:bg-[#7646eb] flex items-center"
                        >
                            <FaTrophy className="mr-2" />
                            Leaderboard
                        </button>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
                    <div className="relative flex-grow max-w-md">
                        <input
                            type="text"
                            placeholder="Search quizzes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#461fa3]"
                        />
                        <FaSearch className="absolute left-3 top-3 text-gray-400" />
                    </div>
                    <div className="flex space-x-2 overflow-x-auto">
                        {filters.map(filter => (
                            <button
                                key={filter.id}
                                onClick={() => setActiveFilter(filter.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
                                    ${activeFilter === filter.id
                                        ? 'bg-[#461fa3] text-white'
                                        : 'bg-white text-[#461fa3] hover:bg-[#461fa3] hover:text-white'
                                    }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin w-12 h-12 border-4 border-[#461fa3] border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading quizzes...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 p-4 rounded-lg text-red-800">
                        <p>{error}</p>
                    </div>
                ) : filteredQuizzes.length === 0 ? (
                    <div className="text-center py-8 bg-white rounded-lg shadow-md">
                        <p className="text-gray-600 mb-4">No quizzes found matching your criteria.</p>
                        {searchQuery && (
                            <button 
                                onClick={() => setSearchQuery('')}
                                className="px-4 py-2 bg-[#461fa3] text-white rounded-lg"
                            >
                                Clear Search
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredQuizzes.map((quiz) => (
                            <QuizCard key={quiz.id} quiz={quiz} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizPage;
