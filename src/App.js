import React, { useEffect, useState } from 'react';
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
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  const [role, setRole] = useState('');

  useEffect(() => {
    // Fetch the user's role from the authentication token or user context
    const token = localStorage.getItem('token');
    if (token) {
      // Decode the token to get the user's role
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      setRole(decodedToken.role);
    }
  }, []);

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
            <ProtectedRoute path="/student-dashboard" element={StudentDashboard} allowedRoles={['student']} role={role} />
            <ProtectedRoute path="/teacher-dashboard" element={TeacherDashboard} allowedRoles={['teacher']} role={role} />
            <ProtectedRoute path="/admin-dashboard" element={AdminDashboard} allowedRoles={['admin']} role={role} />
            <ProtectedRoute path="/student-attendance" element={StudentAttendance} allowedRoles={['student']} role={role} />
            <ProtectedRoute path="/teacher-attendance" element={TeacherAttendance} allowedRoles={['teacher']} role={role} />
            <ProtectedRoute path="/admin-attendance" element={AdminAttendance} allowedRoles={['admin']} role={role} />
            <ProtectedRoute path="/resources" element={Resources} allowedRoles={['student', 'teacher']} role={role} />
            <ProtectedRoute path="/grading-feedback" element={GradingFeedback} allowedRoles={['student', 'teacher']} role={role} />
            <ProtectedRoute path="/batch-management" element={BatchManagement} allowedRoles={['teacher', 'admin']} role={role} />
            <ProtectedRoute path="/analytics-reporting" element={AnalyticsReporting} allowedRoles={['admin']} role={role} />
            <ProtectedRoute path="/settings" element={Settings} allowedRoles={['student', 'teacher', 'admin']} role={role} />
            <ProtectedRoute path="/support" element={Support} allowedRoles={['student', 'teacher', 'admin']} role={role} />
          </Routes>
        </main>
      </div>
      <Footer />
    </Router>
  );
};

export default App;