import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';

const ResetPasswordSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
});

const ResetPassword = () => {
  const { requestPasswordReset } = useAuth();
  const [message, setMessage] = useState('');

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await requestPasswordReset(values.email);
      setMessage('Password reset instructions have been sent to your email');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f1f9]">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-[#200e4a]">Reset Password</h2>
        
        {message && (
          <div className="bg-[#461fa3] text-white p-4 rounded">
            {message}
          </div>
        )}

        <Formik
          initialValues={{ email: '' }}
          validationSchema={ResetPasswordSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, handleChange, isSubmitting }) => (
            <Form className="space-y-6">
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

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#200e4a] hover:bg-[#461fa3] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#461fa3]"
              >
                {isSubmitting ? 'Sending...' : 'Reset Password'}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default ResetPassword;
