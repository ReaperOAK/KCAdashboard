import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import ContactUs from './pages/ContactUs';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import StudentAttendance from './pages/StudentAttendance';
import TeacherAttendance from './pages/TeacherAttendance';
import AdminAttendance from './pages/AdminAttendance';
import Resources from './pages/Resources';
import GradingFeedback from './pages/GradingFeedback';
import BatchManagement from './pages/BatchManagement';
import AnalyticsReporting from './pages/AnalyticsReporting';
import Settings from './pages/Settings';
import Support from './pages/Support';
import ResetPassword from './pages/ResetPassword';
import ManageUsers from './pages/ManageUsers';
import ManageSystem from './pages/ManageSystem';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';
import GoogleCallback from './pages/GoogleCallback';
import ProtectedRoute from './components/ProtectedRoute';
import useTokenValidation from './utils/useTokenValidation';

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

const AppContent = () => {
  const [role, setRole] = useState('');

  useTokenValidation(setRole);

  return (
    <>
      <Header />
      <div className="flex">
        <Sidebar role={role} />
        <main className="flex-grow p-8 bg-gray-100">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/google-callback" element={<GoogleCallback />} />
            <Route element={<ProtectedRoute allowedRoles={['student']} role={role} />}>
              <Route path="/student-dashboard" element={<StudentDashboard />} />
              <Route path="/student-attendance" element={<StudentAttendance />} />
            </Route>
            <Route element={<ProtectedRoute allowedRoles={['teacher']} role={role} />}>
              <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
              <Route path="/teacher-attendance" element={<TeacherAttendance />} />
              <Route path="/grading-feedback" element={<GradingFeedback />} />
            </Route>
            <Route element={<ProtectedRoute allowedRoles={['admin']} role={role} />}>
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/admin-attendance" element={<AdminAttendance />} />
              <Route path="/analytics-reporting" element={<AnalyticsReporting />} />
              <Route path="/manage-users" element={<ManageUsers />} />
              <Route path="/manage-system" element={<ManageSystem />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/notifications" element={<Notifications />} />
            </Route>
            <Route element={<ProtectedRoute allowedRoles={['student', 'teacher']} role={role} />}>
              <Route path="/resources" element={<Resources />} />
            </Route>
            <Route element={<ProtectedRoute allowedRoles={['admin', 'teacher']} role={role} />}>
              <Route path="/batch-management" element={<BatchManagement />} />
            </Route>
            <Route element={<ProtectedRoute allowedRoles={['student', 'teacher', 'admin']} role={role} />}>
              <Route path="/settings" element={<Settings />} />
              <Route path="/support" element={<Support />} />
            </Route>
          </Routes>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default App;