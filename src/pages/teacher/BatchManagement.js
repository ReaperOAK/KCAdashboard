import React, { useState, useEffect } from 'react';
import TopNavbar from '../../components/TopNavbar';
import Sidebar from '../../components/Sidebar';
import ApiService from '../../utils/api';

const BatchManagement = () => {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newBatch, setNewBatch] = useState({
        name: '',
        description: '',
        level: 'beginner',
        schedule: '',
        max_students: 10
    });

    useEffect(() => {
        fetchBatches();
    }, []);

    const fetchBatches = async () => {
        try {
            // Using the existing classroom endpoint
            const response = await ApiService.get('/classroom/get-teacher-classes.php');
            setBatches(response.classes);
            setLoading(false);
        } catch (error) {
            setError('Failed to fetch batches');
            setLoading(false);
        }
    };

    const handleAddBatch = async (e) => {
        e.preventDefault();
        try {
            // Using the existing classroom endpoint
            await ApiService.post('/classroom/create.php', newBatch);
            setShowAddModal(false);
            fetchBatches();
            setNewBatch({ name: '', description: '', level: 'beginner', schedule: '', max_students: 10 });
        } catch (error) {
            setError('Failed to create batch');
        }
    };

    return (
        <div className="min-h-screen bg-[#f3f1f9]">
            <TopNavbar />
      <Sidebar />
            <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-[#200e4a]">Batch Management</h1>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-2 bg-[#461fa3] text-white rounded-lg hover:bg-[#7646eb]"
                    >
                        Create New Batch
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-8">Loading...</div>
                ) : error ? (
                    <div className="text-red-500 py-8">{error}</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {batches.map((batch) => (
                            <div
                                key={batch.id}
                                className="bg-white rounded-xl shadow-lg overflow-hidden"
                            >
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-xl font-semibold text-[#461fa3]">
                                            {batch.name}
                                        </h3>
                                        <span className={`px-3 py-1 rounded-full text-xs
                                            ${batch.status === 'active' ? 'bg-green-100 text-green-800' :
                                            batch.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                                            'bg-yellow-100 text-yellow-800'}`}
                                        >
                                            {batch.status}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 mb-4">{batch.description}</p>
                                    <div className="space-y-2 text-sm text-gray-500">
                                        <p><span className="font-semibold">Level:</span> {batch.level}</p>
                                        <p><span className="font-semibold">Schedule:</span> {batch.schedule}</p>
                                        <p><span className="font-semibold">Students:</span> {batch.student_count}/{batch.max_students}</p>
                                    </div>
                                </div>
                                <div className="px-6 py-4 bg-gray-50 border-t flex justify-between">
                                    <button className="text-[#461fa3] hover:text-[#7646eb]">
                                        View Details
                                    </button>
                                    <button className="text-[#461fa3] hover:text-[#7646eb]">
                                        Manage Students
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add Batch Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl p-6 max-w-md w-full">
                            <h2 className="text-2xl font-bold text-[#200e4a] mb-4">Create New Batch</h2>
                            <form onSubmit={handleAddBatch}>
                                {/* Form fields here */}
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BatchManagement;
