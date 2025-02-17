import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../hooks/useAuth';

const ProfileSchema = Yup.object().shape({
  full_name: Yup.string().required('Required'),
  email: Yup.string().email('Invalid email').required('Required'),
});

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [message, setMessage] = useState('');

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await updateProfile(values);
      setMessage('Profile updated successfully');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f1f9] py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-[#200e4a] mb-6">Profile</h1>
        
        {message && (
          <div className="mb-4 p-4 rounded bg-[#461fa3] text-white">
            {message}
          </div>
        )}

        <Formik
          initialValues={{
            full_name: user?.full_name || '',
            email: user?.email || '',
          }}
          validationSchema={ProfileSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, handleChange, isSubmitting }) => (
            <Form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={values.full_name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
                />
                {touched.full_name && errors.full_name && (
                  <div className="text-red-500 text-sm mt-1">{errors.full_name}</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
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
                {isSubmitting ? 'Updating...' : 'Update Profile'}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Profile;
