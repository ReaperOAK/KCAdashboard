
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ApiService from '../../utils/api';
import ClassroomCalendar from '../../components/classroom/ClassroomCalendar';
import AttendanceModal from '../../components/classroom/AttendanceModal';
import MaterialsView from '../../components/classroom/MaterialsView';
import AssignmentsView from '../../components/classroom/AssignmentsView';

// --- Loading Skeleton ---
const LoadingSkeleton = React.memo(() => (
  <div className="animate-pulse text-center py-8" role="status" aria-busy="true">
    <div className="h-6 bg-gray-light rounded w-1/3 mx-auto mb-4" />
    <div className="h-4 bg-gray-light rounded w-1/2 mx-auto" />
  </div>
));

// --- Error Alert ---
const ErrorAlert = React.memo(({ message, onClose }) => (
  <div className="bg-red-700 border border-red-800 text-white rounded-lg px-4 py-3 flex items-center justify-between mb-4" role="alert" aria-live="assertive">
    <span>{message}</span>
    {onClose && (
      <button onClick={onClose} aria-label="Dismiss error" className="ml-4 text-white hover:text-gray-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-800 rounded">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    )}
  </div>
));

// --- Classroom Card ---
const ClassroomCard = React.memo(({ classroom, onSchedule, onAssignment, onMaterials }) => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden" tabIndex={0} aria-label={`Classroom: ${classroom.name}`}>
    <div className="p-6">
      <h3 className="text-xl font-semibold text-secondary mb-2">{classroom.name}</h3>
      <p className="text-gray-600 mb-4">{classroom.description}</p>
      <div className="text-sm text-gray-500">
        <p><span className="font-semibold">Students:</span> {classroom.student_count}</p>
        <p><span className="font-semibold">Next Class:</span> {classroom.next_session || 'Not scheduled'}</p>
      </div>
    </div>
    <div className="px-6 py-4 bg-gray-50 border-t flex flex-wrap gap-2 justify-between">
      <button
        type="button"
        onClick={onSchedule}
        className="text-secondary hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent rounded px-2 py-1"
        aria-label={`Schedule class for ${classroom.name}`}
      >
        Schedule Class
      </button>
      <button
        type="button"
        onClick={onAssignment}
        className="text-secondary hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent rounded px-2 py-1"
        aria-label={`Create assignment for ${classroom.name}`}
      >
        Create Assignment
      </button>
      <button
        type="button"
        onClick={onMaterials}
        className="text-secondary hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent rounded px-2 py-1"
        aria-label={`Add materials for ${classroom.name}`}
      >
        Add Materials
      </button>
    </div>
  </div>
));

