import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import ApiService from '../../utils/api';

const QuizPage = () => {
    const navigate = useNavigate();
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all');

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

    return (
        <div className="min-h-screen bg-[#f3f1f9]">
            <Navigation />
            <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-[#200e4a]">Chess Quizzes</h1>
                    <div className="flex space-x-4">
                        {filters.map(filter => (
                            <button
                                key={filter.id}
                                onClick={() => setActiveFilter(filter.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
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
                    <div className="text-center py-8">Loading...</div>
                ) : error ? (
                    <div className="text-red-500 py-8">{error}</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {quizzes.map((quiz) => (
                            <div
                                key={quiz.id}
                                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                            >
                                <div className="p-6">
                                    <h3 className="text-xl font-semibold text-[#461fa3] mb-2">
                                        {quiz.title}
                                    </h3>
                                    <p className="text-gray-600 mb-4">{quiz.description}</p>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">
                                            <span className="font-semibold">Time:</span> {quiz.time_limit} mins
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-xs
                                            ${quiz.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                                            quiz.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'}`}
                                        >
                                            {quiz.difficulty}
                                        </span>
                                    </div>
                                </div>
                                <div className="px-6 py-4 bg-gray-50 border-t">
                                    <button 
                                        onClick={() => navigate(`/student/quiz/${quiz.id}`)}
                                        className="w-full text-center text-[#461fa3] hover:text-[#7646eb] font-medium"
                                    >
                                        Start Quiz →
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizPage;
