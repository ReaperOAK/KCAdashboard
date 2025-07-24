import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../hooks/useAuth';
import { AuthApi } from '../api/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserCircleIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  PhotoIcon,
  DocumentTextIcon,
  LinkIcon,
  StarIcon,
  CalendarIcon,
  PhoneIcon,
  IdentificationIcon,
  AcademicCapIcon
} from '@heroicons/react/24/solid';

// Enhanced schema for profile form
const ProfileSchema = Yup.object({
  full_name: Yup.string().required('Full name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  fide_id: Yup.string()
    .matches(/^[0-9]{5,10}$/, 'FIDE ID must be 5-10 digits')
    .nullable(),
  fide_rating: Yup.number()
    .min(0, 'Rating must be positive')
    .max(3500, 'Rating cannot exceed 3500')
    .nullable(),
  national_rating: Yup.number()
    .min(0, 'Rating must be positive')
    .max(3500, 'Rating cannot exceed 3500')
    .nullable(),
  date_of_birth: Yup.date()
    .max(new Date(), 'Date of birth cannot be in the future')
    .nullable(),
  phone_number: Yup.string()
    .matches(/^[+]?[0-9\s\-()]{10,15}$/, 'Invalid phone number format')
    .nullable(),
  bio: Yup.string().max(500, 'Bio cannot exceed 500 characters').nullable(),
  achievements: Yup.string().max(1000, 'Achievements cannot exceed 1000 characters').nullable(),
  experience_years: Yup.number()
    .min(0, 'Experience cannot be negative')
    .max(100, 'Experience cannot exceed 100 years')
    .nullable(),
  coaching_since: Yup.date()
    .max(new Date(), 'Coaching start date cannot be in the future')
    .nullable(),
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

// Profile picture upload component
const ProfilePictureUpload = React.memo(function ProfilePictureUpload({ currentPicture, onUpload, isUploading }) {
  const fileInputRef = useRef(null);

  const handleFileSelect = useCallback(async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', 'profile_picture');
      await onUpload(formData);
    }
  }, [onUpload]);

  return (
    <div className="flex flex-col items-center mb-6">
      <div className="relative mb-4">
        {currentPicture ? (
          <img
            src={`/api/${currentPicture}`}
            alt="Profile"
            className="h-24 w-24 rounded-full object-cover border-4 border-primary shadow-lg"
          />
        ) : (
          <UserCircleIcon className="h-24 w-24 text-gray-400" />
        )}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="absolute bottom-0 right-0 bg-primary hover:bg-secondary rounded-full p-2 shadow-lg transition-colors disabled:opacity-50"
        >
          <PhotoIcon className="h-4 w-4 text-white" />
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      <p className="text-sm text-gray-600 text-center">
        Click the camera icon to upload a profile picture
        <br />
        <span className="text-red-600 font-medium">* Profile picture is mandatory</span>
      </p>
    </div>
  );
});

// FIDE ID lookup component
const FIDELookup = React.memo(function FIDELookup({ fideId, onLookup }) {
  const [lookupResult, setLookupResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLookup = useCallback(async () => {
    if (fideId && fideId.length >= 5) {
      setIsLoading(true);
      try {
        const result = await AuthApi.fideLookup(fideId);
        setLookupResult(result.player_data);
        onLookup(result.player_data);
      } catch (error) {
        setLookupResult({ error: error.message });
      } finally {
        setIsLoading(false);
      }
    }
  }, [fideId, onLookup]);

  const fideProfileUrl = fideId ? `https://ratings.fide.com/profile/${fideId}` : null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleLookup}
          disabled={!fideId || fideId.length < 5 || isLoading}
          className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LinkIcon className="h-4 w-4" />
          {isLoading ? 'Looking up...' : 'Lookup FIDE'}
        </button>
        {fideProfileUrl && (
          <a
            href={fideProfileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded"
          >
            <LinkIcon className="h-4 w-4" />
            View FIDE Profile
          </a>
        )}
      </div>
      
      {lookupResult && (
        <div className="p-3 bg-gray-50 rounded border">
          {lookupResult.error ? (
            <p className="text-red-600 text-sm">{lookupResult.error}</p>
          ) : (
            <div className="text-sm">
              <p><strong>Name:</strong> {lookupResult.name || 'Not found'}</p>
              <p><strong>Country:</strong> {lookupResult.country || 'Not found'}</p>
              <p><strong>Standard Rating:</strong> {lookupResult.standard_rating || 'Not found'}</p>
              {lookupResult.title && <p><strong>Title:</strong> {lookupResult.title}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

// Document upload component for DOB certificate
const DocumentUpload = React.memo(function DocumentUpload({ documentType, currentDocument, onUpload, isUploading, isMandatory = false }) {
  const fileInputRef = useRef(null);

  const handleFileSelect = useCallback(async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', documentType);
      await onUpload(formData);
    }
  }, [onUpload, documentType]);

  const documentLabels = {
    'dob_certificate': 'Date of Birth Certificate',
    'id_proof': 'ID Proof',
    'other': 'Other Document'
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-text-dark">
          {documentLabels[documentType] || documentType}
          {isMandatory && <span className="text-red-600 ml-1">*</span>}
        </label>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-1 px-3 py-1 text-sm bg-primary hover:bg-secondary text-white rounded disabled:opacity-50"
        >
          <DocumentTextIcon className="h-4 w-4" />
          {currentDocument ? 'Replace' : 'Upload'}
        </button>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {currentDocument && (
        <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded">
          <CheckCircleIcon className="h-4 w-4 text-green-600" />
          <span className="text-sm text-green-800">Document uploaded</span>
          <a
            href={`/api/${currentDocument}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-sm underline ml-auto"
          >
            View
          </a>
        </div>
      )}
      
      {isMandatory && !currentDocument && (
        <p className="text-red-600 text-xs">This document is mandatory for students</p>
      )}
    </div>
  );
});

// Enhanced profile form fields
const ProfileFields = React.memo(function ProfileFields({ values, user }) {
  const isStudent = user?.role === 'student';
  const isTeacher = user?.role === 'teacher';

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
          <IdentificationIcon className="h-5 w-5" />
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-text-dark mb-1">
              Full Name <span className="text-red-600">*</span>
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
              Email <span className="text-red-600">*</span>
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
          
          <div>
            <label htmlFor="phone_number" className="block text-sm font-medium text-text-dark mb-1">
              <PhoneIcon className="h-4 w-4 inline mr-1" />
              Phone Number
            </label>
            <Field
              id="phone_number"
              name="phone_number"
              type="tel"
              autoComplete="tel"
              placeholder="+1 (555) 123-4567"
              className="mt-1 block w-full rounded-md border border-gray-light bg-background-light text-text-dark shadow-sm focus:border-secondary focus:ring-2 focus:ring-accent focus:outline-none transition-colors"
            />
            <ErrorMessage name="phone_number" component="div" className="text-red-600 text-xs mt-1" />
          </div>
          
          <div>
            <label htmlFor="date_of_birth" className="block text-sm font-medium text-text-dark mb-1">
              <CalendarIcon className="h-4 w-4 inline mr-1" />
              Date of Birth {isStudent && <span className="text-red-600">*</span>}
            </label>
            <Field
              id="date_of_birth"
              name="date_of_birth"
              type="date"
              className="mt-1 block w-full rounded-md border border-gray-light bg-background-light text-text-dark shadow-sm focus:border-secondary focus:ring-2 focus:ring-accent focus:outline-none transition-colors"
            />
            <ErrorMessage name="date_of_birth" component="div" className="text-red-600 text-xs mt-1" />
          </div>
        </div>
      </div>

      {/* Chess Information */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
          <StarIcon className="h-5 w-5" />
          Chess Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="fide_id" className="block text-sm font-medium text-text-dark mb-1">
              FIDE ID
            </label>
            <Field
              id="fide_id"
              name="fide_id"
              type="text"
              placeholder="12345678"
              className="mt-1 block w-full rounded-md border border-gray-light bg-background-light text-text-dark shadow-sm focus:border-secondary focus:ring-2 focus:ring-accent focus:outline-none transition-colors"
            />
            <ErrorMessage name="fide_id" component="div" className="text-red-600 text-xs mt-1" />
            {values.fide_id && (
              <div className="mt-2">
                <FIDELookup 
                  fideId={values.fide_id} 
                  onLookup={(data) => {
                    if (data.standard_rating) {
                      // Auto-fill FIDE rating if found
                      document.getElementById('fide_rating').value = data.standard_rating;
                    }
                  }}
                />
              </div>
            )}
          </div>
          
          <div>
            <label htmlFor="fide_rating" className="block text-sm font-medium text-text-dark mb-1">
              FIDE Rating
            </label>
            <Field
              id="fide_rating"
              name="fide_rating"
              type="number"
              min="0"
              max="3500"
              placeholder="1500"
              className="mt-1 block w-full rounded-md border border-gray-light bg-background-light text-text-dark shadow-sm focus:border-secondary focus:ring-2 focus:ring-accent focus:outline-none transition-colors"
            />
            <ErrorMessage name="fide_rating" component="div" className="text-red-600 text-xs mt-1" />
          </div>
          
          <div>
            <label htmlFor="national_rating" className="block text-sm font-medium text-text-dark mb-1">
              National Rating
            </label>
            <Field
              id="national_rating"
              name="national_rating"
              type="number"
              min="0"
              max="3500"
              placeholder="1500"
              className="mt-1 block w-full rounded-md border border-gray-light bg-background-light text-text-dark shadow-sm focus:border-secondary focus:ring-2 focus:ring-accent focus:outline-none transition-colors"
            />
            <ErrorMessage name="national_rating" component="div" className="text-red-600 text-xs mt-1" />
          </div>
        </div>
      </div>

      {/* Teacher-specific fields */}
      {isTeacher && (
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
            <AcademicCapIcon className="h-5 w-5" />
            Coaching Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="experience_years" className="block text-sm font-medium text-text-dark mb-1">
                Years of Experience
              </label>
              <Field
                id="experience_years"
                name="experience_years"
                type="number"
                min="0"
                max="100"
                placeholder="5"
                className="mt-1 block w-full rounded-md border border-gray-light bg-background-light text-text-dark shadow-sm focus:border-secondary focus:ring-2 focus:ring-accent focus:outline-none transition-colors"
              />
              <ErrorMessage name="experience_years" component="div" className="text-red-600 text-xs mt-1" />
            </div>
            
            <div>
              <label htmlFor="coaching_since" className="block text-sm font-medium text-text-dark mb-1">
                Coaching Since
              </label>
              <Field
                id="coaching_since"
                name="coaching_since"
                type="date"
                className="mt-1 block w-full rounded-md border border-gray-light bg-background-light text-text-dark shadow-sm focus:border-secondary focus:ring-2 focus:ring-accent focus:outline-none transition-colors"
              />
              <ErrorMessage name="coaching_since" component="div" className="text-red-600 text-xs mt-1" />
            </div>
          </div>
        </div>
      )}

      {/* Bio and Additional Information */}
      <div className="bg-purple-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-primary mb-4">
          Additional Information
        </h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-text-dark mb-1">
              Bio
            </label>
            <Field
              as="textarea"
              id="bio"
              name="bio"
              rows="3"
              placeholder="Tell us about yourself..."
              className="mt-1 block w-full rounded-md border border-gray-light bg-background-light text-text-dark shadow-sm focus:border-secondary focus:ring-2 focus:ring-accent focus:outline-none transition-colors resize-none"
            />
            <ErrorMessage name="bio" component="div" className="text-red-600 text-xs mt-1" />
          </div>
          
          <div>
            <label htmlFor="achievements" className="block text-sm font-medium text-text-dark mb-1">
              Achievements
            </label>
            <Field
              as="textarea"
              id="achievements"
              name="achievements"
              rows="3"
              placeholder="List your chess achievements..."
              className="mt-1 block w-full rounded-md border border-gray-light bg-background-light text-text-dark shadow-sm focus:border-secondary focus:ring-2 focus:ring-accent focus:outline-none transition-colors resize-none"
            />
            <ErrorMessage name="achievements" component="div" className="text-red-600 text-xs mt-1" />
          </div>
          
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-text-dark mb-1">
              Address
            </label>
            <Field
              as="textarea"
              id="address"
              name="address"
              rows="2"
              placeholder="Your address..."
              className="mt-1 block w-full rounded-md border border-gray-light bg-background-light text-text-dark shadow-sm focus:border-secondary focus:ring-2 focus:ring-accent focus:outline-none transition-colors resize-none"
            />
            <ErrorMessage name="address" component="div" className="text-red-600 text-xs mt-1" />
          </div>
        </div>
      </div>

      {/* Emergency Contact (for students) */}
      {isStudent && (
        <div className="bg-orange-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-primary mb-4">
            Emergency Contact
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="emergency_contact_name" className="block text-sm font-medium text-text-dark mb-1">
                Emergency Contact Name
              </label>
              <Field
                id="emergency_contact_name"
                name="emergency_contact_name"
                type="text"
                placeholder="Parent/Guardian name"
                className="mt-1 block w-full rounded-md border border-gray-light bg-background-light text-text-dark shadow-sm focus:border-secondary focus:ring-2 focus:ring-accent focus:outline-none transition-colors"
              />
              <ErrorMessage name="emergency_contact_name" component="div" className="text-red-600 text-xs mt-1" />
            </div>
            
            <div>
              <label htmlFor="emergency_contact_phone" className="block text-sm font-medium text-text-dark mb-1">
                Emergency Contact Phone
              </label>
              <Field
                id="emergency_contact_phone"
                name="emergency_contact_phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                className="mt-1 block w-full rounded-md border border-gray-light bg-background-light text-text-dark shadow-sm focus:border-secondary focus:ring-2 focus:ring-accent focus:outline-none transition-colors"
              />
              <ErrorMessage name="emergency_contact_phone" component="div" className="text-red-600 text-xs mt-1" />
            </div>
          </div>
        </div>
      )}
    </div>
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
  const [isUploading, setIsUploading] = useState(false);

  const initialValues = useMemo(() => ({
    full_name: user?.full_name || '',
    email: user?.email || '',
    fide_id: user?.fide_id || '',
    fide_rating: user?.fide_rating || '',
    national_rating: user?.national_rating || '',
    date_of_birth: user?.date_of_birth || '',
    phone_number: user?.phone_number || '',
    bio: user?.bio || '',
    achievements: user?.achievements || '',
    specializations: user?.specializations || [],
    experience_years: user?.experience_years || '',
    coaching_since: user?.coaching_since || '',
    address: user?.address || '',
    emergency_contact_name: user?.emergency_contact_name || '',
    emergency_contact_phone: user?.emergency_contact_phone || '',
  }), [user]);

  const handleSubmit = useCallback(async (values, { setSubmitting, setErrors }) => {
    setMessage('');
    try {
      // Check mandatory fields for students
      if (user?.role === 'student') {
        if (!values.date_of_birth) {
          throw new Error('Date of birth is required for students');
        }
        if (!user?.profile_picture_url) {
          throw new Error('Profile picture is mandatory');
        }
        if (!user?.dob_certificate_url) {
          throw new Error('Date of birth certificate is mandatory for students');
        }
      }

      await updateProfile(values);
      setMessage('Profile updated successfully');
    } catch (error) {
      setMessage(error.message || 'Failed to update profile');
      setErrors && setErrors({ email: error.field === 'email' ? error.message : undefined });
    } finally {
      setSubmitting(false);
    }
  }, [updateProfile, user]);

  const handleDocumentUpload = useCallback(async (formData) => {
    setIsUploading(true);
    try {
      const response = await AuthApi.uploadDocument(formData);
      if (response.success) {
        setMessage('Document uploaded successfully');
        // Refresh user data to get the updated document URLs
        window.location.reload(); // Simple refresh for now
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      setMessage(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-light via-white to-background-light py-4 sm:py-8 px-2 sm:px-0">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="max-w-4xl mx-auto bg-white border border-accent/30 rounded-xl shadow-lg p-4 sm:p-8 relative"
      >
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-primary mb-2">Enhanced Profile</h1>
          <p className="text-gray-600">
            Complete your profile with chess information and documents
          </p>
        </div>

        {/* Profile Picture Upload */}
        <ProfilePictureUpload
          currentPicture={user?.profile_picture_url}
          onUpload={handleDocumentUpload}
          isUploading={isUploading}
        />

        <MessageBanner 
          message={message} 
          type={message?.toLowerCase().includes('success') ? 'info' : 'error'} 
        />

        <Formik
          initialValues={initialValues}
          validationSchema={ProfileSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting, values }) => (
            <Form className="space-y-6" aria-label="Enhanced profile form">
              <ProfileFields values={values} user={user} />
              
              {/* Document Uploads */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                  <DocumentTextIcon className="h-5 w-5" />
                  Document Uploads
                </h3>
                <div className="space-y-4">
                  {user?.role === 'student' && (
                    <DocumentUpload
                      documentType="dob_certificate"
                      currentDocument={user?.dob_certificate_url}
                      onUpload={handleDocumentUpload}
                      isUploading={isUploading}
                      isMandatory={true}
                    />
                  )}
                  
                  <DocumentUpload
                    documentType="id_proof"
                    currentDocument={user?.id_proof_url}
                    onUpload={handleDocumentUpload}
                    isUploading={isUploading}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <SubmitButton isSubmitting={isSubmitting || isUploading} />
            </Form>
          )}
        </Formik>

        {/* Profile Completion Status */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold text-primary mb-2">Profile Completion</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {user?.profile_picture_url ? (
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
              ) : (
                <ExclamationCircleIcon className="h-5 w-5 text-red-600" />
              )}
              <span className={user?.profile_picture_url ? 'text-green-800' : 'text-red-800'}>
                Profile Picture {user?.profile_picture_url ? '✓' : '(Required)'}
              </span>
            </div>
            
            {user?.role === 'student' && (
              <div className="flex items-center gap-2">
                {user?.dob_certificate_url ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                ) : (
                  <ExclamationCircleIcon className="h-5 w-5 text-red-600" />
                )}
                <span className={user?.dob_certificate_url ? 'text-green-800' : 'text-red-800'}>
                  DOB Certificate {user?.dob_certificate_url ? '✓' : '(Required for Students)'}
                </span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              {user?.fide_id ? (
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
              ) : (
                <ExclamationCircleIcon className="h-5 w-5 text-yellow-600" />
              )}
              <span className={user?.fide_id ? 'text-green-800' : 'text-yellow-800'}>
                FIDE ID {user?.fide_id ? '✓' : '(Optional)'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
