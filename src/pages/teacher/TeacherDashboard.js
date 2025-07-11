import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { AnalyticsApi } from '../../api/analytics';
import { AttendanceApi } from '../../api/attendance';
import { GradingApi } from '../../api/grading';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCircleIcon, AcademicCapIcon, CalendarDaysIcon, CheckCircleIcon, ExclamationCircleIcon, ArrowPathIcon, ClipboardDocumentCheckIcon, PencilSquareIcon } from '@heroicons/react/24/solid';

// --- Grading Prompt Modal (animated) ---
const GradingPrompt = ({ sessions, onClose }) => {
  const navigate = useNavigate();
  if (!sessions.length) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
        aria-modal="true"
        role="dialog"
      >
        <motion.div
          initial={{ scale: 0.95, y: 40 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 40 }}
          transition={{ duration: 0.25 }}
          className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full border border-accent/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <PencilSquareIcon className="h-6 w-6 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-bold text-primary">Pending Grading</h2>
          </div>
          <p className="mb-4">You have classes that have ended but grading/feedback is not submitted. Please grade these sessions:</p>
          <ul className="mb-4">
            {sessions.map(s => (
              <li key={s.id} className="mb-2 flex justify-between items-center">
                <span>{s.title} <span className="text-xs text-gray-500">({s.batch_name})</span></span>
                <button
                  className="ml-2 px-2 py-1 bg-secondary text-white rounded hover:bg-primary focus:outline-none focus:ring-2 focus:ring-accent"
                  onClick={() => navigate(`/teacher/grading?session=${s.id}`)}
                >Grade</button>
              </li>
            ))}
          </ul>
          <button className="text-sm text-gray-600 hover:underline focus:outline-none" onClick={onClose}>Dismiss</button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// --- Attendance Prompt Modal (animated) ---
const AttendancePrompt = ({ sessions, onClose }) => {
  const navigate = useNavigate();
  if (!sessions.length) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
        aria-modal="true"
        role="dialog"
      >
        <motion.div
          initial={{ scale: 0.95, y: 40 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 40 }}
          transition={{ duration: 0.25 }}
          className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full border border-accent/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <ClipboardDocumentCheckIcon className="h-6 w-6 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-bold text-primary">Pending Attendance</h2>
          </div>
          <p className="mb-4">You have classes that have ended but attendance is not marked. Please mark attendance for these sessions:</p>
          <ul className="mb-4">
            {sessions.map(s => (
              <li key={s.id} className="mb-2 flex justify-between items-center">
                <span>{s.title} <span className="text-xs text-gray-500">({s.batch_name})</span></span>
                <button
                  className="ml-2 px-2 py-1 bg-secondary text-white rounded hover:bg-primary focus:outline-none focus:ring-2 focus:ring-accent"
                  onClick={() => navigate(`/teacher/attendance?session=${s.id}`)}
                >Mark Attendance</button>
              </li>
            ))}
          </ul>
          <button className="text-sm text-gray-600 hover:underline focus:outline-none" onClick={onClose}>Dismiss</button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};


// --- Skeleton Loader (animated) ---
const DashboardSkeleton = React.memo(() => (
  <div className="min-h-screen bg-background-light flex items-center justify-center" role="status" aria-live="polite">
    <div className="text-center">
      <ArrowPathIcon className="animate-spin h-12 w-12 text-secondary mx-auto mb-4" aria-label="Loading" />
      <p className="text-secondary">Loading dashboard...</p>
    </div>
  </div>
));

// --- Error Alert (animated) ---
const ErrorAlert = React.memo(({ message, onRetry }) => {
  const [retrying, setRetrying] = useState(false);
  const handleRetry = async () => {
    setRetrying(true);
    await onRetry();
    setRetrying(false);
  };
  return (
    <div className="min-h-screen bg-background-light flex items-center justify-center" role="alert">
      <div className="text-center">
        <div className="bg-red-700 border border-red-800 text-white px-4 py-3 rounded mb-4 flex items-center gap-2">
          <ExclamationCircleIcon className="h-5 w-5 text-white" aria-hidden="true" />
          {message}
        </div>
        <button
          type="button"
          onClick={handleRetry}
          className="bg-secondary text-white px-4 py-2 rounded hover:bg-primary focus:outline-none focus:ring-2 focus:ring-accent flex items-center gap-2"
          aria-label="Retry loading dashboard"
          disabled={retrying}
        >
          {retrying && <ArrowPathIcon className="animate-spin h-5 w-5" aria-hidden="true" />} Retry
        </button>
      </div>
    </div>
  );
});

// --- Stats Cards (animated, with icons) ---
const statIcons = [AcademicCapIcon, CalendarDaysIcon, CheckCircleIcon, UserCircleIcon];
const StatsGrid = React.memo(({ stats }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
    <StatsCard label="Total Students" value={stats.totalStudents} icon={statIcons[0]} />
    <StatsCard label="Active Classes" value={stats.activeClasses} icon={statIcons[1]} />
    <StatsCard label="Upcoming Classes" value={stats.upcomingClasses} icon={statIcons[2]} />
    <StatsCard label="Completed Classes" value={stats.completedClasses} icon={statIcons[3]} />
  </div>
));

const StatsCard = React.memo(({ label, value, icon: Icon }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, type: 'spring' }}
    className="bg-white p-4 sm:p-6 rounded-xl shadow-md flex flex-col items-start border border-accent/10"
    role="region"
    aria-label={label}
  >
    {Icon && <Icon className="h-7 w-7 text-primary mb-1" aria-hidden="true" />}
    <h2 className="text-base sm:text-lg font-semibold text-secondary">{label}</h2>
    <p className="text-2xl sm:text-3xl font-bold text-primary">{value}</p>
  </motion.div>
));

