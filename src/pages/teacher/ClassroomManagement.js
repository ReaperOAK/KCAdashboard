
import React, { useState, useEffect, useCallback } from 'react';
import { ClassroomApi } from '../../api/classroom';
import ClassroomCalendar from '../../components/classroom/ClassroomCalendar';
import AttendanceModal from '../../components/classroom/AttendanceModal';
import MaterialsView from '../../components/classroom/MaterialsView';
import AssignmentsView from '../../components/classroom/AssignmentsView';
import LoadingSkeleton from '../../components/classroom/LoadingSkeleton';
import ErrorAlert from '../../components/classroom/ErrorAlert';
import ClassroomCard from '../../components/classroom/ClassroomCard';
import ViewSwitcher from '../../components/classroom/ViewSwitcher';
import ModalOverlay from '../../components/classroom/ModalOverlay';


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
    content: [''], // array of links
    files: [], // array of files
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
      setMaterialForm((prev) => ({ ...prev, files: Array.from(files) }));
    } else if (name === 'content') {
      setMaterialForm((prev) => {
        const idx = parseInt(e.target.dataset.idx || '0', 10);
        const newContent = [...prev.content];
        newContent[idx] = value;
        return { ...prev, content: newContent };
      });
    } else {
      setMaterialForm((prev) => ({ ...prev, [name]: value }));
    }
  }, []);

  // Add/remove video link fields
  const handleAddLinkField = useCallback(() => {
    setMaterialForm((prev) => ({ ...prev, content: [...prev.content, ''] }));
  }, []);
  const handleRemoveLinkField = useCallback((idx) => {
    setMaterialForm((prev) => {
      const newContent = prev.content.filter((_, i) => i !== idx);
      return { ...prev, content: newContent.length ? newContent : [''] };
    });
  }, []);

  const fetchClassrooms = useCallback(async () => {
    try {
      setLoading(true);
      const response = await ClassroomApi.getTeacherClasses();
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
      await ClassroomApi.addSession({
        classroom_id: selectedClass.id,
        ...scheduleForm,
      });
      setShowScheduleModal(false);
      setRefreshTrigger((prev) => prev + 1);
      fetchClassrooms();
    } catch (err) {
      if (err.message && err.message.includes('overlaps with this time')) {
        setError('You already have a class scheduled that overlaps with this time. Please choose a different time slot.');
      } else {
        setError('Failed to schedule class');
      }
    }
  }, [selectedClass, scheduleForm, fetchClassrooms]);

  const handleAssignmentSubmit = useCallback(async (e) => {
    e.preventDefault();
    try {
      const response = await ClassroomApi.createAssignment({
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
      // Determine type: 'video' if links are provided, 'file' if files are uploaded
      let type = '';
      if (materialForm.files && materialForm.files.length > 0) {
        type = 'file';
      } else if (materialForm.content && materialForm.content.some(link => link && link.trim() !== '')) {
        type = 'video';
      } else {
        type = 'video'; // fallback
      }
      formData.append('type', type);
      // Append all links
      materialForm.content.forEach((link) => {
        if (link) formData.append('content[]', link);
      });
      // Append all files
      if (materialForm.files && materialForm.files.length > 0) {
        materialForm.files.forEach((file) => {
          formData.append('files[]', file);
        });
      }
      const response = await ClassroomApi.addMaterial(formData);
      if (response.success) {
        setShowMaterialsModal(false);
        setRefreshTrigger((prev) => prev + 1);
        setMaterialForm({ title: '', content: [''], files: [] });
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
    <main className="min-h-screen bg-background-light animate-fade-in">
      <div className="p-4 sm:p-8">
        {/* Header */}
        <section className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary flex items-center gap-2 drop-shadow-sm">
            <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18" /></svg>
            Classroom Management
          </h1>
        </section>

        {loading ? (
          <LoadingSkeleton />
        ) : error ? (
          <ErrorAlert message={error} onClose={handleCloseError} />
        ) : (
          <>
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8" aria-label="Classroom list">
              {classrooms.map((classroom) => (
                <ClassroomCard
                  key={classroom.id}
                  classroom={classroom}
                  onCardClick={(c) => {
                    // Navigate to classroom detail route
                    window.location.href = `/teacher/classroom/${c.id}`;
                  }}
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
            </section>

            {selectedClass && (
              <section className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 transition-all duration-200">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-2 sm:gap-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-primary flex items-center gap-2">
                    <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8M12 8v8" /></svg>
                    {selectedClass.name}
                  </h2>
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
              </section>
            )}

            {!selectedClass && classrooms.length > 0 && (
              <section className="text-center p-6 sm:p-8 bg-white rounded-xl shadow-lg">
                <p className="text-base sm:text-lg text-gray-600">
                  Select a classroom to view its calendar and materials.
                </p>
              </section>
            )}
          </>
        )}

        {/* Schedule Modal */}
        {showScheduleModal && (
          <ModalOverlay onClose={handleCloseScheduleModal}>
            <div className="bg-white rounded-xl p-6 max-w-lg w-full" role="dialog" aria-modal="true" aria-labelledby="schedule-modal-title">
              <h2 id="schedule-modal-title" className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8M12 8v8" /></svg>
                Schedule Class
              </h2>
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
              <h2 id="materials-modal-title" className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 9V7a5 5 0 0 1 10 0v2" /></svg>
                Add Study Material
              </h2>
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
                  <label className="block text-sm font-medium text-gray-700">Video URLs</label>
                  {materialForm.content.map((link, idx) => (
                    <div key={idx} className="flex items-center gap-2 mb-2">
                      <input
                        type="url"
                        name="content"
                        data-idx={idx}
                        value={link}
                        onChange={handleMaterialChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary"
                        required
                      />
                      {materialForm.content.length > 1 && (
                        <button type="button" onClick={() => handleRemoveLinkField(idx)} className="text-red-600 hover:text-red-800 text-lg font-bold" aria-label="Remove link">&times;</button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={handleAddLinkField} className="text-secondary hover:text-accent text-sm mt-1">+ Add another link</button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700" htmlFor="material-file">Upload Files</label>
                  <input
                    id="material-file"
                    type="file"
                    multiple
                    onChange={handleMaterialChange}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-secondary file:text-white hover:file:bg-accent"
                  />
                </div>
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
              <h2 id="assignment-modal-title" className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8M12 8v8" /></svg>
                Create Assignment
              </h2>
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
    </main>
  );
}


export default ClassroomManagement;