// --- View Switcher ---
const ViewSwitcher = React.memo(({ currentView, onSwitch }) => {
  const views = useMemo(() => [
    { key: 'calendar', label: 'Calendar' },
    { key: 'materials', label: 'Materials' },
    { key: 'assignments', label: 'Assignments' },
  ], []);
  return (
    <nav aria-label="Classroom views" className="flex space-x-2">
      {views.map(view => (
        <button
          key={view.key}
          type="button"
          className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-accent transition-colors ${currentView === view.key ? 'bg-secondary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          aria-current={currentView === view.key ? 'page' : undefined}
          onClick={() => onSwitch(view.key)}
        >
          {view.label}
        </button>
      ))}
    </nav>
  );
});


// --- Main Component ---
function ClassroomManagement() {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showMaterialsModal, setShowMaterialsModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [currentView, setCurrentView] = useState('calendar');
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // --- Forms ---
  const [scheduleForm, setScheduleForm] = useState({
    title: '',
    date: '',
    time: '',
    duration: 60,
    type: 'offline',
    meeting_link: '',
    description: '',
  });
  const [materialForm, setMaterialForm] = useState({
    title: '',
    type: 'document',
    content: '',
    file: null,
  });
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    instructions: '',
    due_date: '',
    points: 100,
    assignment_type: 'both',
  });

  // --- Handlers (memoized) ---
  const handleScheduleChange = useCallback((e) => {
    const { name, value } = e.target;
    setScheduleForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleAssignmentChange = useCallback((e) => {
    const { name, value } = e.target;
    setAssignmentForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleMaterialChange = useCallback((e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setMaterialForm((prev) => ({ ...prev, file: files[0] }));
    } else {
      setMaterialForm((prev) => ({ ...prev, [name]: value }));
    }
  }, []);

  const fetchClassrooms = useCallback(async () => {
    try {
      setLoading(true);
      const response = await ApiService.get('/classroom/get-teacher-classes.php');
      setClassrooms(response.classes);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch classrooms');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClassrooms();
  }, [fetchClassrooms]);

  const handleScheduleSubmit = useCallback(async (e) => {
    e.preventDefault();
    try {
      await ApiService.post('/classroom/add-session.php', {
        classroom_id: selectedClass.id,
        ...scheduleForm,
      });
      setShowScheduleModal(false);
      setRefreshTrigger((prev) => prev + 1);
      fetchClassrooms();
    } catch (err) {
      setError('Failed to schedule class');
    }
  }, [selectedClass, scheduleForm, fetchClassrooms]);

  const handleAssignmentSubmit = useCallback(async (e) => {
    e.preventDefault();
    try {
      const response = await ApiService.createAssignment({
        classroom_id: selectedClass.id,
        ...assignmentForm,
      });
      if (response.success) {
        setShowAssignmentModal(false);
        setRefreshTrigger((prev) => prev + 1);
        setAssignmentForm({
          title: '',
          description: '',
          instructions: '',
          due_date: '',
          points: 100,
          assignment_type: 'both',
        });
        // Use a toast/snackbar in real app
        window.alert('Assignment created successfully!');
      } else {
        setError(response.message || 'Failed to create assignment');
      }
    } catch (err) {
      setError('Failed to create assignment: ' + err.message);
    }
  }, [selectedClass, assignmentForm]);

  const handleMaterialSubmit = useCallback(async (e) => {
    e.preventDefault();
    try {
      const formData = new window.FormData();
      formData.append('classroom_id', selectedClass.id);
      formData.append('title', materialForm.title);
      formData.append('type', materialForm.type);
      formData.append('content', materialForm.content);
      if (materialForm.file) {
        formData.append('file', materialForm.file);
      }
      const response = await ApiService.postFormData('/classroom/add-material.php', formData);
      if (response.success) {
        setShowMaterialsModal(false);
        setRefreshTrigger((prev) => prev + 1);
        setMaterialForm({ title: '', type: 'document', content: '', file: null });
        window.alert('Material uploaded successfully!');
      } else {
        setError(response.message || 'Failed to upload material');
      }
    } catch (err) {
      setError('Failed to upload material: ' + err.message);
    }
  }, [selectedClass, materialForm]);

  const handleEventClick = useCallback((eventData) => {
    setSelectedSession(eventData);
    setShowAttendanceModal(true);
  }, []);

  const handleAttendanceSubmitted = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // --- Modal close handlers (memoized) ---
  const handleCloseError = useCallback(() => setError(null), []);
  const handleCloseScheduleModal = useCallback(() => setShowScheduleModal(false), []);
  const handleCloseMaterialsModal = useCallback(() => setShowMaterialsModal(false), []);
  const handleCloseAssignmentModal = useCallback(() => setShowAssignmentModal(false), []);

  // --- Render ---
  return (
    <div className="min-h-screen bg-background-light">
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary">Classroom Management</h1>
        </div>

        {loading ? (
          <LoadingSkeleton />
        ) : error ? (
          <ErrorAlert message={error} onClose={handleCloseError} />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {classrooms.map((classroom) => (
                <ClassroomCard
                  key={classroom.id}
                  classroom={classroom}
                  onSchedule={() => {
                    setSelectedClass(classroom);
                    setShowScheduleModal(true);
                  }}
                  onAssignment={() => {
                    setSelectedClass(classroom);
                    setShowAssignmentModal(true);
                  }}
                  onMaterials={() => {
                    setSelectedClass(classroom);
                    setShowMaterialsModal(true);
                  }}
                />
              ))}
            </div>

            {selectedClass && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
                  <h2 className="text-2xl font-bold text-primary">{selectedClass.name}</h2>
                  <ViewSwitcher currentView={currentView} onSwitch={setCurrentView} />
                </div>
                {currentView === 'calendar' && (
                  <ClassroomCalendar
                    classroomId={selectedClass.id}
                    onEventClick={handleEventClick}
                    refreshTrigger={refreshTrigger}
                  />
                )}
                {currentView === 'materials' && (
                  <MaterialsView
                    classroomId={selectedClass.id}
                    refreshTrigger={refreshTrigger}
                  />
                )}
                {currentView === 'assignments' && (
                  <AssignmentsView
                    classroomId={selectedClass.id}
                    refreshTrigger={refreshTrigger}
                  />
                )}
              </div>
            )}

            {!selectedClass && classrooms.length > 0 && (
              <div className="text-center p-8 bg-white rounded-xl shadow-lg">
                <p className="text-lg text-gray-600">
                  Select a classroom to view its calendar and materials.
                </p>
              </div>
            )}
          </>
        )}

        {/* Schedule Modal */}
        {showScheduleModal && (
          <ModalOverlay onClose={handleCloseScheduleModal}>
            <div className="bg-white rounded-xl p-6 max-w-lg w-full" role="dialog" aria-modal="true" aria-labelledby="schedule-modal-title">
              <h2 id="schedule-modal-title" className="text-2xl font-bold text-primary mb-4">Schedule Class</h2>
              <form onSubmit={handleScheduleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700" htmlFor="schedule-title">Title</label>
                  <input
                    id="schedule-title"
                    type="text"
                    name="title"
                    value={scheduleForm.title}
                    onChange={handleScheduleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700" htmlFor="schedule-date">Date</label>
                    <input
                      id="schedule-date"
                      type="date"
                      name="date"
                      value={scheduleForm.date}
                      onChange={handleScheduleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700" htmlFor="schedule-time">Time</label>
                    <input
                      id="schedule-time"
                      type="time"
                      name="time"
                      value={scheduleForm.time}
                      onChange={handleScheduleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700" htmlFor="schedule-duration">Duration (minutes)</label>
                    <input
                      id="schedule-duration"
                      type="number"
                      name="duration"
                      value={scheduleForm.duration}
                      onChange={handleScheduleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700" htmlFor="schedule-type">Type</label>
                    <select
                      id="schedule-type"
                      name="type"
                      value={scheduleForm.type}
                      onChange={handleScheduleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary"
                    >
                      <option value="offline">Offline</option>
                      <option value="online">Online</option>
                    </select>
                  </div>
                </div>
                {scheduleForm.type === 'online' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700" htmlFor="schedule-link">Meeting Link</label>
                    <input
                      id="schedule-link"
                      type="url"
                      name="meeting_link"
                      value={scheduleForm.meeting_link}
                      onChange={handleScheduleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700" htmlFor="schedule-description">Description</label>
                  <textarea
                    id="schedule-description"
                    name="description"
                    value={scheduleForm.description}
                    onChange={handleScheduleChange}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseScheduleModal}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    Schedule
                  </button>
                </div>
              </form>
            </div>
          </ModalOverlay>
        )}

        {/* Materials Modal */}
        {showMaterialsModal && (
          <ModalOverlay onClose={handleCloseMaterialsModal}>
            <div className="bg-white rounded-xl p-6 max-w-lg w-full" role="dialog" aria-modal="true" aria-labelledby="materials-modal-title">
              <h2 id="materials-modal-title" className="text-2xl font-bold text-primary mb-4">Add Study Material</h2>
              <form onSubmit={handleMaterialSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700" htmlFor="material-title">Title</label>
                  <input
                    id="material-title"
                    type="text"
                    name="title"
                    value={materialForm.title}
                    onChange={handleMaterialChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700" htmlFor="material-type">Type</label>
                  <select
                    id="material-type"
                    name="type"
                    value={materialForm.type}
                    onChange={handleMaterialChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary"
                  >
                    <option value="document">Document</option>
                    <option value="video">Video Link</option>
                  </select>
                </div>
                {materialForm.type === 'video' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700" htmlFor="material-content">Video URL</label>
                    <input
                      id="material-content"
                      type="url"
                      name="content"
                      value={materialForm.content}
                      onChange={handleMaterialChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary"
                      required
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700" htmlFor="material-file">Upload File</label>
                    <input
                      id="material-file"
                      type="file"
                      onChange={handleMaterialChange}
                      className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-secondary file:text-white hover:file:bg-accent"
                    />
                  </div>
                )}
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseMaterialsModal}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    Upload
                  </button>
                </div>
              </form>
            </div>
          </ModalOverlay>
        )}

        {/* Assignment Modal */}
        {showAssignmentModal && (
          <ModalOverlay onClose={handleCloseAssignmentModal}>
            <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="assignment-modal-title">
              <h2 id="assignment-modal-title" className="text-2xl font-bold text-primary mb-4">Create Assignment</h2>
              <form onSubmit={handleAssignmentSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700" htmlFor="assignment-title">Assignment Title</label>
                  <input
                    id="assignment-title"
                    type="text"
                    name="title"
                    value={assignmentForm.title}
                    onChange={handleAssignmentChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700" htmlFor="assignment-description">Description</label>
                  <textarea
                    id="assignment-description"
                    name="description"
                    value={assignmentForm.description}
                    onChange={handleAssignmentChange}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary"
                    placeholder="Brief description of the assignment..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700" htmlFor="assignment-instructions">Instructions</label>
                  <textarea
                    id="assignment-instructions"
                    name="instructions"
                    value={assignmentForm.instructions}
                    onChange={handleAssignmentChange}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary"
                    placeholder="Detailed instructions for students..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700" htmlFor="assignment-due-date">Due Date</label>
                    <input
                      id="assignment-due-date"
                      type="datetime-local"
                      name="due_date"
                      value={assignmentForm.due_date}
                      onChange={handleAssignmentChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700" htmlFor="assignment-points">Points</label>
                    <input
                      id="assignment-points"
                      type="number"
                      name="points"
                      value={assignmentForm.points}
                      onChange={handleAssignmentChange}
                      min="1"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700" htmlFor="assignment-type">Submission Type</label>
                  <select
                    id="assignment-type"
                    name="assignment_type"
                    value={assignmentForm.assignment_type}
                    onChange={handleAssignmentChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary"
                  >
                    <option value="both">Text or File Submission</option>
                    <option value="text">Text Only</option>
                    <option value="file">File Only</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseAssignmentModal}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    Create Assignment
                  </button>
                </div>
              </form>
            </div>
          </ModalOverlay>
        )}

        {/* Attendance Modal */}
        {showAttendanceModal && selectedSession && (
          <AttendanceModal
            session={selectedSession}
            onClose={() => setShowAttendanceModal(false)}
            onAttendanceSubmitted={handleAttendanceSubmitted}
          />
        )}
      </div>
    </div>
  );
}

// --- Modal Overlay (for accessibility, focus trap, and escape close) ---
const ModalOverlay = React.memo(function ModalOverlay({ children, onClose }) {
  // Trap focus and close on Escape
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && onClose) onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]" tabIndex={-1} aria-modal="true" role="dialog">
      {children}
    </div>
  );
});

export default ClassroomManagement;
