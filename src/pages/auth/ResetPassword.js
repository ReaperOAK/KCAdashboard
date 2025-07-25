
import React, { useState, useCallback, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';


const RequestResetSchema = Yup.object({
  email: Yup.string().email('Invalid email').required('Required'),
});

const ResetPasswordSchema = Yup.object({
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Required'),
});


// --- Subcomponents ---
const MessageBanner = React.memo(function MessageBanner({ message }) {
  if (!message) return null;
  return (
    <motion.div
      className="bg-secondary text-white p-4 rounded text-center"
      role="status"
      aria-live="polite"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {message}
    </motion.div>
  );
});

const EmailField = React.memo(function EmailField() {
  return (
    <div>
      <label htmlFor="email" className="text-sm font-medium text-gray-dark block flex items-center gap-1">
        <EnvelopeIcon className="w-4 h-4 text-accent" /> Email address
      </label>
      <div className="relative">
        <Field
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          className="mt-1 block w-full rounded-md border border-gray-light shadow-sm focus:border-secondary focus:ring-secondary pr-10"
          aria-required="true"
          aria-label="Email address"
        />
        <EnvelopeIcon className="w-5 h-5 text-gray-300 absolute right-3 top-2.5 pointer-events-none" />
      </div>
      <ErrorMessage name="email" component="div" className="text-red-600 text-sm mt-1" />
    </div>
  );
});

const PasswordFields = React.memo(function PasswordFields() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword(prev => !prev);
  }, []);

  return (
    <>
      <div>
        <label htmlFor="password" className="text-sm font-medium text-gray-dark block flex items-center gap-1">
          <LockClosedIcon className="w-4 h-4 text-accent" /> New Password
        </label>
        <div className="relative">
          <Field
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            className="mt-1 block w-full rounded-md border border-gray-light shadow-sm focus:border-secondary focus:ring-secondary pr-20"
            aria-required="true"
            aria-label="New password"
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-10 top-2.5 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeSlashIcon className="w-5 h-5" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )}
          </button>
          <LockClosedIcon className="w-5 h-5 text-gray-300 absolute right-3 top-2.5 pointer-events-none" />
        </div>
        <ErrorMessage name="password" component="div" className="text-red-600 text-sm mt-1" />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-dark block flex items-center gap-1">
          <LockClosedIcon className="w-4 h-4 text-accent" /> Confirm New Password
        </label>
        <div className="relative">
          <Field
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            className="mt-1 block w-full rounded-md border border-gray-light shadow-sm focus:border-secondary focus:ring-secondary pr-20"
            aria-required="true"
            aria-label="Confirm new password"
          />
          <button
            type="button"
            onClick={toggleConfirmPasswordVisibility}
            className="absolute right-10 top-2.5 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
            aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
          >
            {showConfirmPassword ? (
              <EyeSlashIcon className="w-5 h-5" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )}
          </button>
          <LockClosedIcon className="w-5 h-5 text-gray-300 absolute right-3 top-2.5 pointer-events-none" />
        </div>
        <ErrorMessage name="confirmPassword" component="div" className="text-red-600 text-sm mt-1" />
      </div>
    </>
  );
});

const SubmitButton = React.memo(function SubmitButton({ isSubmitting, token }) {
  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className="w-full flex justify-center py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary disabled:bg-gray-dark disabled:text-gray-light disabled:cursor-not-allowed transition-colors"
      aria-busy={isSubmitting}
    >
      {isSubmitting ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
          Processing...
        </span>
      ) : token ? 'Reset Password' : 'Send Reset Instructions'}
    </button>
  );
});

// --- Main Component ---
function ResetPassword() {
  const { requestPasswordReset, resetPassword } = useAuth();
  const [message, setMessage] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  // Memoize initial values and schema for Formik
  const initialValues = useMemo(
    () => (token ? { password: '', confirmPassword: '' } : { email: '' }),
    [token]
  );
  const validationSchema = useMemo(
    () => (token ? ResetPasswordSchema : RequestResetSchema),
    [token]
  );

  // Named handler for form submission
  const handleSubmit = useCallback(
    async (values, { setSubmitting }) => {
      try {
        if (token) {
          await resetPassword(token, values.password);
          setMessage('Password has been reset successfully');
          setTimeout(() => navigate('/login'), 2000);
        } else {
          await requestPasswordReset(values.email);
          setMessage('Password reset instructions have been sent to your email');
        }
      } catch (error) {
        setMessage(error.message || 'An error occurred. Please try again.');
      } finally {
        setSubmitting(false);
      }
    },
    [token, resetPassword, requestPasswordReset, navigate]
  );

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-background-light"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg" role="form" aria-labelledby="reset-password-title">
        <h2 id="reset-password-title" className="text-3xl font-bold text-primary text-center">
          {token ? 'Reset Your Password' : 'Request Password Reset'}
        </h2>
        <MessageBanner message={message} />
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          validateOnBlur
          validateOnChange
        >
          {({ isSubmitting }) => (
            <Form className="space-y-6" noValidate>
              {!token ? <EmailField /> : <PasswordFields />}
              <SubmitButton isSubmitting={isSubmitting} token={token} />
            </Form>
          )}
        </Formik>
      </div>
    </motion.div>
  );
}

export default React.memo(ResetPassword);
