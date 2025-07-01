
import React, { useState, useCallback, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useSearchParams, useNavigate } from 'react-router-dom';


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
    <div
      className="bg-secondary text-white p-4 rounded text-center"
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
});

const EmailField = React.memo(function EmailField() {
  return (
    <div>
      <label htmlFor="email" className="text-sm font-medium text-gray-dark block">
        Email address
      </label>
      <Field
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        className="mt-1 block w-full rounded-md border border-gray-light shadow-sm focus:border-secondary focus:ring-secondary"
        aria-required="true"
        aria-label="Email address"
      />
      <ErrorMessage name="email" component="div" className="text-red-600 text-sm mt-1" />
    </div>
  );
});

const PasswordFields = React.memo(function PasswordFields() {
  return (
    <>
      <div>
        <label htmlFor="password" className="text-sm font-medium text-gray-dark block">
          New Password
        </label>
        <Field
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          className="mt-1 block w-full rounded-md border border-gray-light shadow-sm focus:border-secondary focus:ring-secondary"
          aria-required="true"
          aria-label="New password"
        />
        <ErrorMessage name="password" component="div" className="text-red-600 text-sm mt-1" />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-dark block">
          Confirm New Password
        </label>
        <Field
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          className="mt-1 block w-full rounded-md border border-gray-light shadow-sm focus:border-secondary focus:ring-secondary"
          aria-required="true"
          aria-label="Confirm new password"
        />
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
      {isSubmitting ? 'Processing...' : token ? 'Reset Password' : 'Send Reset Instructions'}
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
    <div className="min-h-screen flex items-center justify-center bg-background-light">
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
    </div>
  );
}

export default React.memo(ResetPassword);
