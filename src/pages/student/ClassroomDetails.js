import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import ApiService from '../../utils/api';

const ClassroomDetails = () => {
    const { id } = useParams();
    const [classroom, setClassroom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    
    // New state for tab content
    const [materials, setMaterials] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [discussions, setDiscussions] = useState([]);
    const [newDiscussion, setNewDiscussion] = useState('');
    const [submissionFile, setSubmissionFile] = useState(null);
    const [assignmentId, setAssignmentId] = useState(null);
    const [submissionText, setSubmissionText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState(null);

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
    
    // Fetch tab content when tab changes
    useEffect(() => {
        if (!classroom) return;
        
        const fetchTabContent = async () => {
            try {
                if (activeTab === 'materials') {
                    const response = await ApiService.get(`/classroom/get-materials.php?classroom_id=${id}`);
                    setMaterials(response.materials || []);
                } else if (activeTab === 'assignments') {
                    const response = await ApiService.get(`/classroom/get-assignments.php?classroom_id=${id}`);
                    setAssignments(response.assignments || []);
                } else if (activeTab === 'discussions') {
                    const response = await ApiService.get(`/classroom/get-discussions.php?classroom_id=${id}`);
                    setDiscussions(response.discussions || []);
                }
            } catch (error) {
                console.error(`Error fetching ${activeTab}:`, error);
            }
        };
        
        fetchTabContent();
    }, [activeTab, classroom, id]);

    const handleOpenMaterial = (material) => {
        if (material.type === 'video') {
            window.open(material.url, '_blank');
        } else {
            if (material.url && (material.url.startsWith('http://') || material.url.startsWith('https://'))) {
                window.open(material.url, '_blank');
            } else {
                window.open(`${ApiService.API_URL.replace('/endpoints', '')}/uploads/${material.url}`, '_blank');
            }
        }
    };
    
    const handleFileChange = (e) => {
        setSubmissionFile(e.target.files[0]);
    };
    
    const handleSubmitAssignment = async (assignmentId) => {
        if (!submissionFile && !submissionText) {
            setSubmitError('Please provide a file or text submission');
            return;
        }
        
        setSubmitting(true);
        setSubmitSuccess(false);
        setSubmitError(null);
        
        const formData = new FormData();
        if (submissionFile) {
            formData.append('submission_file', submissionFile);
        }
        formData.append('assignment_id', assignmentId);
        formData.append('classroom_id', id);
        formData.append('submission_text', submissionText);
        
        try {
            await ApiService.postFormData('/classroom/submit-assignment.php', formData);
            setSubmitSuccess(true);
            setSubmissionFile(null);
            setSubmissionText('');
            
            // Refresh assignments to show updated status
            const response = await ApiService.get(`/classroom/get-assignments.php?classroom_id=${id}`);
            setAssignments(response.assignments || []);
        } catch (error) {
            setSubmitError(error.message || 'Failed to submit assignment');
        } finally {
            setSubmitting(false);
        }
    };
    
    const handlePostDiscussion = async () => {
        if (!newDiscussion.trim()) return;
        
        try {
            await ApiService.post('/classroom/post-discussion.php', {
                classroom_id: id,
                message: newDiscussion
            });
            
            // Refresh discussions
            const response = await ApiService.get(`/classroom/get-discussions.php?classroom_id=${id}`);
            setDiscussions(response.discussions || []);
            setNewDiscussion('');
        } catch (error) {
            console.error('Failed to post discussion:', error);
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
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="bg-[#f3f1f9] p-4 rounded-lg">
                                                <h3 className="font-medium text-[#461fa3] mb-2">Schedule</h3>
                                                <p>{classroom.schedule}</p>
                                            </div>
                                            <div className="bg-[#f3f1f9] p-4 rounded-lg">
                                                <h3 className="font-medium text-[#461fa3] mb-2">About This Class</h3>
                                                <p className="text-gray-600">{classroom.description}</p>
                                            </div>
                                            <div className="bg-[#f3f1f9] p-4 rounded-lg">
                                                <h3 className="font-medium text-[#461fa3] mb-2">Instructor</h3>
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 rounded-full bg-[#200e4a] flex items-center justify-center text-white font-semibold mr-3">
                                                        {classroom.teacher_name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{classroom.teacher_name}</p>
                                                        <p className="text-sm text-gray-500">Chess Instructor</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bg-[#f3f1f9] p-4 rounded-lg">
                                                <h3 className="font-medium text-[#461fa3] mb-2">Next Session</h3>
                                                <p>{classroom.next_session || "No upcoming sessions scheduled"}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                {activeTab === 'materials' && (
                                    <div>
                                        <h2 className="text-xl font-semibold text-[#200e4a] mb-4">Study Materials</h2>
                                        {materials.length > 0 ? (
                                            <div className="space-y-4">
                                                {materials.map(material => (
                                                    <div 
                                                        key={material.id}
                                                        className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                                                    >
                                                        <div className="flex justify-between">
                                                            <div>
                                                                <h3 className="font-medium text-[#461fa3]">{material.title}</h3>
                                                                <p className="text-sm text-gray-600">{material.description}</p>
                                                                <p className="text-xs text-gray-500 mt-2">
                                                                    {material.category} • Uploaded by {material.uploaded_by}
                                                                </p>
                                                            </div>
                                                            <button
                                                                onClick={() => handleOpenMaterial(material)}
                                                                className="px-3 py-1 bg-[#200e4a] text-white rounded-md hover:bg-[#461fa3]"
                                                            >
                                                                Open
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p>No materials have been shared for this class yet.</p>
                                        )}
                                    </div>
                                )}
                                
                                {activeTab === 'assignments' && (
                                    <div>
                                        <h2 className="text-xl font-semibold text-[#200e4a] mb-4">Assignments</h2>
                                        {assignments.length > 0 ? (
                                            <div className="space-y-6">
                                                {assignments.map(assignment => (
                                                    <div 
                                                        key={assignment.id}
                                                        className="border border-gray-200 rounded-lg overflow-hidden"
                                                    >
                                                        <div className={`p-4 ${
                                                            assignment.status === 'graded' ? 'bg-green-50' : 
                                                            assignment.status === 'submitted' ? 'bg-blue-50' : 
                                                            new Date(assignment.due_date) < new Date() ? 'bg-red-50' : 'bg-white'
                                                        }`}>
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <h3 className="font-medium text-[#461fa3]">{assignment.title}</h3>
                                                                    <p className="text-sm text-gray-600 mt-1">{assignment.description}</p>
                                                                    <div className="flex items-center mt-2 text-xs text-gray-500">
                                                                        <span className="mr-3">Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
                                                                        <span className={`px-2 py-1 rounded-full ${
                                                                            assignment.status === 'graded' ? 'bg-green-100 text-green-800' :
                                                                            assignment.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                                                                            new Date(assignment.due_date) < new Date() ? 'bg-red-100 text-red-800' :
                                                                            'bg-gray-100 text-gray-800'
                                                                        }`}>
                                                                            {assignment.status === 'graded' ? 'Graded' : 
                                                                            assignment.status === 'submitted' ? 'Submitted' :
                                                                            new Date(assignment.due_date) < new Date() ? 'Overdue' :
                                                                            'Pending'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        {assignment.status === 'graded' && (
                                                            <div className="p-4 border-t border-gray-200 bg-white">
                                                                <h4 className="font-medium text-sm mb-2">Feedback & Grading</h4>
                                                                <p className="text-sm text-gray-600 mb-2">{assignment.feedback || "No written feedback provided."}</p>
                                                                <p className="font-semibold">Grade: {assignment.grade}</p>
                                                            </div>
                                                        )}
                                                        
                                                        {assignment.status === 'pending' && (
                                                            <div className="p-4 border-t border-gray-200">
                                                                <h4 className="font-medium text-sm mb-2">Submit Your Work</h4>
                                                                <div className="space-y-3">
                                                                    <div>
                                                                        <label className="block text-sm text-gray-700">Upload File (optional)</label>
                                                                        <input
                                                                            type="file"
                                                                            onChange={handleFileChange}
                                                                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#461fa3] file:text-white hover:file:bg-[#7646eb]"
                                                                        />
                                                                    </div>
                                                                    
                                                                    <div>
                                                                        <label className="block text-sm text-gray-700">Text Submission (optional)</label>
                                                                        <textarea
                                                                            value={submissionText}
                                                                            onChange={(e) => setSubmissionText(e.target.value)}
                                                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring focus:ring-[#461fa3] focus:ring-opacity-50"
                                                                            rows={4}
                                                                            placeholder="Type your answer here..."
                                                                        />
                                                                    </div>
                                                                    
                                                                    {submitError && (
                                                                        <div className="text-sm text-red-600">{submitError}</div>
                                                                    )}
                                                                    
                                                                    {submitSuccess && (
                                                                        <div className="text-sm text-green-600">Assignment submitted successfully!</div>
                                                                    )}
                                                                    
                                                                    <button
                                                                        onClick={() => handleSubmitAssignment(assignment.id)}
                                                                        disabled={submitting}
                                                                        className="px-4 py-2 bg-[#461fa3] text-white rounded-md hover:bg-[#7646eb] disabled:opacity-50"
                                                                    >
                                                                        {submitting ? 'Submitting...' : 'Submit Assignment'}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p>No assignments have been given for this class yet.</p>
                                        )}
                                    </div>
                                )}
                                
                                {activeTab === 'discussions' && (
                                    <div>
                                        <h2 className="text-xl font-semibold text-[#200e4a] mb-4">Class Discussions</h2>
                                        
                                        <div className="mb-6">
                                            <label className="block text-sm text-gray-700 mb-2">Start a New Discussion</label>
                                            <textarea
                                                value={newDiscussion}
                                                onChange={(e) => setNewDiscussion(e.target.value)}
                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring focus:ring-[#461fa3] focus:ring-opacity-50"
                                                rows={3}
                                                placeholder="Share your thoughts with the class..."
                                            />
                                            <button
                                                onClick={handlePostDiscussion}
                                                disabled={!newDiscussion.trim()}
                                                className="mt-2 px-4 py-2 bg-[#461fa3] text-white rounded-md hover:bg-[#7646eb] disabled:opacity-50"
                                            >
                                                Post Discussion
                                            </button>
                                        </div>
                                        
                                        {discussions.length > 0 ? (
                                            <div className="space-y-6">
                                                {discussions.map(discussion => (
                                                    <div key={discussion.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                                        <div className="p-4">
                                                            <div className="flex items-start mb-3">
                                                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#200e4a] flex items-center justify-center text-white font-semibold mr-3">
                                                                    {discussion.user_name.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <h3 className="font-medium">
                                                                        {discussion.user_name}
                                                                        <span className="text-xs font-normal text-gray-500 ml-2">
                                                                            {discussion.user_role} • {new Date(discussion.created_at).toLocaleString()}
                                                                        </span>
                                                                    </h3>
                                                                    <p className="text-gray-800 mt-1">{discussion.message}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        {discussion.replies && discussion.replies.length > 0 && (
                                                            <div className="bg-gray-50 p-4 border-t border-gray-200">
                                                                <h4 className="text-sm font-medium text-gray-700 mb-2">Replies</h4>
                                                                <div className="space-y-3 pl-6">
                                                                    {discussion.replies.map(reply => (
                                                                        <div key={reply.id} className="flex items-start">
                                                                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-[#461fa3] flex items-center justify-center text-white font-semibold mr-3">
                                                                                {reply.user_name.charAt(0)}
                                                                            </div>
                                                                            <div>
                                                                                <h3 className="text-sm font-medium">
                                                                                    {reply.user_name}
                                                                                    <span className="text-xs font-normal text-gray-500 ml-2">
                                                                                        {reply.user_role} • {new Date(reply.created_at).toLocaleString()}
                                                                                    </span>
                                                                                </h3>
                                                                                <p className="text-sm text-gray-800 mt-1">{reply.message}</p>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p>No discussions have been started yet. Be the first to post!</p>
                                        )}
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