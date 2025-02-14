import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import ApiService from '../../utils/api';

const ClassroomDetails = () => {
    const { id } = useParams();
    const [classroom, setClassroom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const fetchClassroomDetails = async () => {
            try {
                const response = await ApiService.get(`/classroom/get-classroom-details.php?id=${id}`);
                setClassroom(response.classroom);
                setLoading(false);
            } catch (error) {
                setError('Failed to fetch classroom details');
                setLoading(false);
            }
        };

        fetchClassroomDetails();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen bg-[#f3f1f9]">
            <Navigation />
            <div className="p-8">Loading...</div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-[#f3f1f9]">
            <Navigation />
            <div className="p-8 text-red-500">{error}</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f3f1f9]">
            <Navigation />
            <div className="p-8">
                {classroom && (
                    <>
                        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                            <h1 className="text-3xl font-bold text-[#200e4a] mb-2">{classroom.name}</h1>
                            <p className="text-gray-600 mb-4">{classroom.description}</p>
                            <div className="flex items-center text-sm text-gray-500">
                                <span className="mr-4"><span className="font-semibold">Teacher:</span> {classroom.teacher_name}</span>
                                <span className="mr-4"><span className="font-semibold">Schedule:</span> {classroom.schedule}</span>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                    classroom.status === 'active' ? 'bg-green-100 text-green-800' :
                                    classroom.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                    {classroom.status}
                                </span>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                            <div className="border-b">
                                <nav className="flex">
                                    {['overview', 'materials', 'assignments', 'discussions'].map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`px-6 py-4 text-sm font-medium ${
                                                activeTab === tab
                                                    ? 'text-[#461fa3] border-b-2 border-[#461fa3]'
                                                    : 'text-gray-500 hover:text-[#461fa3]'
                                            }`}
                                        >
                                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                        </button>
                                    ))}
                                </nav>
                            </div>

                            <div className="p-6">
                                {activeTab === 'overview' && (
                                    <div>
                                        <h2 className="text-xl font-semibold text-[#200e4a] mb-4">Class Overview</h2>
                                        <p className="text-gray-600">Course content and details will be displayed here.</p>
                                    </div>
                                )}
                                {activeTab === 'materials' && (
                                    <div>
                                        <h2 className="text-xl font-semibold text-[#200e4a] mb-4">Study Materials</h2>
                                        <p className="text-gray-600">Class materials and resources will be listed here.</p>
                                    </div>
                                )}
                                {activeTab === 'assignments' && (
                                    <div>
                                        <h2 className="text-xl font-semibold text-[#200e4a] mb-4">Assignments</h2>
                                        <p className="text-gray-600">Homework and assignments will appear here.</p>
                                    </div>
                                )}
                                {activeTab === 'discussions' && (
                                    <div>
                                        <h2 className="text-xl font-semibold text-[#200e4a] mb-4">Class Discussions</h2>
                                        <p className="text-gray-600">Discussion forum will be integrated here.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ClassroomDetails;
