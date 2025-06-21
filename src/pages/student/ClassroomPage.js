import React, { useState, useEffect } from 'react';

import ApiService from '../../utils/api';
import { Link } from 'react-router-dom';

const ClassroomPage = () => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [availableClasses, setAvailableClasses] = useState([]);
    const [showAvailable, setShowAvailable] = useState(false);
    const [enrolling, setEnrolling] = useState(null);
    const [enrollSuccess, setEnrollSuccess] = useState(null);
    const [enrollError, setEnrollError] = useState(null);

    useEffect(() => {
        fetchClasses();
    }, []);
    
    // Fetch available classes when "Browse Available Classes" is clicked
    useEffect(() => {
        if (showAvailable) {
            fetchAvailableClasses();
        }
    }, [showAvailable]);    const fetchClasses = async () => {
        try {
            // Try fetching from batches first, fallback to classrooms
            let response;
            try {
                response = await ApiService.get('/classroom/get-student-batches.php');
            } catch (batchError) {
                console.log('Batch endpoint not available, falling back to classroom endpoint');
                response = await ApiService.get('/classroom/get-student-classes.php');
            }
            setClasses(response.classes);
            setLoading(false);
        } catch (error) {
            setError('Failed to fetch classes');
            setLoading(false);
        }
    };
    
    const fetchAvailableClasses = async () => {
        try {
            const response = await ApiService.get('/classroom/get-available-classes.php');
            setAvailableClasses(response.classes);
        } catch (error) {
            console.error('Failed to fetch available classes:', error);
        }
    };
    
    const handleEnroll = async (classId) => {
        setEnrolling(classId);
        setEnrollSuccess(null);
        setEnrollError(null);
        
        try {
            await ApiService.post('/classroom/enroll.php', { classroom_id: classId });
            
            // Show success message
            setEnrollSuccess(classId);
            
            // Refresh both lists
            fetchClasses();
            fetchAvailableClasses();
            
            // Clear success message after 3 seconds
            setTimeout(() => setEnrollSuccess(null), 3000);
        } catch (error) {
            setEnrollError(error.message || 'Failed to enroll in class');
        } finally {
            setEnrolling(null);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#f3f1f9]">
            
            <div className="p-8">Loading...</div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-[#f3f1f9]">
            
            <div className="p-8 text-red-500">{error}</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f3f1f9]">
            
            <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-[#200e4a]">My Classes</h1>
                    <button
                        onClick={() => setShowAvailable(!showAvailable)}
                        className="px-4 py-2 bg-[#461fa3] text-white rounded-md hover:bg-[#7646eb]"
                    >
                        {showAvailable ? 'Hide Available Classes' : 'Browse Available Classes'}
                    </button>
                </div>
                
                {/* Enrolled Classes */}
                {classes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {classes.map((classroom) => (
                            <div key={classroom.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                                <div className="p-6">
                                    <h2 className="text-xl font-semibold text-[#461fa3] mb-2">
                                        {classroom.name}
                                    </h2>
                                    <p className="text-gray-600 mb-4">{classroom.description}</p>
                                    <div className="text-sm text-gray-500">
                                        <p><span className="font-semibold">Teacher:</span> {classroom.teacher_name}</p>
                                        <p><span className="font-semibold">Schedule:</span> {classroom.schedule}</p>
                                        <p><span className="font-semibold">Status:</span> 
                                            <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                                                classroom.status === 'active' ? 'bg-green-100 text-green-800' :
                                                classroom.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {classroom.status}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                <div className="px-6 py-4 bg-gray-50 border-t">
                                    <Link 
                                        to={`/student/classes/${classroom.id}`}
                                        className="block w-full text-center text-[#461fa3] hover:text-[#7646eb]"
                                    >
                                        View Details →
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                        <p className="text-gray-600 mb-4">You are not enrolled in any classes yet.</p>
                        <button
                            onClick={() => setShowAvailable(true)}
                            className="px-4 py-2 bg-[#461fa3] text-white rounded-md hover:bg-[#7646eb]"
                        >
                            Browse Available Classes
                        </button>
                    </div>
                )}
                
                {/* Available Classes for Enrollment */}
                {showAvailable && (
                    <div className="mt-12">
                        <h2 className="text-2xl font-bold text-[#200e4a] mb-6">Available Classes</h2>
                        
                        {availableClasses.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {availableClasses.map((classroom) => (
                                    <div key={classroom.id} className="bg-white border-2 border-dashed border-gray-200 rounded-xl overflow-hidden">
                                        <div className="p-6">
                                            <h2 className="text-xl font-semibold text-[#461fa3] mb-2">
                                                {classroom.name}
                                            </h2>
                                            <p className="text-gray-600 mb-4">{classroom.description}</p>
                                            <div className="text-sm text-gray-500 mb-4">
                                                <p><span className="font-semibold">Teacher:</span> {classroom.teacher_name}</p>
                                                <p><span className="font-semibold">Schedule:</span> {classroom.schedule}</p>
                                                <p><span className="font-semibold">Level:</span> {classroom.level}</p>
                                                <p>
                                                    <span className="font-semibold">Availability:</span> 
                                                    <span className="ml-1 text-green-600">{classroom.available_slots} slots left</span>
                                                </p>
                                            </div>
                                            
                                            <button
                                                onClick={() => handleEnroll(classroom.id)}
                                                disabled={enrolling === classroom.id}
                                                className="w-full px-4 py-2 bg-[#461fa3] text-white rounded-md hover:bg-[#7646eb] disabled:opacity-50"
                                            >
                                                {enrolling === classroom.id ? 'Enrolling...' : 
                                                 enrollSuccess === classroom.id ? 'Enrolled!' : 'Enroll Now'}
                                            </button>
                                            
                                            {enrollError && enrolling === classroom.id && (
                                                <p className="mt-2 text-sm text-red-600">{enrollError}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-600">No available classes found at the moment.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClassroomPage;