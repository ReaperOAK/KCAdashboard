import React, { useState, useCallback, useMemo } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../hooks/useAuth';

// Schema for profile form
const ProfileSchema = Yup.object({
  full_name: Yup.string().required('Full name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
});

// Message banner for feedback
const MessageBanner = React.memo(function MessageBanner({ message, type = 'info' }) {
  if (!message) return null;
  const base = 'mb-4 p-4 rounded font-medium';
  const color = type === 'error'
    ? 'bg-red-700 border border-red-800 text-white'
    : 'bg-secondary border border-accent text-white';
  return <div className={`${base} ${color}`} role="status">{message}</div>;
});

// Profile form fields
const ProfileFields = React.memo(function ProfileFields() {
  return (
    <>
      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-text-dark mb-1">
          Full Name
        </label>
        <Field
          id="full_name"
          name="full_name"
          type="text"
          autoComplete="name"
          className="mt-1 block w-full rounded-md border border-gray-light bg-background-light text-text-dark shadow-sm focus:border-secondary focus:ring-2 focus:ring-accent focus:outline-none transition-colors"
          aria-required="true"
        />
        <ErrorMessage name="full_name" component="div" className="text-red-600 text-xs mt-1" />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-text-dark mb-1">
          Email
        </label>
        <Field
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          className="mt-1 block w-full rounded-md border border-gray-light bg-background-light text-text-dark shadow-sm focus:border-secondary focus:ring-2 focus:ring-accent focus:outline-none transition-colors"
          aria-required="true"
        />
        <ErrorMessage name="email" component="div" className="text-red-600 text-xs mt-1" />
      </div>
    </>
  );
});

// Submit button
const SubmitButton = React.memo(function SubmitButton({ isSubmitting }) {
  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className="w-full flex justify-center py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors disabled:bg-gray-dark disabled:text-gray-light disabled:cursor-not-allowed"
      aria-busy={isSubmitting}
    >
      {isSubmitting ? 'Updating...' : 'Update Profile'}
    </button>
  );
});

// Main profile component
export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [message, setMessage] = useState('');

  const initialValues = useMemo(() => ({
    full_name: user?.full_name || '',
    email: user?.email || '',
  }), [user]);

  const handleSubmit = useCallback(async (values, { setSubmitting, setErrors }) => {
    setMessage('');
    try {
      await updateProfile(values);
      setMessage('Profile updated successfully');
    } catch (error) {
      setMessage(error.message || 'Failed to update profile');
      setErrors && setErrors({ email: error.field === 'email' ? error.message : undefined });
    } finally {
      setSubmitting(false);
    }
  }, [updateProfile]);

  return (
    <div className="min-h-screen bg-background-light py-4 sm:py-8 px-2 sm:px-0">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-4 sm:p-8">
        <h1 className="text-3xl font-bold text-primary mb-6">Profile</h1>
        <MessageBanner message={message} type={message?.toLowerCase().includes('success') ? 'info' : 'error'} />
        <Formik
          initialValues={initialValues}
          validationSchema={ProfileSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting }) => (
            <Form className="space-y-6" aria-label="Profile form">
              <ProfileFields />
              <SubmitButton isSubmitting={isSubmitting} />
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
