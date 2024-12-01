import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import ContactUs from './pages/ContactUs';
import ResetPassword from './pages/ResetPassword';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </Router>
  );
};

// Commented out unused code for now
// const AppContent = () => {
//   const [role, setRole] = useState('');

//   useTokenValidation(setRole);

//   return (
//     <>
//       <Header />
//       <div className="flex">
//         <Sidebar role={role} />
//         <main className="flex-grow p-8 bg-gray-100">
//           <Routes>
//             <Route path="/" element={<Home />} />
//             <Route path="/login" element={<Login />} />
//             <Route path="/signup" element={<SignUp />} />
//             <Route path="/forgot-password" element={<ForgotPassword />} />
//             <Route path="/contact" element={<ContactUs />} />
//             <Route path="/reset-password" element={<ResetPassword />} />
//             <Route element={<ProtectedRoute allowedRoles={['student']} role={role} />}>
//               <Route path="/student-dashboard" element={<StudentDashboard />} />
//               <Route path="/student-attendance" element={<StudentAttendance />} />
//             </Route>
//             <Route element={<ProtectedRoute allowedRoles={['teacher']} role={role} />}>
//               <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
//               <Route path="/teacher-attendance" element={<TeacherAttendance />} />
//               <Route path="/batch-management" element={<BatchManagement />} />
//               <Route path="/grading-feedback" element={<GradingFeedback />} />
//             </Route>
//             <Route element={<ProtectedRoute allowedRoles={['admin']} role={role} />}>
//               <Route path="/admin-dashboard" element={<AdminDashboard />} />
//               <Route path="/admin-attendance" element={<AdminAttendance />} />
//               <Route path="/analytics-reporting" element={<AnalyticsReporting />} />
//             </Route>
//             <Route element={<ProtectedRoute allowedRoles={['student', 'teacher']} role={role} />}>
//               <Route path="/resources" element={<Resources />} />
//             </Route>
//             <Route element={<ProtectedRoute allowedRoles={['student', 'teacher', 'admin']} role={role} />}>
//               <Route path="/settings" element={<Settings />} />
//               <Route path="/support" element={<Support />} />
//             </Route>
//           </Routes>
//         </main>
//       </div>
//       <Footer />
//     </>
//   );
// };

export default App;