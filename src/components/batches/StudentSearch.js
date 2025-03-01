import React, { useState, useEffect, useCallback } from 'react';
import ApiService from '../../utils/api';

const StudentSearch = ({ onSelectStudent, maxStudents, currentCount }) => {
    const [search, setSearch] = useState('');
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);

    // Memoize the searchStudents function with useCallback
    const searchStudents = useCallback(async () => {
        if (search.length < 2) return;
        
        try {
            setLoading(true);
            const response = await ApiService.get(`/users/search-students.php?q=${search}`);
            if (response.success) {
                setStudents(response.students || []);
            } else {
                setError(response.message || 'Failed to search students');
            }
        } catch (err) {
            setError('Error searching students');
        } finally {
            setLoading(false);
        }
    }, [search]); // Include search as a dependency

    useEffect(() => {
        if (search.length >= 2) {
            // Create a debounce effect to avoid too many API calls
            const timer = setTimeout(() => {
                searchStudents();
            }, 300);
            
            return () => clearTimeout(timer);
        } else {
            setStudents([]);
        }
    }, [search, searchStudents]); // Now include searchStudents in the dependency array

    const handleSelect = (student) => {
        setSelectedStudent(student);
        onSelectStudent(student);
    };

    const isBatchFull = currentCount >= maxStudents;

    return (
        <div className="space-y-4">
            {isBatchFull ? (
                <div className="bg-yellow-50 text-yellow-700 p-3 rounded-md">
                    This batch is full ({currentCount}/{maxStudents} students).
                </div>
            ) : (
                <>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search for students by name or email"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full px-4 py-2 border rounded-md focus:border-[#461fa3] focus:ring-[#461fa3]"
                        />
                        {loading && (
                            <div className="absolute right-3 top-3">
                                <div className="animate-spin h-4 w-4 border-2 border-[#461fa3] rounded-full border-t-transparent"></div>
                            </div>
                        )}
                    </div>

                    {error && <div className="text-red-500 text-sm">{error}</div>}

                    {search.length < 2 && (
                        <div className="text-gray-500 text-sm">Type at least 2 characters to search</div>
                    )}

                    <div className="max-h-60 overflow-y-auto border rounded-md">
                        {students.length === 0 && search.length >= 2 ? (
                            <div className="p-3 text-gray-500 text-center">No students found</div>
                        ) : (
                            <ul className="divide-y">
                                {students.map(student => (
                                    <li
                                        key={student.id}
                                        className={`p-3 flex justify-between items-center hover:bg-gray-50 cursor-pointer ${
                                            selectedStudent?.id === student.id ? 'bg-blue-50' : ''
                                        }`}
                                        onClick={() => handleSelect(student)}
                                    >
                                        <div>
                                            <p className="font-medium">{student.full_name}</p>
                                            <p className="text-sm text-gray-500">{student.email}</p>
                                        </div>
                                        <div>
                                            {selectedStudent?.id === student.id && (
                                                <span className="text-[#461fa3]">Selected</span>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default StudentSearch;
