import React, { useState, useCallback, useMemo } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCircleIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';

// Schema for profile form
const ProfileSchema = Yup.object({
  full_name: Yup.string().required('Full name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
});

// Message banner for feedback (animated, ARIA live)
const MessageBanner = React.memo(function MessageBanner({ message, type = 'info' }) {
  if (!message) return null;
  const base = 'mb-4 p-4 rounded font-medium flex items-center gap-2 shadow';
  const color = type === 'error'
    ? 'bg-red-700 border border-red-800 text-white'
    : 'bg-secondary border border-accent text-white';
  const Icon = type === 'error' ? ExclamationCircleIcon : CheckCircleIcon;
  return (
    <AnimatePresence>
      <motion.div
        key={type + message}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className={`${base} ${color}`}
        role="status"
        aria-live="polite"
      >
        <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
        <span>{message}</span>
      </motion.div>
    </AnimatePresence>
  );
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
          className="mt-1 block w-full rounded-md border border-gray-light bg-background-light text-text-dark shadow-sm focus:border-secondary focus:ring-2 focus:ring-accent focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 transition-colors"
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
          className="mt-1 block w-full rounded-md border border-gray-light bg-background-light text-text-dark shadow-sm focus:border-secondary focus:ring-2 focus:ring-accent focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 transition-colors"
          aria-required="true"
        />
        <ErrorMessage name="email" component="div" className="text-red-600 text-xs mt-1" />
      </div>
    </>
  );
});

// Submit button (with spinner)
const SubmitButton = React.memo(function SubmitButton({ isSubmitting }) {
  return (

    <button
      type="submit"
      disabled={isSubmitting}
      className="w-full flex justify-center items-center gap-2 py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors disabled:bg-gray-dark disabled:text-gray-light disabled:cursor-not-allowed"
      aria-busy={isSubmitting}
    >
      {isSubmitting && (
        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
      )}
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
    <div className="min-h-screen bg-gradient-to-br from-background-light via-white to-background-light py-4 sm:py-8 px-2 sm:px-0">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="max-w-2xl mx-auto bg-white border border-accent/30 rounded-xl shadow-lg p-4 sm:p-8 relative"
      >
        <div className="flex flex-col items-center mb-6">
          <UserCircleIcon className="h-16 w-16 text-primary mb-2" aria-hidden="true" />
          <h1 className="text-3xl font-bold text-primary">Profile</h1>
        </div>
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
      </motion.div>
    </div>
  );
}
