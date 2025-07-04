
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ClassRating from '../../components/student/ClassRating';
import { useParams } from 'react-router-dom';
import ApiService from '../../utils/api';
import UploadUtils from '../../utils/uploadUtils';


// Loading spinner (accessible, reusable)
const LoadingSpinner = React.memo(() => (
  <div className="flex items-center justify-center min-h-screen bg-background-light" role="status" aria-live="polite">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto mb-4" aria-label="Loading"></div>
      <p className="text-secondary">Loading classroom...</p>
    </div>
  </div>
));

// Error state (accessible, reusable)
const ErrorState = React.memo(({ error }) => (
  <div className="flex items-center justify-center min-h-screen bg-background-light" role="alert" aria-live="assertive">
    <div className="text-center">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
        {error}
      </div>
    </div>
  </div>
));

// Status badge (memoized)
const StatusBadge = React.memo(({ status }) => {
  let badgeClass = 'bg-gray-light text-gray-dark';
  if (status === 'active') badgeClass = 'bg-green-100 text-green-800';
  else if (status === 'upcoming') badgeClass = 'bg-blue-100 text-blue-800';
  return (
    <span className={`px-2 py-1 rounded-full text-xs ${badgeClass}`}>{status}</span>
  );
});

// Tab navigation (memoized)
const TabNav = React.memo(({ activeTab, onTabChange }) => {
  const tabs = useMemo(() => [
    { key: 'overview', label: 'Overview' },
    { key: 'materials', label: 'Materials' },
    { key: 'assignments', label: 'Assignments' },
    { key: 'discussions', label: 'Discussions' },
  ], []);
  return (
    <nav className="flex" role="tablist">
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`px-6 py-4 text-sm font-medium focus:outline-none focus:underline ${
            activeTab === tab.key
              ? 'text-secondary border-b-2 border-secondary'
              : 'text-gray-dark hover:text-secondary'
          }`}
          role="tab"
          aria-selected={activeTab === tab.key}
          tabIndex={activeTab === tab.key ? 0 : -1}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
});

// ...existing code...