// --- Recent Activities (animated, with badge icons) ---
const RecentActivities = React.memo(({ activities }) => {
  if (!activities.length) return null;
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: 'spring' }}
      className="bg-white p-4 sm:p-6 rounded-xl shadow-md border border-accent/10"
      aria-labelledby="recent-activities-title"
    >
      <h2 id="recent-activities-title" className="text-lg sm:text-xl font-semibold text-primary mb-3 sm:mb-4">Recent Activities</h2>
      <div className="space-y-2 sm:space-y-3">
        {activities.map((activity, idx) => (
          <div key={idx} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 sm:p-3 bg-gray-light/30 rounded-lg">
            <div>
              <h3 className="font-medium text-primary text-base sm:text-lg">{activity.title}</h3>
              <p className="text-xs sm:text-sm text-gray-dark">Batch: {activity.batch_name}</p>
            </div>
            <div className="text-left sm:text-right mt-2 sm:mt-0 flex flex-col items-start sm:items-end gap-1">
              <p className="text-xs sm:text-sm text-gray-dark/80">
                {new Date(activity.date_time).toLocaleDateString()}
              </p>
              <span className={
                `inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full font-medium ` +
                (activity.status === 'upcoming'
                  ? 'bg-blue-100 text-blue-800'
                  : activity.status === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800')
              }>
                {activity.status === 'upcoming' && <CalendarDaysIcon className="h-4 w-4" aria-hidden="true" />}
                {activity.status === 'completed' && <CheckCircleIcon className="h-4 w-4" aria-hidden="true" />}
                {activity.status !== 'upcoming' && activity.status !== 'completed' && <ExclamationCircleIcon className="h-4 w-4" aria-hidden="true" />}
                {activity.status === 'upcoming' ? 'Upcoming'
                  : activity.status === 'completed' ? 'Completed'
                  : 'In Progress'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  );
});

// --- Main Component ---
export default function TeacherDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeClasses: 0,
    upcomingClasses: 0,
    completedClasses: 0,
  });
  const [pendingAttendance, setPendingAttendance] = useState([]);
  const [showAttendancePrompt, setShowAttendancePrompt] = useState(false);
  const [pendingGrading, setPendingGrading] = useState([]);
  const [showGradingPrompt, setShowGradingPrompt] = useState(false);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Prevent duplicate API calls by using a ref
  const isFetchingRef = React.useRef(false);
  const fetchDashboardData = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const response = await AnalyticsApi.getTeacherDashboardStats();
      if (response.success) {
        setStats(response.stats);
        setRecentActivities(response.recentActivities || []);
      } else {
        setError(response.message || 'Failed to fetch dashboard data');
      }
      // Fetch pending attendance sessions
      if (user && user.id) {
        try {
          const pending = await AttendanceApi.getPendingAttendanceSessions(user.id);
          if (pending && pending.sessions && pending.sessions.length > 0) {
            setPendingAttendance(pending.sessions);
            setShowAttendancePrompt(true);
          }
        } catch (err) {
          // Optionally log or show error for attendance fetch
        }
        // Fetch pending grading sessions
        try {
          const pendingGradingRes = await GradingApi.getPendingGradingSessions(user.id);
          if (pendingGradingRes && pendingGradingRes.sessions && pendingGradingRes.sessions.length > 0) {
            setPendingGrading(pendingGradingRes.sessions);
            setShowGradingPrompt(true);
          }
        } catch (err) {
          // Optionally log or show error for grading fetch
        }
      }
    } catch (err) {
      setError(`Failed to load dashboard data: ${err.message}`);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line
  }, [fetchDashboardData, user]);

  if (loading) return <DashboardSkeleton />;
  if (error) return <ErrorAlert message={error} onRetry={fetchDashboardData} />;


  return (
    <div className="min-h-screen bg-gradient-to-br from-background-light via-white to-background-light">
      <AnimatePresence>
        {showAttendancePrompt && pendingAttendance.length > 0 && (
          <AttendancePrompt sessions={pendingAttendance} onClose={() => setShowAttendancePrompt(false)} />
        )}
        {showGradingPrompt && pendingGrading.length > 0 && (
          <GradingPrompt sessions={pendingGrading} onClose={() => setShowGradingPrompt(false)} />
        )}
      </AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: 'spring' }}
        className="p-4 sm:p-8 max-w-6xl mx-auto"
      >
        <div className="flex flex-col items-center mb-8">
          <UserCircleIcon className="h-20 w-20 text-primary mb-2" aria-hidden="true" />
          <h1 className="text-2xl sm:text-3xl font-bold text-primary text-center break-words">
            Welcome, {user.full_name}!
          </h1>
        </div>
        <StatsGrid stats={stats} />
        <RecentActivities activities={recentActivities} />
      </motion.div>
    </div>
  );
}
