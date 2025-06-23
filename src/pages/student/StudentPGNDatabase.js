import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../utils/api';

const StudentPGNDatabase = () => {
    const navigate = useNavigate();
    const [pgns, setPgns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterCategory, setFilterCategory] = useState('');
    const [filterTeacher, setFilterTeacher] = useState('');
    const [teachers, setTeachers] = useState([]);

    // Navigate to PGN viewer page
    const navigateToPGNViewer = (pgn) => {
        // Store PGN data in sessionStorage for retrieval on the viewer page
        sessionStorage.setItem('viewPGN', JSON.stringify(pgn));
        // Navigate to the dedicated viewer page with the PGN ID
        navigate(`/pgn-viewer/${pgn.id}`);
    };

    const fetchPGNs = useCallback(async () => {
        try {
            setLoading(true);
            const response = await ApiService.getStudentPGNs(
                filterCategory || null, 
                filterTeacher || null
            );
            setPgns(response.pgns || []);
            setLoading(false);
        } catch (error) {
            setError('Failed to fetch PGNs');
            setLoading(false);
        }
    }, [filterCategory, filterTeacher]);

    const fetchTeachers = useCallback(async () => {
        try {
            const response = await ApiService.getTeachers();
            setTeachers(response.teachers || []);
        } catch (error) {
            console.error('Failed to fetch teachers:', error);
        }
    }, []);

    useEffect(() => {
        fetchPGNs();
        fetchTeachers();
    }, [fetchPGNs, fetchTeachers]);

    const handleCategoryChange = (e) => {
        setFilterCategory(e.target.value);
    };

    const handleTeacherChange = (e) => {
        setFilterTeacher(e.target.value);
    };

    const clearFilters = () => {
        setFilterCategory('');
        setFilterTeacher('');
    };

    return (
        <div className="min-h-screen bg-[#f3f1f9]">
            <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-[#200e4a]">PGN Database</h1>
                    <div className="text-sm text-gray-600">
                        View PGNs shared with you and public PGNs
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg p-4 mb-6 shadow">
                    <h3 className="text-lg font-semibold text-[#200e4a] mb-4">Filters</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Category
                            </label>
                            <select
                                value={filterCategory}
                                onChange={handleCategoryChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#461fa3]"
                            >
                                <option value="">All Categories</option>
                                <option value="opening">Opening</option>
                                <option value="middlegame">Middlegame</option>
                                <option value="endgame">Endgame</option>
                                <option value="tactics">Tactics</option>
                                <option value="strategy">Strategy</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Teacher
                            </label>
                            <select
                                value={filterTeacher}
                                onChange={handleTeacherChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#461fa3]"
                            >
                                <option value="">All Teachers</option>
                                {teachers.map(teacher => (
                                    <option key={teacher.id} value={teacher.id}>
                                        {teacher.full_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Error display */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {/* PGN listing */}
                {loading ? (
                    <div className="text-center py-8">
                        <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full border-[#461fa3]" role="status">
                            <span className="sr-only">Loading...</span>
                        </div>
                        <p className="mt-2 text-gray-600">Loading PGNs...</p>
                    </div>
                ) : pgns.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="text-gray-500 text-lg">
                            <div className="mb-4">♟️</div>
                            <p>No PGNs available</p>
                            <p className="text-sm mt-2">
                                {filterCategory || filterTeacher ? 
                                    'Try adjusting your filters to see more results.' :
                                    'No PGNs have been shared with you or made public yet.'
                                }
                            </p>
                        </div>
                    </div>
                ) : (
                    <StudentPGNList
                        pgns={pgns}
                        onView={navigateToPGNViewer}
                    />
                )}
            </div>
        </div>
    );
};

// Student-specific PGN List component (simplified version)
const StudentPGNList = ({ pgns, onView }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pgns.map((pgn) => (
                <div key={pgn.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-[#200e4a] line-clamp-2">
                            {pgn.title}
                        </h3>
                        <div className="flex space-x-2">
                            {pgn.access_type === 'public' ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    🌐 Public
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    🤝 Shared
                                </span>
                            )}
                        </div>
                    </div>
                    
                    {pgn.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                            {pgn.description}
                        </p>
                    )}
                    
                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Category:</span>
                            <span className="font-medium capitalize text-[#461fa3]">
                                {pgn.category}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Teacher:</span>
                            <span className="font-medium text-[#461fa3]">
                                {pgn.teacher_name}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Added:</span>
                            <span className="text-gray-700">
                                {new Date(pgn.created_at).toLocaleDateString()}
                            </span>
                        </div>
                        {pgn.shared_at && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Shared:</span>
                                <span className="text-gray-700">
                                    {new Date(pgn.shared_at).toLocaleDateString()}
                                </span>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex justify-center">
                        <button
                            onClick={() => onView(pgn)}
                            className="w-full px-4 py-2 bg-[#461fa3] text-white rounded-lg hover:bg-[#7646eb] transition-colors"
                        >
                            📖 View PGN
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default StudentPGNDatabase;
