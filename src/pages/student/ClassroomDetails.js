
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { formatSchedule } from '../../utils/formatSchedule';
import ClassRating from '../../components/student/ClassRating';
import { useParams } from 'react-router-dom';
import { ClassroomApi } from '../../api/classroom';
import UploadUtils from '../../utils/uploadUtils';
import ClassroomOverviewTab from '../../components/student/ClassroomOverviewTab';
import ClassroomMaterialsTab from '../../components/student/ClassroomMaterialsTab';
import ClassroomAssignmentsTab from '../../components/student/ClassroomAssignmentsTab';
import ClassroomDiscussionsTab from '../../components/student/ClassroomDiscussionsTab';



// Loading spinner (accessible, reusable, visually beautiful)
const LoadingSpinner = React.memo(() => (
  <div className="flex items-center justify-center min-h-[60vh] bg-background-light" role="status" aria-live="polite">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-14 w-14 border-4 border-accent border-t-transparent shadow-lg" aria-label="Loading"></div>
      <p className="text-accent font-semibold text-lg tracking-wide">Loading classroom...</p>
    </div>
  </div>
));

// Error state (accessible, reusable, visually beautiful)
const ErrorState = React.memo(({ error }) => (
  <div className="flex items-center justify-center min-h-[60vh] bg-background-light" role="alert" aria-live="assertive">
    <div className="text-center">
      <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl shadow-md mb-4 font-semibold text-lg">
        {error}
      </div>
    </div>
  </div>
));

// Status badge (memoized, beautiful, accessible)
const StatusBadge = React.memo(({ status }) => {
  let badgeClass = 'bg-gray-light text-gray-dark';
  let label = status;
  if (status === 'active') {
    badgeClass = 'bg-green-100 text-green-800 border border-green-300';
    label = 'Active';
  } else if (status === 'upcoming') {
    badgeClass = 'bg-blue-100 text-blue-800 border border-blue-300';
    label = 'Upcoming';
  } else if (status === 'completed') {
    badgeClass = 'bg-gray-200 text-gray-700 border border-gray-300';
    label = 'Completed';
  }
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${badgeClass}`}>{label}</span>
  );
});

// Tab navigation (memoized, responsive, beautiful)
const TabNav = React.memo(({ activeTab, onTabChange }) => {
  const tabs = useMemo(() => [
    { key: 'overview', label: 'Overview' },
    { key: 'materials', label: 'Materials' },
    { key: 'assignments', label: 'Assignments' },
    { key: 'discussions', label: 'Discussions' },
  ], []);
  return (
    <nav className="flex flex-wrap gap-2 sm:gap-0 border-b bg-background-light" role="tablist">
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`px-4 sm:px-6 py-3 text-sm font-semibold transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-t-md
            ${activeTab === tab.key
              ? 'text-accent border-b-2 border-accent bg-white shadow-sm'
              : 'text-gray-dark hover:text-accent hover:bg-gray-light'}
          `}
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
    <div className="min-h-screen bg-background-light px-2 sm:px-4 md:px-8 py-6 flex flex-col">
      <div className="w-full max-w-5xl mx-auto flex-1 flex flex-col gap-6">
        {classroom && (
          <>
            {/* Header Card */}
            <section className="bg-white/90 dark:bg-background-dark rounded-2xl shadow-lg p-4 sm:p-6 mb-2 flex flex-col gap-2 sm:gap-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-1 tracking-tight leading-tight">{classroom.name}</h1>
              <p className="text-gray-dark text-base mb-2 max-w-2xl">{classroom.description}</p>
              <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-dark gap-2 sm:gap-6">
                <span className="flex items-center gap-1"><span className="font-semibold">Teacher:</span> {classroom.teacher_name}</span>
                <span className="flex items-center gap-1"><span className="font-semibold">Schedule:</span> {formatSchedule(classroom.schedule)}</span>
                <StatusBadge status={classroom.status} />
              </div>
            </section>

            {/* Session Rating Card */}
            <section className="bg-white/90 dark:bg-background-dark rounded-2xl shadow-md p-4 sm:p-6 mb-2 flex flex-col gap-2">
              <h2 className="text-lg font-semibold text-primary mb-2">Session Feedback</h2>
              {sessions.length > 0 ? (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <label className="block font-medium text-gray-dark" htmlFor="session-select">Select Session to Rate:</label>
                  <select
                    id="session-select"
                    value={selectedSessionId || ''}
                    onChange={e => setSelectedSessionId(Number(e.target.value))}
                    className="mb-2 sm:mb-0 p-2 border border-gray-light rounded-lg focus:ring-2 focus:ring-accent focus:outline-none transition"
                  >
                    {sessions.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.title} ({new Date(s.date_time).toLocaleString()})
                      </option>
                    ))}
                  </select>
                  {selectedSessionId && (
                    <div className="flex-1 min-w-[180px]">
                      <ClassRating classId={selectedSessionId} />
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-500 italic">No ended sessions available for rating yet.</div>
              )}
            </section>

            {/* Main Content Card with Tabs */}
            <section className="bg-white/95 dark:bg-background-dark rounded-2xl shadow-lg overflow-hidden flex flex-col">
              <TabNav activeTab={activeTab} onTabChange={handleTabChange} />
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
            </section>
          </>
        )}
      </div>
    </div>
  );
});

export default ClassroomDetails;