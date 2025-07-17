

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ClassroomApi } from '../../api/classroom';
import LoadingSpinner from '../../components/classroom/LoadingSpinner';
import ErrorState from '../../components/classroom/ErrorState';
import EnrolledClassCard from '../../components/classroom/EnrolledClassCard';
import AvailableClassCard from '../../components/classroom/AvailableClassCard';

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
        response = await ClassroomApi.getStudentBatches ? await ClassroomApi.getStudentBatches() : await ClassroomApi.getStudentClasses();
      } catch {
        response = await ClassroomApi.getStudentClasses();
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
      const response = await ClassroomApi.getAvailableClasses ? await ClassroomApi.getAvailableClasses() : { classes: [] };
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
      await ClassroomApi.enrollInClassroom(classId);
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
    <div className="min-h-screen bg-background-light px-2 sm:px-4 md:px-8 py-6 flex flex-col">
      <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col gap-8">
        {/* Header and Action */}
        <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2 sm:mb-4 md:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight leading-tight">My Classes</h1>
          <button
            onClick={handleShowAvailable}
            className="px-5 py-2.5 bg-secondary text-white rounded-lg shadow-md hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all duration-200 text-base font-semibold"
            aria-label={showAvailable ? 'Hide available classes' : 'Browse available classes'}
          >
            {showAvailable ? 'Hide Available Classes' : 'Browse Available Classes'}
          </button>
        </section>

        {/* Enrolled Classes */}
        <section>
          {classes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {enrolledClassCards}
            </div>
          ) : (
            <div className="bg-white/95 p-6 rounded-2xl shadow-lg text-center flex flex-col items-center gap-4">
              <p className="text-gray-dark text-lg mb-2">You are not enrolled in any classes yet.</p>
              <button
                onClick={handleShowAvailableTrue}
                className="px-5 py-2.5 bg-secondary text-white rounded-lg shadow-md hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all duration-200 text-base font-semibold"
                aria-label="Browse available classes"
              >
                Browse Available Classes
              </button>
            </div>
          )}
        </section>

        {/* Available Classes for Enrollment */}
        {showAvailable && (
          <section className="mt-8 sm:mt-12">
            <h2 className="text-xl sm:text-2xl font-bold text-primary mb-4 sm:mb-6">Available Classes</h2>
            {availableClasses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                {availableClassCards}
              </div>
            ) : (
              <p className="text-center text-gray-dark">No available classes found at the moment.</p>
            )}
          </section>
        )}
      </div>
    </div>
  );
});

export default ClassroomPage;