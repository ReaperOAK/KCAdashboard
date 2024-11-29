import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
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
import ProtectedRoute from './components/ProtectedRoute';
import { getCookie } from './utils/getCookie';

const App = () => {
  const [role, setRole] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = getCookie('token');
    if (token) {
      try {
        const decodedPayload = JSON.parse(atob(token.split('.')[1])); // Parsing only payload part
        setRole(decodedPayload.role);
      } catch (error) {
        console.error('Invalid token:', error);
        navigate('/login'); // Redirect to login page if token is invalid
      }
    }
  }, [navigate]);

  return (
    <Router>
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
            <Route path="/student-dashboard" element={<ProtectedRoute element={StudentDashboard} allowedRoles={['student']} role={role} />} />
            <Route path="/teacher-dashboard" element={<ProtectedRoute element={TeacherDashboard} allowedRoles={['teacher']} role={role} />} />
            <Route path="/admin-dashboard" element={<ProtectedRoute element={AdminDashboard} allowedRoles={['admin']} role={role} />} />
            <Route path="/student-attendance" element={<ProtectedRoute element={StudentAttendance} allowedRoles={['student']} role={role} />} />
            <Route path="/teacher-attendance" element={<ProtectedRoute element={TeacherAttendance} allowedRoles={['teacher']} role={role} />} />
            <Route path="/admin-attendance" element={<ProtectedRoute element={AdminAttendance} allowedRoles={['admin']} role={role} />} />
            <Route path="/resources" element={<ProtectedRoute element={Resources} allowedRoles={['student', 'teacher']} role={role} />} />
            <Route path="/grading-feedback" element={<ProtectedRoute element={GradingFeedback} allowedRoles={['student', 'teacher']} role={role} />} />
            <Route path="/batch-management" element={<ProtectedRoute element={BatchManagement} allowedRoles={['teacher', 'admin']} role={role} />} />
            <Route path="/analytics-reporting" element={<ProtectedRoute element={AnalyticsReporting} allowedRoles={['admin']} role={role} />} />
            <Route path="/settings" element={<ProtectedRoute element={Settings} allowedRoles={['student', 'teacher', 'admin']} role={role} />} />
            <Route path="/support" element={<ProtectedRoute element={Support} allowedRoles={['student', 'teacher', 'admin']} role={role} />} />
          </Routes>
        </main>
      </div>
      <Footer />
    </Router>
  );
};

export default App;