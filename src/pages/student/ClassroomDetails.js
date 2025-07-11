
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ClassRating from '../../components/student/ClassRating';
import { useParams } from 'react-router-dom';
import { ClassroomApi } from '../../api/classroom';
import UploadUtils from '../../utils/uploadUtils';
import ClassroomOverviewTab from '../../components/student/ClassroomOverviewTab';
import ClassroomMaterialsTab from '../../components/student/ClassroomMaterialsTab';
import ClassroomAssignmentsTab from '../../components/student/ClassroomAssignmentsTab';
import ClassroomDiscussionsTab from '../../components/student/ClassroomDiscussionsTab';


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
      const response = await ClassroomApi.getClassroomDetails(id);
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
        const response = await ClassroomApi.getClassroomSessions(id);
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
          const response = await ClassroomApi.getClassroomMaterials(id);
          setMaterials(response.materials || []);
        } else if (activeTab === 'assignments') {
          const response = await ClassroomApi.getClassroomAssignments(id);
          setAssignments(response.assignments || []);
        } else if (activeTab === 'discussions') {
          const response = await ClassroomApi.getClassroomDiscussions(id);
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

  // Assignment submission handler (no direct DOM queries)
  const handleSubmitAssignment = useCallback(async (assignmentId) => {
    if (!submissionFile && !submissionText) {
      setSubmitError('Please provide a file or text submission');
      return;
    }
    setSubmitting(true);
    setSubmitSuccess(false);
    setSubmitError(null);
    try {
      await ClassroomApi.submitAssignment(assignmentId, {
        classroom_id: id,
        submission_text: submissionText,
        ...(submissionFile ? { submission_file: submissionFile } : {})
      });
      setSubmitSuccess(true);
      setSubmissionFile(null);
      setSubmissionText('');
      // Refresh assignments to show updated status
      const response = await ClassroomApi.getClassroomAssignments(id);
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
      await ClassroomApi.postClassroomDiscussion(id, { message: newDiscussion });
      // Refresh discussions
      const response = await ClassroomApi.getClassroomDiscussions(id);
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
                {activeTab === 'overview' && (
                  <ClassroomOverviewTab classroom={classroom} />
                )}
                {activeTab === 'materials' && (
                  <ClassroomMaterialsTab materials={materials} handleOpenMaterial={handleOpenMaterial} />
                )}
                {activeTab === 'assignments' && (
                  <ClassroomAssignmentsTab
                    assignments={assignments}
                    handleFileChange={handleFileChange}
                    submissionText={submissionText}
                    setSubmissionText={setSubmissionText}
                    handleSubmitAssignment={handleSubmitAssignment}
                    submitting={submitting}
                    submitError={submitError}
                    submitSuccess={submitSuccess}
                    submissionFile={submissionFile}
                  />
                )}
                {activeTab === 'discussions' && (
                  <ClassroomDiscussionsTab
                    discussions={discussions}
                    newDiscussion={newDiscussion}
                    handleDiscussionInput={handleDiscussionInput}
                    handlePostDiscussion={handlePostDiscussion}
                    submitting={submitting}
                  />
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