import React, { useState, useEffect } from 'react';
import TopNavbar from '../../components/TopNavbar';
import Sidebar from '../../components/Sidebar';
import ApiService from '../../utils/api';
import { Link } from 'react-router-dom';

const ClassroomPage = () => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const response = await ApiService.get('/classroom/get-student-classes.php');
            setClasses(response.classes);
            setLoading(false);
        } catch (error) {
            setError('Failed to fetch classes');
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#f3f1f9]">
            <TopNavbar />
      <Sidebar />
            <div className="p-8">Loading...</div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-[#f3f1f9]">
            <TopNavbar />
      <Sidebar />
            <div className="p-8 text-red-500">{error}</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f3f1f9]">
            <TopNavbar />
      <Sidebar />
            <div className="p-8">
                <h1 className="text-3xl font-bold text-[#200e4a] mb-6">My Classes</h1>
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
            </div>
        </div>
    );
};

export default ClassroomPage;
