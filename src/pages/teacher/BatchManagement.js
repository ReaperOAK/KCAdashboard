import React, { useState, useEffect } from 'react';
import ApiService from '../../utils/api';
import BatchList from '../../components/batches/BatchList';
import CreateBatchForm from '../../components/batches/CreateBatchForm';
import Modal from '../../components/common/Modal';

const BatchManagement = () => {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showStudentModal, setShowStudentModal] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [students, setStudents] = useState([]);

    useEffect(() => {
        fetchBatches();
    }, []);

    const fetchBatches = async () => {
        try {
            setLoading(true);
            const response = await ApiService.getBatches();
            if (response && response.success) {
                setBatches(response.batches || []);
            } else {
                throw new Error(response?.message || 'Failed to fetch batches');
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching batches:', error);
            setError(error.message || 'An error occurred while fetching batches');
            setLoading(false);
        }
    };

    const handleManageStudents = async (batch) => {
        setSelectedBatch(batch);
        try {
            const response = await ApiService.getBatchStudents(batch.id);
            if (response && response.success) {
                setStudents(response.students || []);
            }
            setShowStudentModal(true);
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    const handleCreateSuccess = () => {
        fetchBatches();
        setShowCreateModal(false);
    };

    return (
        <div className="min-h-screen bg-[#f3f1f9] p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-[#200e4a]">Batch Management</h1>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2 bg-[#461fa3] text-white rounded-lg hover:bg-[#7646eb] transition-colors"
                    >
                        Create New Batch
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#461fa3]"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-500 p-4 rounded-lg">
                        {error}
                    </div>
                ) : batches.length === 0 ? (
                    <div className="bg-white rounded-xl p-8 text-center text-gray-500">
                        <p>No batches found. Create your first batch to get started.</p>
                    </div>
                ) : (
                    <BatchList 
                        batches={batches} 
                        onManageStudents={handleManageStudents}
                    />
                )}

                {/* Create Batch Modal */}
                {showCreateModal && (
                    <Modal
                        title="Create New Batch"
                        onClose={() => setShowCreateModal(false)}
                    >
                        <CreateBatchForm
                            onClose={() => setShowCreateModal(false)}
                            onSuccess={handleCreateSuccess}
                        />
                    </Modal>
                )}

                {/* Manage Students Modal */}
                {showStudentModal && selectedBatch && (
                    <Modal
                        title={`Manage Students - ${selectedBatch.name}`}
                        onClose={() => setShowStudentModal(false)}
                    >
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium">
                                    Current Students ({students.length}/{selectedBatch.max_students})
                                </h3>
                                <button
                                    onClick={() => {/* Handle add student */}}
                                    className="px-3 py-1 bg-[#461fa3] text-white rounded-md hover:bg-[#7646eb]"
                                >
                                    Add Student
                                </button>
                            </div>
                            {students.length === 0 ? (
                                <p className="text-center text-gray-500 py-4">No students enrolled in this batch yet.</p>
                            ) : (
                                <div className="divide-y">
                                    {students.map(student => (
                                        <div 
                                            key={student.id} 
                                            className="py-3 flex justify-between items-center"
                                        >
                                            <div>
                                                <p className="font-medium">{student.full_name}</p>
                                                <p className="text-sm text-gray-500">{student.email}</p>
                                            </div>
                                            <button
                                                onClick={() => {/* Handle remove student */}}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Modal>
                )}
            </div>
        </div>
    );
};

export default BatchManagement;
