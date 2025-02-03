import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './utils/ProtectedRoute';
import useTokenValidation from './utils/useTokenValidation';

// Import pages
import Home from './pages/auth/Home';
import Login from './pages/auth/Login';
import SignUp from './pages/auth/SignUp';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import GoogleCallback from './pages/auth/GoogleCallback';
import ContactUs from './pages/auth/ContactUs';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentAttendance from './pages/student/StudentAttendance';
import Resources from './pages/student/Resources';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherAttendance from './pages/teacher/TeacherAttendance';
import GradingFeedback from './pages/teacher/GradingFeedback';
import BatchManagement from './pages/teacher/BatchManagement';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAttendance from './pages/admin/AdminAttendance';
import ManageUsers from './pages/admin/ManageUsers';
import ManageSystem from './pages/admin/ManageSystem';
import AnalyticsReporting from './pages/admin/AnalyticsReporting';
import Reports from './pages/admin/Reports';
import Notifications from './pages/admin/Notifications';
import Settings from './pages/Settings';
import Support from './pages/Support';
import SimulGames from './pages/student/SimulGames';
import Studies from './pages/student/Studies';
import InteractiveBoard from './pages/student/InteractiveBoard';
import GameArea from './pages/student/GameArea';
import QuizPage from './pages/student/QuizPage';
import Tournaments from './pages/student/Tournaments';
import ChatPage from './pages/ChatPage';
import PGNDatabase from './pages/teacher/PGNDatabase';
import ClassroomManagement from './pages/teacher/ClassroomManagement';
import PlatformAnalytics from './pages/admin/PlatformAnalytics';

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  return (
    <Router>
      <AppContent isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
    </Router>
  );
};

const AppContent = ({ isSidebarOpen, toggleSidebar }) => {
  const [role, setRole] = useState('');
  useTokenValidation(setRole);

  return (
    <div className="flex h-screen overflow-hidden">
      <Header />
      <Sidebar role={role} isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex flex-col flex-grow overflow-y-auto">
        <main className="flex-grow bg-gray-100 ">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/google-callback" element={<GoogleCallback />} />

            {/* Student Routes */}
            <Route
              element={<ProtectedRoute allowedRoles={['student']} role={role} />}
            >
              <Route path="/student-dashboard" element={<StudentDashboard />} />
              <Route path="/student-attendance" element={<StudentAttendance />} />
              <Route path="/simul-games" element={<SimulGames />} />
              <Route path="/chess-studies" element={<Studies />} />
              <Route path="/interactive-board" element={<InteractiveBoard />} />
              <Route path="/game-area" element={<GameArea />} />
              <Route path="/quiz" element={<QuizPage />} />
              <Route path="/tournaments" element={<Tournaments />} />
            </Route>

            {/* Teacher Routes */}
            <Route
              element={<ProtectedRoute allowedRoles={['teacher']} role={role} />}
            >
              <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
              <Route path="/teacher-attendance" element={<TeacherAttendance />} />
              <Route path="/grading-feedback" element={<GradingFeedback />} />
              <Route path="/batch-management" element={<BatchManagement />} />
              <Route path="/pgn-database" element={<PGNDatabase />} />
              <Route path="/classroom-management" element={<ClassroomManagement />} />
            </Route>

            {/* Admin Routes */}
            <Route
              element={<ProtectedRoute allowedRoles={['admin']} role={role} />}
            >
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/admin-attendance" element={<AdminAttendance />} />
              <Route path="/manage-users" element={<ManageUsers />} />
              <Route path="/manage-system" element={<ManageSystem />} />
              <Route path="/analytics-reporting" element={<AnalyticsReporting />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/platform-analytics" element={<PlatformAnalytics />} />
            </Route>

            {/* Shared Routes */}
            <Route
              element={<ProtectedRoute allowedRoles={['student', 'teacher']} role={role} />}
            >
              <Route path="/resources" element={<Resources />} />
            </Route>
            <Route
              element={<ProtectedRoute allowedRoles={['teacher', 'admin']} role={role} />}
            >
              <Route path="/batch-management" element={<BatchManagement />} />
            </Route>
            <Route
              element={<ProtectedRoute allowedRoles={['student', 'teacher', 'admin']} role={role} />}
            >
              <Route path="/settings" element={<Settings />} />
              <Route path="/support" element={<Support />} />
              <Route path="/chat" element={<ChatPage />} />
            </Route>
          </Routes>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default App;