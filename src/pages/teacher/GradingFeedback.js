import React, { useState, useEffect, useCallback } from 'react';
import ApiService from '../../utils/api';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const GradingFeedback = () => {
    const [students, setStudents] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState('all');
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showPerformanceModal, setShowPerformanceModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [feedback, setFeedback] = useState({
        rating: 5,
        comment: '',
        areas_of_improvement: '',
        strengths: ''
    });

    const fetchStudents = useCallback(async () => {
        try {
            const endpoint = selectedBatch === 'all' 
                ? '/grading/get-all-students.php'
                : `/grading/get-batch-students.php?batch_id=${selectedBatch}`;
            const response = await ApiService.get(endpoint);
            setStudents(response.students);
            setLoading(false);
        } catch (error) {
            setError('Failed to fetch students');
            setLoading(false);
        }
    }, [selectedBatch]);

    useEffect(() => {
        fetchStudents();
        fetchBatches();
    }, [fetchStudents]);

    const fetchBatches = async () => {
        try {
            const response = await ApiService.get('/classroom/get-teacher-classes.php');
            setBatches(response.classes);
        } catch (error) {
            console.error('Failed to fetch batches:', error);
        }
    };

    const handleSubmitFeedback = async (e) => {
        e.preventDefault();
        try {
            await ApiService.post('/grading/submit-feedback.php', {
                student_id: selectedStudent.id,
                ...feedback
            });
            setShowFeedbackModal(false);
            fetchStudents(); // Refresh the list
        } catch (error) {
            setError('Failed to submit feedback');
        }
    };

    const handleShowHistory = (student) => {
        setSelectedStudent(student);
        setShowHistoryModal(true);
    };

    const handleShowPerformance = (student) => {
        setSelectedStudent(student);
        setShowPerformanceModal(true);
    };

    return (
        <div className="min-h-screen bg-[#f3f1f9]">
            
            <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-[#200e4a]">Student Grading & Feedback</h1>
                    <select
                        value={selectedBatch}
                        onChange={(e) => setSelectedBatch(e.target.value)}
                        className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#461fa3]"
                    >
                        <option value="all">All Batches</option>
                        {batches.map(batch => (
                            <option key={batch.id} value={batch.id}>{batch.name}</option>
                        ))}
                    </select>
                </div>

                {loading ? (
                    <div className="text-center py-8">Loading...</div>
                ) : error ? (
                    <div className="text-red-500 py-8">{error}</div>
                ) : (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Grade</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Feedback</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {students.map((student) => (
                                    <tr key={student.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                            <div className="text-sm text-gray-500">{student.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {student.batch_name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${student.last_rating >= 4 ? 'bg-green-100 text-green-800' :
                                                student.last_rating >= 3 ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'}`}>
                                                {student.last_rating}/5
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {student.last_feedback_date ? new Date(student.last_feedback_date).toLocaleDateString() : 'No feedback yet'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => {
                                                    setSelectedStudent(student);
                                                    setShowFeedbackModal(true);
                                                }}
                                                className="text-[#461fa3] hover:text-[#7646eb]"
                                            >
                                                Add Feedback
                                            </button>
                                            <button
                                                onClick={() => handleShowHistory(student)}
                                                className="ml-4 text-[#461fa3] hover:text-[#7646eb]"
                                            >
                                                View History
                                            </button>
                                            <button
                                                onClick={() => handleShowPerformance(student)}
                                                className="ml-4 text-[#461fa3] hover:text-[#7646eb]"
                                            >
                                                View Performance
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Feedback Modal */}
                {showFeedbackModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl p-6 max-w-lg w-full">
                            <h2 className="text-2xl font-bold text-[#200e4a] mb-4">
                                Feedback for {selectedStudent.name}
                            </h2>
                            <form onSubmit={handleSubmitFeedback} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Rating</label>
                                    <select
                                        value={feedback.rating}
                                        onChange={(e) => setFeedback({...feedback, rating: e.target.value})}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
                                    >
                                        {[1,2,3,4,5].map(num => (
                                            <option key={num} value={num}>{num}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">General Feedback</label>
                                    <textarea
                                        value={feedback.comment}
                                        onChange={(e) => setFeedback({...feedback, comment: e.target.value})}
                                        rows={3}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Areas of Improvement</label>
                                    <textarea
                                        value={feedback.areas_of_improvement}
                                        onChange={(e) => setFeedback({...feedback, areas_of_improvement: e.target.value})}
                                        rows={2}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Strengths</label>
                                    <textarea
                                        value={feedback.strengths}
                                        onChange={(e) => setFeedback({...feedback, strengths: e.target.value})}
                                        rows={2}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
                                    />
                                </div>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowFeedbackModal(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#461fa3] hover:bg-[#7646eb]"
                                    >
                                        Submit Feedback
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* History Modal */}
                {showHistoryModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl p-6 max-w-lg w-full">
                            <h2 className="text-2xl font-bold text-[#200e4a] mb-4">
                                Feedback History for {selectedStudent.name}
                            </h2>
                            {/* Render feedback history here */}
                            <button
                                onClick={() => setShowHistoryModal(false)}
                                className="mt-4 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}

                {/* Performance Modal */}
                {showPerformanceModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl p-6 max-w-lg w-full">
                            <h2 className="text-2xl font-bold text-[#200e4a] mb-4">
                                Performance Tracking for {selectedStudent.name}
                            </h2>
                            <Line
                                data={{
                                    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
                                    datasets: [
                                        {
                                            label: 'Performance',
                                            data: [3, 2, 2, 1, 5, 4, 3],
                                            borderColor: 'rgba(75, 192, 192, 1)',
                                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                                        },
                                    ],
                                }}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        legend: {
                                            position: 'top',
                                        },
                                        title: {
                                            display: true,
                                            text: 'Student Performance Over Time',
                                        },
                                    },
                                }}
                            />
                            <button
                                onClick={() => setShowPerformanceModal(false)}
                                className="mt-4 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GradingFeedback;
