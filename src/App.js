import React from 'react';
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

const App = () => {
  return (
    <Router>
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-grow p-8 bg-gray-100">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/student-dashboard" element={<StudentDashboard />} />
            <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/student-attendance" element={<StudentAttendance />} />
            <Route path="/teacher-attendance" element={<TeacherAttendance />} />
            <Route path="/admin-attendance" element={<AdminAttendance />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/grading-feedback" element={<GradingFeedback />} />
            <Route path="/batch-management" element={<BatchManagement />} />
            <Route path="/analytics-reporting" element={<AnalyticsReporting />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/support" element={<Support />} />
          </Routes>
        </main>
      </div>
      <Footer />
    </Router>
  );
};

export default App;