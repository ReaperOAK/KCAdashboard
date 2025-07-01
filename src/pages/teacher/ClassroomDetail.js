import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ApiService from '../../utils/api';
import ClassroomCalendar from '../../components/classroom/ClassroomCalendar';
import AttendanceModal from '../../components/classroom/AttendanceModal';
import MaterialsView from '../../components/classroom/MaterialsView';

// Loading skeleton
const ClassroomDetailLoading = React.memo(() => (
  <div className="min-h-screen bg-background-light p-8 flex items-center justify-center" aria-busy="true" aria-label="Loading classroom details">
    <div className="w-full max-w-2xl animate-pulse">
      <div className="h-8 bg-gray-light rounded w-1/2 mb-6" />
      <div className="h-6 bg-gray-light rounded w-1/3 mb-4" />
      <div className="h-4 bg-gray-light rounded w-1/4 mb-2" />
      <div className="h-4 bg-gray-light rounded w-1/4 mb-2" />
      <div className="h-4 bg-gray-light rounded w-1/4 mb-2" />
    </div>
  </div>
));

// Error alert
const ClassroomDetailError = React.memo(({ error, onBack }) => (
  <div className="min-h-screen bg-background-light p-8 flex items-center justify-center">
    <div className="bg-red-700 border border-red-800 text-white p-6 rounded-xl max-w-lg w-full text-center" role="alert">
      <div>{error}</div>
      <button
        type="button"
        onClick={onBack}
        className="mt-6 px-4 py-2 bg-secondary text-white rounded-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent"
        aria-label="Back to Classrooms"
      >
        Back to Classrooms
      </button>
    </div>
  </div>
));

// Not found alert
const ClassroomNotFound = React.memo(({ onBack }) => (
  <div className="min-h-screen bg-background-light p-8 flex items-center justify-center">
    <div className="bg-white border border-gray-light p-6 rounded-xl max-w-lg w-full text-center">
      <div className="text-xl font-semibold text-primary mb-2">Classroom not found</div>
      <button
        type="button"
        onClick={onBack}
        className="mt-6 px-4 py-2 bg-secondary text-white rounded-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent"
        aria-label="Back to Classrooms"
      >
        Back to Classrooms
      </button>
    </div>
  </div>
));

// View switcher
const ViewSwitcher = React.memo(({ currentView, onSwitch }) => {
  const buttons = useMemo(() => [
    { key: 'calendar', label: 'Calendar' },
    { key: 'materials', label: 'Materials' },
    { key: 'students', label: 'Students' },
  ], []);
  return (
    <div className="flex space-x-4" role="tablist" aria-label="Classroom content views">
      {buttons.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-accent transition-colors ${
            currentView === key
              ? 'bg-secondary text-white'
              : 'bg-gray-light text-primary hover:bg-accent hover:text-white'
          }`}
          aria-controls={`view-panel-${key}`}
          tabIndex={currentView === key ? 0 : -1}
          onClick={() => onSwitch(key)}
        >
          {label}
        </button>
      ))}
    </div>
  );
});

// Main detail component
export const ClassroomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState('calendar');
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch classroom details
  useEffect(() => {
    let isMounted = true;
    const fetchClassroomDetails = async () => {
      try {
        setLoading(true);
        const response = await ApiService.getClassroomDetails(id);
        if (!isMounted) return;
        if (response.success) {
          setClassroom(response.classroom);
        } else {
          setError(response.message || 'Failed to fetch classroom details');
        }
      } catch (err) {
        if (!isMounted) return;
        setError('Error retrieving classroom: ' + err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchClassroomDetails();
    return () => { isMounted = false; };
  }, [id]);

  // Handlers
  const handleEventClick = useCallback((eventData) => {
    setSelectedSession(eventData);
    setShowAttendanceModal(true);
  }, []);

  const handleAttendanceSubmitted = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const handleBack = useCallback(() => {
    navigate('/teacher/classroom');
  }, [navigate]);

  const handleSwitchView = useCallback((view) => {
    setCurrentView(view);
  }, []);

  // Memoized content panel
  const contentPanel = useMemo(() => {
    if (currentView === 'calendar') {
      return (
        <ClassroomCalendar
          classroomId={id}
          onEventClick={handleEventClick}
          refreshTrigger={refreshTrigger}
        />
      );
    }
    if (currentView === 'materials') {
      return (
        <MaterialsView
          classroomId={id}
          refreshTrigger={refreshTrigger}
        />
      );
    }
    if (currentView === 'students') {
      return (
        <div className="bg-white p-4 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-primary">Student List</h3>
          {/* Student list will be implemented here */}
          <p className="text-gray-dark">Student listing functionality will be added here.</p>
        </div>
      );
    }
    return null;
  }, [currentView, id, handleEventClick, refreshTrigger]);

  // Render
  if (loading) return <ClassroomDetailLoading />;
  if (error) return <ClassroomDetailError error={error} onBack={handleBack} />;
  if (!classroom) return <ClassroomNotFound onBack={handleBack} />;

  return (
    <div className="min-h-screen bg-background-light">
      <div className="p-4 sm:p-8">
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">{classroom.name}</h1>
          <button
            type="button"
            onClick={handleBack}
            className="px-3 sm:px-4 py-2 bg-gray-light rounded-md text-primary hover:bg-accent hover:text-white focus:outline-none focus:ring-2 focus:ring-accent text-sm sm:text-base"
            aria-label="Back to All Classrooms"
          >
            Back to All Classrooms
          </button>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="mb-4 sm:mb-6">
            <p className="text-gray-dark">{classroom.description}</p>
            <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-dark">
              <p><span className="font-semibold">Students:</span> {classroom.student_count}</p>
              <p><span className="font-semibold">Created:</span> {new Date(classroom.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-2xl font-bold text-primary">Classroom Content</h2>
            <ViewSwitcher currentView={currentView} onSwitch={handleSwitchView} />
          </div>
          <div id={`view-panel-${currentView}`} role="tabpanel" className="mt-2">
            {contentPanel}
          </div>
        </div>
      </div>
      {/* Attendance Modal */}
      {showAttendanceModal && selectedSession && (
        <AttendanceModal
          session={selectedSession}
          onClose={() => setShowAttendanceModal(false)}
          onAttendanceSubmitted={handleAttendanceSubmitted}
        />
      )}
    </div>
  );
};

export default ClassroomDetail;
