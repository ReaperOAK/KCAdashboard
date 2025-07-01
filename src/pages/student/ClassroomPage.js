
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ApiService from '../../utils/api';
import { Link } from 'react-router-dom';


// Loading spinner (accessible, reusable)
const LoadingSpinner = React.memo(() => (
  <div className="flex items-center justify-center min-h-screen bg-background-light" role="status" aria-live="polite">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto mb-4" aria-label="Loading"></div>
      <p className="text-secondary">Loading classes...</p>
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
    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${badgeClass}`}>{status}</span>
  );
});

// Enrolled class card (memoized)
const EnrolledClassCard = React.memo(({ classroom }) => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden" role="region" aria-label={classroom.name}>
    <div className="p-6">
      <h2 className="text-xl font-semibold text-secondary mb-2">{classroom.name}</h2>
      <p className="text-gray-dark mb-4">{classroom.description}</p>
      <div className="text-sm text-gray-dark">
        <p><span className="font-semibold">Teacher:</span> {classroom.teacher_name}</p>
        <p><span className="font-semibold">Schedule:</span> {classroom.schedule}</p>
        <p><span className="font-semibold">Status:</span> <StatusBadge status={classroom.status} /></p>
      </div>
    </div>
    <div className="px-6 py-4 bg-gray-light/30 border-t">
      <Link
        to={`/student/classes/${classroom.id}`}
        className="block w-full text-center text-secondary hover:text-accent focus:outline-none focus:underline"
        aria-label={`View details for ${classroom.name}`}
      >
        View Details →
      </Link>
    </div>
  </div>
));

// Available class card (memoized)
const AvailableClassCard = React.memo(({ classroom, enrolling, enrollSuccess, enrollError, onEnroll }) => (
  <div className="bg-white border-2 border-dashed border-gray-light rounded-xl overflow-hidden" role="region" aria-label={classroom.name}>
    <div className="p-6">
      <h2 className="text-xl font-semibold text-secondary mb-2">{classroom.name}</h2>
      <p className="text-gray-dark mb-4">{classroom.description}</p>
      <div className="text-sm text-gray-dark mb-4">
        <p><span className="font-semibold">Teacher:</span> {classroom.teacher_name}</p>
        <p><span className="font-semibold">Schedule:</span> {classroom.schedule}</p>
        <p><span className="font-semibold">Level:</span> {classroom.level}</p>
        <p><span className="font-semibold">Availability:</span> <span className="ml-1 text-green-600">{classroom.available_slots} slots left</span></p>
      </div>
      <button
        onClick={() => onEnroll(classroom.id)}
        disabled={enrolling === classroom.id}
        className="w-full px-4 py-2 bg-secondary text-white rounded-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
        aria-label={`Enroll in ${classroom.name}`}
      >
        {enrolling === classroom.id ? 'Enrolling...' : enrollSuccess === classroom.id ? 'Enrolled!' : 'Enroll Now'}
      </button>
      {enrollError && enrolling === classroom.id && (
        <p className="mt-2 text-sm text-red-600">{enrollError}</p>
      )}
    </div>
  </div>
));

// Main classroom page
export const ClassroomPage = React.memo(() => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [showAvailable, setShowAvailable] = useState(false);
  const [enrolling, setEnrolling] = useState(null);
  const [enrollSuccess, setEnrollSuccess] = useState(null);
  const [enrollError, setEnrollError] = useState(null);

  const fetchClasses = useCallback(async () => {
    try {
      let response;
      try {
        response = await ApiService.get('/classroom/get-student-batches.php');
      } catch {
        response = await ApiService.get('/classroom/get-student-classes.php');
      }
      setClasses(response.classes);
      setLoading(false);
    } catch {
      setError('Failed to fetch classes');
      setLoading(false);
    }
  }, []);

  const fetchAvailableClasses = useCallback(async () => {
    try {
      const response = await ApiService.get('/classroom/get-available-classes.php');
      setAvailableClasses(response.classes);
    } catch (err) {
      // Silently fail, no available classes
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  useEffect(() => {
    if (showAvailable) fetchAvailableClasses();
  }, [showAvailable, fetchAvailableClasses]);

  const handleShowAvailable = useCallback(() => setShowAvailable((prev) => !prev), []);
  const handleShowAvailableTrue = useCallback(() => setShowAvailable(true), []);

  const handleEnroll = useCallback(async (classId) => {
    setEnrolling(classId);
    setEnrollSuccess(null);
    setEnrollError(null);
    try {
      await ApiService.post('/classroom/enroll.php', { classroom_id: classId });
      setEnrollSuccess(classId);
      fetchClasses();
      fetchAvailableClasses();
      setTimeout(() => setEnrollSuccess(null), 3000);
    } catch (error) {
      setEnrollError(error.message || 'Failed to enroll in class');
    } finally {
      setEnrolling(null);
    }
  }, [fetchClasses, fetchAvailableClasses]);

  // Memoize class cards for performance
  const enrolledClassCards = useMemo(() => (
    classes.map((classroom) => (
      <EnrolledClassCard key={classroom.id} classroom={classroom} />
    ))
  ), [classes]);

  const availableClassCards = useMemo(() => (
    availableClasses.map((classroom) => (
      <AvailableClassCard
        key={classroom.id}
        classroom={classroom}
        enrolling={enrolling}
        enrollSuccess={enrollSuccess}
        enrollError={enrollError}
        onEnroll={handleEnroll}
      />
    ))
  ), [availableClasses, enrolling, enrollSuccess, enrollError, handleEnroll]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState error={error} />;

  return (
    <div className="min-h-screen bg-background-light">
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-primary">My Classes</h1>
          <button
            onClick={handleShowAvailable}
            className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label={showAvailable ? 'Hide available classes' : 'Browse available classes'}
          >
            {showAvailable ? 'Hide Available Classes' : 'Browse Available Classes'}
          </button>
        </div>
        {/* Enrolled Classes */}
        {classes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledClassCards}
          </div>
        ) : (
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <p className="text-gray-dark mb-4">You are not enrolled in any classes yet.</p>
            <button
              onClick={handleShowAvailableTrue}
              className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent"
              aria-label="Browse available classes"
            >
              Browse Available Classes
            </button>
          </div>
        )}
        {/* Available Classes for Enrollment */}
        {showAvailable && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-primary mb-6">Available Classes</h2>
            {availableClasses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableClassCards}
              </div>
            ) : (
              <p className="text-center text-gray-dark">No available classes found at the moment.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

export default ClassroomPage;