export const ClassroomDetails = React.memo(() => {
  const { id } = useParams();
  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [newDiscussion, setNewDiscussion] = useState('');
  const [submissionFile, setSubmissionFile] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const fetchClassroomDetails = useCallback(async () => {
    try {
      const response = await ApiService.getClassroomDetails(id);
      setClassroom(response.classroom);
      setLoading(false);
    } catch (error) {
      setError(error.message || 'Failed to fetch classroom details');
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchClassroomDetails();
  }, [fetchClassroomDetails]);

  // Fetch sessions for this classroom
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await ApiService.getClassroomSessions(id);
        // Only sessions that have ended
        const now = new Date();
        const endedSessions = (response.sessions || []).filter(s => {
          const end = new Date(s.date_time);
          end.setMinutes(end.getMinutes() + (parseInt(s.duration, 10) || 0));
          return end < now;
        });
        setSessions(endedSessions);
        if (endedSessions.length > 0) {
          setSelectedSessionId(endedSessions[endedSessions.length - 1].id); // default to most recent
        }
      } catch {
        setSessions([]);
      }
    };
    fetchSessions();
  }, [id]);

  useEffect(() => {
    if (!classroom) return;
    const fetchTabContent = async () => {
      try {
        if (activeTab === 'materials') {
          const response = await ApiService.getClassroomMaterials(id);
          setMaterials(response.materials || []);
        } else if (activeTab === 'assignments') {
          const response = await ApiService.getClassroomAssignments(id);
          setAssignments(response.assignments || []);
        } else if (activeTab === 'discussions') {
          const response = await ApiService.getClassroomDiscussions(id);
          setDiscussions(response.discussions || []);
        }
      } catch (error) {
        // Silently fail
      }
    };
    fetchTabContent();
  }, [activeTab, classroom, id]);

  const handleTabChange = useCallback((tab) => setActiveTab(tab), []);

  const handleOpenMaterial = useCallback((material) => {
    if (material.type === 'video') {
      window.open(material.url, '_blank');
    } else {
      if (material.url && (material.url.startsWith('http://') || material.url.startsWith('https://'))) {
        window.open(material.url, '_blank');
      } else {
        window.open(UploadUtils.getMaterialUrl(material.url), '_blank');
      }
    }
  }, []);

  const handleFileChange = useCallback((e) => {
    setSubmissionFile(e.target.files[0]);
  }, []);

  const handleSubmitAssignment = useCallback(async (assignmentId) => {
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
      // Clear the file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
      // Refresh assignments to show updated status
      const response = await ApiService.getClassroomAssignments(id);
      setAssignments(response.assignments || []);
    } catch (error) {
      setSubmitError(error.message || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  }, [submissionFile, submissionText, id]);

  const handleDiscussionInput = useCallback((e) => setNewDiscussion(e.target.value), []);

  const handlePostDiscussion = useCallback(async () => {
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
    } catch {
      // Silently fail
    }
  }, [id, newDiscussion]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState error={error} />;

  return (
    <div className="min-h-screen bg-background-light px-4 sm:px-6 md:px-8 py-8">
      <div className="max-w-5xl mx-auto">
        {classroom && (
          <>
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">{classroom.name}</h1>
              <p className="text-gray-dark mb-4">{classroom.description}</p>
              <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-dark gap-2 sm:gap-4">
                <span><span className="font-semibold">Teacher:</span> {classroom.teacher_name}</span>
                <span><span className="font-semibold">Schedule:</span> {classroom.schedule}</span>
                <StatusBadge status={classroom.status} />
              </div>
            </div>
            {/* Show class rating for ended sessions */}
            <div className="mb-6">
              {sessions.length > 0 ? (
                <>
                  <label className="block mb-2 font-medium">Select Session to Rate:</label>
                  <select
                    value={selectedSessionId || ''}
                    onChange={e => setSelectedSessionId(Number(e.target.value))}
                    className="mb-4 p-2 border rounded"
                  >
                    {sessions.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.title} ({new Date(s.date_time).toLocaleString()})
                      </option>
                    ))}
                  </select>
                  {selectedSessionId && (
                    <ClassRating classId={selectedSessionId} />
                  )}
                </>
              ) : (
                <div>No ended sessions available for rating yet.</div>
              )}
            </div>
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="border-b">
                <TabNav activeTab={activeTab} onTabChange={handleTabChange} />
              </div>
              <div className="p-4 sm:p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div>
                    <h2 className="text-xl font-semibold text-primary mb-4">Class Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-background-light p-4 rounded-lg">
                        <h3 className="font-medium text-secondary mb-2">Schedule</h3>
                        <p>{classroom.schedule}</p>
                      </div>
                      <div className="bg-background-light p-4 rounded-lg">
                        <h3 className="font-medium text-secondary mb-2">About This Class</h3>
                        <p className="text-gray-dark">{classroom.description}</p>
                      </div>
                      <div className="bg-background-light p-4 rounded-lg">
                        <h3 className="font-medium text-secondary mb-2">Instructor</h3>
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold mr-3">
                            {classroom.teacher_name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{classroom.teacher_name}</p>
                            <p className="text-sm text-gray-dark">Chess Instructor</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-background-light p-4 rounded-lg">
                        <h3 className="font-medium text-secondary mb-2">Next Session</h3>
                        <p>{classroom.next_session || 'No upcoming sessions scheduled'}</p>
                      </div>
                    </div>
                  </div>
                )}
                {/* Materials Tab */}
                {activeTab === 'materials' && (
                  <div>
                    <h2 className="text-xl font-semibold text-primary mb-4">Study Materials</h2>
                    {materials.length > 0 ? (
                      <div className="space-y-4">
                        {materials.map(material => (
                          <div
                            key={material.id}
                            className="p-4 border border-gray-light rounded-lg hover:shadow-md transition-shadow"
                          >
                            <div className="flex justify-between">
                              <div>
                                <h3 className="font-medium text-secondary">{material.title}</h3>
                                <p className="text-sm text-gray-dark">{material.description}</p>
                                <p className="text-xs text-gray-dark mt-2">
                                  {material.category} • Uploaded by {material.uploaded_by}
                                </p>
                              </div>
                              <button
                                onClick={() => handleOpenMaterial(material)}
                                className="px-3 py-1 bg-primary text-white rounded-md hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-accent"
                                aria-label={`Open material: ${material.title}`}
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
                {/* Assignments Tab */}
                {activeTab === 'assignments' && (
                  <div>
                    <h2 className="text-xl font-semibold text-primary mb-4">Assignments</h2>
                    {assignments.length > 0 ? (
                      <div className="space-y-6">
                        {assignments.map(assignment => (
                          <div
                            key={assignment.id}
                            className="border border-gray-light rounded-lg overflow-hidden"
                          >
                            <div className={`p-4 ${
                              assignment.status === 'graded' ? 'bg-green-50' :
                              assignment.status === 'submitted' ? 'bg-blue-50' :
                              new Date(assignment.due_date) < new Date() ? 'bg-red-50' : 'bg-white'
                            }`}>
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-medium text-secondary">{assignment.title}</h3>
                                  <p className="text-sm text-gray-dark mt-1">{assignment.description}</p>
                                  <div className="flex items-center mt-2 text-xs text-gray-dark">
                                    <span className="mr-3">Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
                                    <span className={`px-2 py-1 rounded-full ${
                                      assignment.status === 'graded' ? 'bg-green-100 text-green-800' :
                                      assignment.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                                      new Date(assignment.due_date) < new Date() ? 'bg-red-100 text-red-800' :
                                      'bg-gray-light text-gray-dark'
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
                            {/* Graded Assignment */}
                            {assignment.status === 'graded' && (
                              <div className="p-4 border-t border-gray-light bg-white">
                                <h4 className="font-medium text-sm mb-2">Feedback & Grading</h4>
                                <p className="text-sm text-gray-dark mb-2">{assignment.feedback || 'No written feedback provided.'}</p>
                                <p className="font-semibold">Grade: {assignment.grade}</p>
                              </div>
                            )}
                            {/* Pending Assignment Submission */}
                            {assignment.status === 'pending' && new Date(assignment.due_date) >= new Date() && (
                              <div className="p-4 border-t border-gray-light">
                                <h4 className="font-medium text-sm mb-2">Submit Your Work</h4>
                                <div className="space-y-3">
                                  <div>
                                    <label className="block text-sm text-gray-dark">Upload File (optional)</label>
                                    <input
                                      type="file"
                                      onChange={handleFileChange}
                                      className="mt-1 block w-full text-sm text-gray-dark file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-white hover:file:bg-accent focus:outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm text-gray-dark">Text Submission (optional)</label>
                                    <textarea
                                      value={submissionText}
                                      onChange={(e) => setSubmissionText(e.target.value)}
                                      className="mt-1 block w-full rounded-md border-gray-light shadow-sm focus:border-secondary focus:ring focus:ring-secondary focus:ring-opacity-50"
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
                                    className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
                                    aria-label="Submit assignment"
                                  >
                                    {submitting ? 'Submitting...' : 'Submit Assignment'}
                                  </button>
                                </div>
                              </div>
                            )}
                            {/* Submitted Assignment */}
                            {assignment.status === 'submitted' && (
                              <div className="p-4 border-t border-gray-light bg-blue-50">
                                <h4 className="font-medium text-sm mb-2 text-blue-800">Assignment Submitted</h4>
                                <p className="text-sm text-blue-600 mb-2">
                                  Submitted on: {new Date(assignment.submission_date).toLocaleString()}
                                </p>
                                {assignment.submission_text && (
                                  <div className="mb-2">
                                    <span className="font-medium text-blue-700">Your Text Submission:</span>
                                    <div className="mt-1 p-2 bg-white rounded border">
                                      <p className="text-sm text-gray-dark whitespace-pre-wrap">{assignment.submission_text}</p>
                                    </div>
                                  </div>
                                )}
                                {assignment.submission_file && (
                                  <div>
                                    <span className="font-medium text-blue-700">Your File Submission:</span>
                                    <div className="mt-1">
                                      <a
                                        href={UploadUtils.getAssignmentUrl(assignment.submission_file)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 underline text-sm"
                                      >
                                        View Submitted File
                                      </a>
                                    </div>
                                  </div>
                                )}
                                <p className="text-sm text-blue-600 mt-2">Waiting for teacher to grade...</p>
                              </div>
                            )}
                            {/* Graded Assignment (detailed) */}
                            {assignment.status === 'graded' && (
                              <div className="p-4 border-t border-gray-light bg-green-50">
                                <h4 className="font-medium text-sm mb-2 text-green-800">Assignment Graded</h4>
                                <div className="flex justify-between items-center mb-2">
                                  <span className="font-medium text-green-700">Grade: {assignment.grade}</span>
                                  <span className="text-sm text-green-600">
                                    Submitted: {new Date(assignment.submission_date).toLocaleDateString()}
                                  </span>
                                </div>
                                {assignment.feedback && (
                                  <div className="mb-3">
                                    <span className="font-medium text-green-700">Teacher Feedback:</span>
                                    <div className="mt-1 p-3 bg-white rounded border">
                                      <p className="text-sm text-gray-dark whitespace-pre-wrap">{assignment.feedback}</p>
                                    </div>
                                  </div>
                                )}
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
                {/* Discussions Tab */}
                {activeTab === 'discussions' && (
                  <div>
                    <h2 className="text-xl font-semibold text-primary mb-4">Class Discussions</h2>
                    <div className="mb-6">
                      <label className="block text-sm text-gray-dark mb-2">Start a New Discussion</label>
                      <textarea
                        value={newDiscussion}
                        onChange={handleDiscussionInput}
                        className="block w-full rounded-md border-gray-light shadow-sm focus:border-secondary focus:ring focus:ring-secondary focus:ring-opacity-50"
                        rows={3}
                        placeholder="Share your thoughts with the class..."
                        aria-label="New discussion message"
                      />
                      <button
                        onClick={handlePostDiscussion}
                        disabled={!newDiscussion.trim()}
                        className="mt-2 px-4 py-2 bg-secondary text-white rounded-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
                        aria-label="Post discussion"
                      >
                        Post Discussion
                      </button>
                    </div>
                    {discussions.length > 0 ? (
                      <div className="space-y-6">
                        {discussions.map(discussion => (
                          <div key={discussion.id} className="bg-white border border-gray-light rounded-lg overflow-hidden">
                            <div className="p-4">
                              <div className="flex items-start mb-3">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold mr-3">
                                  {discussion.user_name.charAt(0)}
                                </div>
                                <div>
                                  <h3 className="font-medium">
                                    {discussion.user_name}
                                    <span className="text-xs font-normal text-gray-dark ml-2">
                                      {discussion.user_role} • {new Date(discussion.created_at).toLocaleString()}
                                    </span>
                                  </h3>
                                  <p className="text-gray-dark mt-1">{discussion.message}</p>
                                </div>
                              </div>
                            </div>
                            {discussion.replies && discussion.replies.length > 0 && (
                              <div className="bg-background-light p-4 border-t border-gray-light">
                                <h4 className="text-sm font-medium text-gray-dark mb-2">Replies</h4>
                                <div className="space-y-3 pl-6">
                                  {discussion.replies.map(reply => (
                                    <div key={reply.id} className="flex items-start">
                                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-white font-semibold mr-3">
                                        {reply.user_name.charAt(0)}
                                      </div>
                                      <div>
                                        <h3 className="text-sm font-medium">
                                          {reply.user_name}
                                          <span className="text-xs font-normal text-gray-dark ml-2">
                                            {reply.user_role} • {new Date(reply.created_at).toLocaleString()}
                                          </span>
                                        </h3>
                                        <p className="text-sm text-gray-dark mt-1">{reply.message}</p>
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
});

export default ClassroomDetails;