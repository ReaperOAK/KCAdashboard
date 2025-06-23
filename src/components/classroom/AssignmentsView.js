import React, { useState, useEffect } from 'react';
import ApiService from '../../utils/api';

const AssignmentsView = ({ classroomId, refreshTrigger }) => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [showSubmissions, setShowSubmissions] = useState(false);
    const [gradingSubmission, setGradingSubmission] = useState(null);
    const [gradeForm, setGradeForm] = useState({ grade: '', feedback: '' });

    useEffect(() => {
        fetchAssignments();
    }, [classroomId, refreshTrigger]);

    const fetchAssignments = async () => {
        try {
            setLoading(true);
            const response = await ApiService.getTeacherAssignments(classroomId);
            setAssignments(response.assignments || []);
        } catch (error) {
            console.error('Error fetching assignments:', error);
            setError('Failed to fetch assignments');
        } finally {
            setLoading(false);
        }
    };

    const handleViewSubmissions = async (assignment) => {
        try {
            setSelectedAssignment(assignment);
            const response = await ApiService.getAssignmentSubmissions(assignment.id);
            setSubmissions(response.submissions || []);
            setShowSubmissions(true);
        } catch (error) {
            console.error('Error fetching submissions:', error);
            setError('Failed to fetch submissions');
        }
    };

    const handleGradeSubmission = (submission) => {
        setGradingSubmission(submission);
        setGradeForm({
            grade: submission.grade || '',
            feedback: submission.feedback || ''
        });
    };

    const submitGrade = async () => {
        try {
            await ApiService.gradeAssignment(
                gradingSubmission.id,
                parseFloat(gradeForm.grade),
                gradeForm.feedback
            );
            
            // Refresh submissions
            const response = await ApiService.getAssignmentSubmissions(selectedAssignment.id);
            setSubmissions(response.submissions || []);
            setGradingSubmission(null);
            setGradeForm({ grade: '', feedback: '' });
            
            // Refresh assignments to update graded count
            fetchAssignments();
        } catch (error) {
            console.error('Error grading assignment:', error);
            setError('Failed to grade assignment');
        }
    };

    if (loading) return <div className="text-center py-8">Loading assignments...</div>;
    if (error) return <div className="text-red-500 py-8">{error}</div>;

    return (
        <div>
            {!showSubmissions ? (
                <>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-[#200e4a]">Class Assignments</h2>
                    </div>
                    
                    {assignments.length > 0 ? (
                        <div className="space-y-4">
                            {assignments.map(assignment => (
                                <div key={assignment.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-medium text-[#461fa3] mb-2">{assignment.title}</h3>
                                            <p className="text-gray-600 mb-3">{assignment.description}</p>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                <div>
                                                    <span className="font-medium text-gray-700">Due Date:</span>
                                                    <p className="text-gray-600">{new Date(assignment.due_date).toLocaleDateString()}</p>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-700">Points:</span>
                                                    <p className="text-gray-600">{assignment.points}</p>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-700">Submissions:</span>
                                                    <p className="text-gray-600">{assignment.total_submissions}/{assignment.total_students} ({assignment.submission_rate}%)</p>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-700">Graded:</span>
                                                    <p className="text-gray-600">{assignment.graded_submissions}/{assignment.total_submissions}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <button
                                                onClick={() => handleViewSubmissions(assignment)}
                                                className="px-4 py-2 bg-[#461fa3] text-white rounded-md hover:bg-[#7646eb] transition-colors"
                                            >
                                                View Submissions
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">No assignments created yet.</p>
                            <p className="text-gray-400 mt-2">Create your first assignment using the "Create Assignment" button.</p>
                        </div>
                    )}
                </>
            ) : (
                <>
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <button
                                onClick={() => setShowSubmissions(false)}
                                className="text-[#461fa3] hover:text-[#7646eb] mb-2"
                            >
                                ← Back to Assignments
                            </button>
                            <h2 className="text-xl font-semibold text-[#200e4a]">
                                Submissions for "{selectedAssignment?.title}"
                            </h2>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {submissions.map(submission => (
                            <div key={submission.id} className="bg-white border border-gray-200 rounded-lg p-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h3 className="font-medium text-[#461fa3] mb-2">{submission.student_name}</h3>
                                        <p className="text-sm text-gray-500 mb-3">
                                            Submitted: {new Date(submission.submission_date).toLocaleString()}
                                        </p>
                                        
                                        {submission.submission_text && (
                                            <div className="mb-3">
                                                <span className="font-medium text-gray-700">Text Submission:</span>
                                                <div className="mt-1 p-3 bg-gray-50 rounded border">
                                                    <p className="text-gray-800 whitespace-pre-wrap">{submission.submission_text}</p>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {submission.submission_file && (
                                            <div className="mb-3">
                                                <span className="font-medium text-gray-700">File Submission:</span>
                                                <div className="mt-1">
                                                    <a 
                                                        href={`${ApiService.API_URL.replace('/endpoints', '')}/uploads/${submission.submission_file}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[#461fa3] hover:text-[#7646eb] underline"
                                                    >
                                                        Download File
                                                    </a>
                                                </div>
                                            </div>
                                        )}

                                        {submission.grade !== null && (
                                            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="font-medium text-green-800">Grade: {submission.grade}</span>
                                                    <span className="text-sm text-green-600">
                                                        Graded by {submission.graded_by_name} on {new Date(submission.graded_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                {submission.feedback && (
                                                    <p className="text-green-700 whitespace-pre-wrap">{submission.feedback}</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="ml-4">
                                        <button
                                            onClick={() => handleGradeSubmission(submission)}
                                            className={`px-4 py-2 rounded-md transition-colors ${
                                                submission.grade !== null
                                                    ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                                                    : 'bg-[#461fa3] text-white hover:bg-[#7646eb]'
                                            }`}
                                        >
                                            {submission.grade !== null ? 'Update Grade' : 'Grade'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Grading Modal */}
            {gradingSubmission && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
                    <div className="bg-white rounded-xl p-6 max-w-lg w-full">
                        <h2 className="text-2xl font-bold text-[#200e4a] mb-4">
                            Grade Submission - {gradingSubmission.student_name}
                        </h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Grade</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    value={gradeForm.grade}
                                    onChange={(e) => setGradeForm(prev => ({ ...prev, grade: e.target.value }))}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
                                    placeholder="Enter grade (0-100)"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Feedback</label>
                                <textarea
                                    value={gradeForm.feedback}
                                    onChange={(e) => setGradeForm(prev => ({ ...prev, feedback: e.target.value }))}
                                    rows={4}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
                                    placeholder="Provide feedback for the student..."
                                />
                            </div>
                            
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setGradingSubmission(null)}
                                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={submitGrade}
                                    disabled={!gradeForm.grade}
                                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#461fa3] hover:bg-[#7646eb] disabled:opacity-50"
                                >
                                    Submit Grade
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssignmentsView;
