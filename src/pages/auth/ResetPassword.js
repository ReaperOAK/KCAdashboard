import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useSearchParams, useNavigate } from 'react-router-dom';

const RequestResetSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
});

const ResetPasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Required'),
});

const ResetPassword = () => {
  const { requestPasswordReset, resetPassword } = useAuth();
  const [message, setMessage] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (token) {
        // Reset password with token
        await resetPassword(token, values.password);
        setMessage('Password has been reset successfully');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        // Request password reset
        await requestPasswordReset(values.email);
        setMessage('Password reset instructions have been sent to your email');
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f1f9]">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-[#200e4a]">
          {token ? 'Reset Your Password' : 'Request Password Reset'}
        </h2>
        
        {message && (
          <div className="bg-[#461fa3] text-white p-4 rounded">
            {message}
          </div>
        )}

        <Formik
          initialValues={token ? { password: '', confirmPassword: '' } : { email: '' }}
          validationSchema={token ? ResetPasswordSchema : RequestResetSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, handleChange, isSubmitting }) => (
            <Form className="space-y-6">
              {!token ? (
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={values.email}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
                  />
                  {touched.email && errors.email && (
                    <div className="text-red-500 text-sm mt-1">{errors.email}</div>
                  )}
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={values.password}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
                    />
                    {touched.password && errors.password && (
                      <div className="text-red-500 text-sm mt-1">{errors.password}</div>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={values.confirmPassword}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
                    />
                    {touched.confirmPassword && errors.confirmPassword && (
                      <div className="text-red-500 text-sm mt-1">{errors.confirmPassword}</div>
                    )}
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#200e4a] hover:bg-[#461fa3] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#461fa3]"
              >
                {isSubmitting ? 'Processing...' : (token ? 'Reset Password' : 'Send Reset Instructions')}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default ResetPassword;
