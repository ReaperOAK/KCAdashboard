
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import { NotificationsApi } from '../../api/notifications';
import { BellIcon, EnvelopeIcon, ArrowPathIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

// Memoized switch component for toggles (with icon)
const ToggleSwitch = React.memo(function ToggleSwitch({ checked, onChange, label, id, icon }) {
  const Icon = icon;
  return (
    <label className="inline-flex items-center cursor-pointer" htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={onChange}
        aria-checked={checked}
        tabIndex={0}
      />
      <div className={`w-11 h-6 rounded-full transition-colors duration-200 flex items-center ${checked ? 'bg-secondary' : 'bg-gray-light'}`}
        aria-hidden="true"
      >
        <div className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-1'}`}></div>
      </div>
      {Icon && <Icon className="h-4 w-4 ml-2 text-gray-dark" aria-hidden="true" />}
      {label && <span className="sr-only">{label}</span>}
    </label>
  );
});

// Memoized table row for preferences (with animation)
const PreferenceRow = React.memo(function PreferenceRow({ pref, index, onToggle }) {
  return (
    <motion.tr
      className={pref.is_default ? 'bg-gray-light/30' : ''}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-text-dark flex items-center gap-2">
          <BellIcon className="h-5 w-5 text-primary" aria-hidden="true" />
          {pref.label}
        </div>
        <div className="text-sm text-gray-dark">{pref.description}</div>
        {pref.is_default && (
          <span className="text-xs text-gray-dark/70 italic">Default settings</span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <ToggleSwitch
          checked={pref.in_app}
          onChange={() => onToggle(index, 'in_app')}
          label={`Toggle in-app for ${pref.label}`}
          id={`inapp-${pref.category}`}
          icon={BellIcon}
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <ToggleSwitch
          checked={pref.email}
          onChange={() => onToggle(index, 'email')}
          label={`Toggle email for ${pref.label}`}
          id={`email-${pref.category}`}
          icon={EnvelopeIcon}
        />
      </td>
    </motion.tr>
  );
});

// Memoized loading spinner

const LoadingSpinner = React.memo(function LoadingSpinner() {
  return (
    <div className="flex flex-col justify-center items-center h-64" role="status" aria-label="Loading preferences">
      <ArrowPathIcon className="animate-spin h-12 w-12 text-secondary mb-2" aria-label="Loading" />
      <span className="text-secondary">Loading preferences...</span>
    </div>
  );
});

// Memoized action buttons for toggling all
const BulkToggleButtons = React.memo(function BulkToggleButtons({ onInApp, onEmail }) {
  return (
    <div className="flex flex-wrap gap-4 mb-6 justify-between items-center">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onInApp(true)}
          className="px-3 py-1 text-sm bg-secondary text-white rounded hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors"
        >
          Enable All In-App
        </button>
        <button
          type="button"
          onClick={onInApp(false)}
          className="px-3 py-1 text-sm bg-gray-light text-text-dark rounded hover:bg-gray-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors"
        >
          Disable All In-App
        </button>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onEmail(true)}
          className="px-3 py-1 text-sm bg-secondary text-white rounded hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors"
        >
          Enable All Email
        </button>
        <button
          type="button"
          onClick={onEmail(false)}
          className="px-3 py-1 text-sm bg-gray-light text-text-dark rounded hover:bg-gray-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors"
        >
          Disable All Email
        </button>
      </div>
    </div>
  );
});


// Memoized save button (with icon)
const SaveButton = React.memo(function SaveButton({ onClick, saving }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={saving}
      className={`px-6 py-2 bg-secondary text-white rounded-md hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors flex items-center gap-2 ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
      aria-busy={saving}
    >
      {saving && <ArrowPathIcon className="animate-spin h-5 w-5" aria-hidden="true" />}
      {saving ? 'Saving...' : <><CheckCircleIcon className="h-5 w-5 text-white" aria-hidden="true" /> Save Preferences</>}
    </button>
  );
});

// Main notification preferences component
export default function NotificationPreferences() {
  const [preferences, setPreferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const categories = useMemo(() => [
    { id: 'general', label: 'General Notifications', description: 'System updates and general announcements' },
    { id: 'class', label: 'Class Notifications', description: 'Upcoming classes and schedule changes' },
    { id: 'tournament', label: 'Tournament Notifications', description: 'Tournament invitations and updates' },
    { id: 'assignment', label: 'Assignment Notifications', description: 'New assignments and due dates' },
    { id: 'attendance', label: 'Attendance Notifications', description: 'Attendance alerts and reminders' },
    { id: 'announcement', label: 'Announcements', description: 'Important announcements from administrators' },
    { id: 'achievement', label: 'Achievement Notifications', description: 'Badges, awards, and milestones' }
  ], []);

  const fetchPreferences = useCallback(async () => {
    setLoading(true);
    try {
      const response = await NotificationsApi.getPreferences();
      const preferenceMap = {};
      response.preferences.forEach(pref => {
        preferenceMap[pref.category] = pref;
      });
      setPreferences(categories.map(category => ({
        category: category.id,
        label: category.label,
        description: category.description,
        in_app: preferenceMap[category.id]?.in_app ?? true,
        email: preferenceMap[category.id]?.email ?? true,
        is_default: preferenceMap[category.id]?.is_default ?? false
      })));
    } catch (error) {
      toast.error('Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  }, [categories]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  // Toggle a single preference
  const handleToggle = useCallback((index, field) => {
    setPreferences(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: !updated[index][field] };
      return updated;
    });
  }, []);

  // Save preferences
  const handleSavePreferences = useCallback(async () => {
    setSaving(true);
    try {
      const apiPreferences = preferences.map(pref => ({
        category: pref.category,
        in_app: pref.in_app,
        email: pref.email
      }));
      await NotificationsApi.updatePreferences(apiPreferences);
      toast.success('Notification preferences updated successfully');
    } catch (error) {
      toast.error('Failed to save notification preferences');
    } finally {
      setSaving(false);
    }
  }, [preferences]);

  // Bulk toggle helpers (return handler to avoid inline in JSX)
  const bulkToggleHandler = useCallback((field) => (enable) => () => {
    setPreferences(prev => prev.map(pref => ({ ...pref, [field]: enable })));
  }, []);


  if (loading) return <LoadingSpinner />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-accent/10">
        <div className="p-6 bg-primary text-white flex items-center gap-3">
          <BellIcon className="h-8 w-8 text-white" aria-hidden="true" />
          <div>
            <h1 className="text-2xl font-bold">Notification Preferences</h1>
            <p className="text-gray-light mt-2">Customize how you want to receive notifications</p>
          </div>
        </div>
        <div className="p-6">
          <BulkToggleButtons onInApp={bulkToggleHandler('in_app')} onEmail={bulkToggleHandler('email')} />
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-light" role="table" aria-label="Notification Preferences">
              <thead className="bg-background-light">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-dark uppercase tracking-wider">Notification Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-dark uppercase tracking-wider">In-App</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-dark uppercase tracking-wider">Email</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-light">
                <AnimatePresence>
                  {preferences.map((pref, index) => (
                    <PreferenceRow key={pref.category} pref={pref} index={index} onToggle={handleToggle} />
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex justify-end">
            <SaveButton onClick={handleSavePreferences} saving={saving} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
