import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ResetPassword from '../pages/auth/ResetPassword';
import LichessCallback from '../components/LichessCallback';
// Remove the import for ForgotPassword since we'll reuse ResetPassword

const publicRoutes = [
  {
    path: '/login',
    element: Login,
    title: 'Login'
  },
  {
    path: '/register',
    element: Register,
    title: 'Register'
  },
  {
    path: '/reset-password',
    element: ResetPassword,
    title: 'Reset Password'
  },
  {
    path: '/forgot-password',
    element: ResetPassword, // Reuse the ResetPassword component
    title: 'Forgot Password'
  },
  {
    path: '/lichess-callback',
    element: LichessCallback,
    title: 'Connecting to Lichess'
  }
];

export default publicRoutes;
