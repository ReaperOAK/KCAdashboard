
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ClassroomApi } from '../../api/classroom';
import ClassroomCalendar from '../../components/classroom/ClassroomCalendar';
import AttendanceModal from '../../components/classroom/AttendanceModal';
import MaterialsView from '../../components/classroom/MaterialsView';
import ClassroomDetailLoading from '../../components/classroom/ClassroomDetailLoading';
import ClassroomDetailError from '../../components/classroom/ClassroomDetailError';
import ClassroomNotFound from '../../components/classroom/ClassroomNotFound';
import ViewSwitcher from '../../components/classroom/ViewSwitcher';

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
        const response = await ClassroomApi.getClassroomDetails(id);
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
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-light transition-all duration-200">
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
          <h1 className="text-2xl sm:text-3xl font-bold text-primary drop-shadow-sm">{classroom.name}</h1>
          <button
            type="button"
            onClick={handleBack}
            className="px-3 sm:px-4 py-2 bg-gray-light rounded-md text-primary hover:bg-accent hover:text-white focus:outline-none focus:ring-2 focus:ring-accent text-sm sm:text-base transition-all duration-200 shadow-sm"
            aria-label="Back to All Classrooms"
          >
            Back to All Classrooms
          </button>
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-gray-light p-4 sm:p-6 mb-6 sm:mb-8 transition-all duration-200">
          <div className="mb-4 sm:mb-6">
            <p className="text-gray-dark text-base sm:text-lg leading-relaxed">{classroom.description}</p>
            <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-dark flex flex-wrap gap-4">
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
