import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ApiService from '../../utils/api';
import ClassroomCalendar from '../../components/classroom/ClassroomCalendar';
import AttendanceModal from '../../components/classroom/AttendanceModal';
import MaterialsView from '../../components/classroom/MaterialsView';

const ClassroomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState('calendar');
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  useEffect(() => {
    const fetchClassroomDetails = async () => {
      try {
        setLoading(true);
        // Fetch classroom details using the dedicated API method
        const response = await ApiService.getClassroomDetails(id);
        
        if (response.success) {
          setClassroom(response.classroom);
        } else {
          setError(response.message || 'Failed to fetch classroom details');
        }
      } catch (err) {
        console.error('Error fetching classroom details:', err);
        setError('Error retrieving classroom: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchClassroomDetails();
  }, [id]);

  const handleEventClick = (eventData) => {
    setSelectedSession(eventData);
    setShowAttendanceModal(true);
  };

  const handleAttendanceSubmitted = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3f1f9] p-8">
        <div className="text-center py-8">Loading classroom details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f3f1f9] p-8">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          {error}
          <button 
            onClick={() => navigate('/teacher/classroom')} 
            className="mt-4 px-4 py-2 bg-[#461fa3] text-white rounded-md"
          >
            Back to Classrooms
          </button>
        </div>
      </div>
    );
  }

  if (!classroom) {
    return (
      <div className="min-h-screen bg-[#f3f1f9] p-8">
        <div className="text-center py-8">
          <p>Classroom not found</p>
          <button 
            onClick={() => navigate('/teacher/classroom')} 
            className="mt-4 px-4 py-2 bg-[#461fa3] text-white rounded-md"
          >
            Back to Classrooms
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f1f9]">
      <div className="p-8">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-[#200e4a]">
            {classroom.name}
          </h1>
          <button 
            onClick={() => navigate('/teacher/classroom')}
            className="px-4 py-2 bg-gray-100 rounded-md text-gray-700 hover:bg-gray-200"
          >
            Back to All Classrooms
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="mb-6">
            <p className="text-gray-600">{classroom.description}</p>
            <div className="mt-4 text-sm text-gray-500">
              <p><span className="font-semibold">Students:</span> {classroom.student_count}</p>
              <p><span className="font-semibold">Created:</span> {new Date(classroom.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[#200e4a]">Classroom Content</h2>
            
            <div className="flex space-x-4">
              <button 
                className={`px-4 py-2 rounded-md ${currentView === 'calendar' 
                  ? 'bg-[#461fa3] text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                onClick={() => setCurrentView('calendar')}
              >
                Calendar
              </button>
              <button 
                className={`px-4 py-2 rounded-md ${currentView === 'materials' 
                  ? 'bg-[#461fa3] text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                onClick={() => setCurrentView('materials')}
              >
                Materials
              </button>
              <button 
                className={`px-4 py-2 rounded-md ${currentView === 'students' 
                  ? 'bg-[#461fa3] text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                onClick={() => setCurrentView('students')}
              >
                Students
              </button>
            </div>
          </div>

          {currentView === 'calendar' && (
            <ClassroomCalendar
              classroomId={id}
              onEventClick={handleEventClick}
              refreshTrigger={refreshTrigger}
            />
          )}
          
          {currentView === 'materials' && (
            <MaterialsView
              classroomId={id}
              refreshTrigger={refreshTrigger}
            />
          )}
          
          {currentView === 'students' && (
            <div className="bg-white p-4 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Student List</h3>
              {/* Student list will be implemented here */}
              <p className="text-gray-500">Student listing functionality will be added here.</p>
            </div>
          )}
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
