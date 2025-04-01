import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import ApiService from '../../utils/api';

const NotificationPreferences = () => {
  const [preferences, setPreferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Use useMemo to prevent categories array recreation on every render
  const categories = useMemo(() => [
    { id: 'general', label: 'General Notifications', description: 'System updates and general announcements' },
    { id: 'class', label: 'Class Notifications', description: 'Upcoming classes and schedule changes' },
    { id: 'tournament', label: 'Tournament Notifications', description: 'Tournament invitations and updates' },
    { id: 'assignment', label: 'Assignment Notifications', description: 'New assignments and due dates' },
    { id: 'attendance', label: 'Attendance Notifications', description: 'Attendance alerts and reminders' },
    { id: 'announcement', label: 'Announcements', description: 'Important announcements from administrators' },
    { id: 'achievement', label: 'Achievement Notifications', description: 'Badges, awards, and milestones' }
  ], []); // Empty dependency array means it's only calculated once
  
  const fetchPreferences = useCallback(async () => {
    try {
      setLoading(true);
      const response = await ApiService.get('/notifications/get-preferences.php');
      
      // Map the preferences to our UI state - Moved inside the callback
      const mapPreferencesToState = (apiPreferences) => {
        // Create a map of existing preferences
        const preferenceMap = {};
        apiPreferences.forEach(pref => {
          preferenceMap[pref.category] = pref;
        });
        
        // Return a properly formatted array for all supported categories
        return categories.map(category => ({
          category: category.id,
          label: category.label,
          description: category.description,
          in_app: preferenceMap[category.id]?.in_app ?? true,
          email: preferenceMap[category.id]?.email ?? true,
          is_default: preferenceMap[category.id]?.is_default ?? false
        }));
      };
      
      const mapped = mapPreferencesToState(response.preferences);
      setPreferences(mapped);
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      toast.error('Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  }, [categories]); // categories is now memoized, so this dependency is stable
  
  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);
  
  const handleToggle = (index, field) => {
    const newPreferences = [...preferences];
    newPreferences[index][field] = !newPreferences[index][field];
    setPreferences(newPreferences);
  };
  
  const handleSavePreferences = async () => {
    try {
      setSaving(true);
      
      // Format preferences for API
      const apiPreferences = preferences.map(pref => ({
        category: pref.category,
        in_app: pref.in_app,
        email: pref.email
      }));
      
      await ApiService.post('/notifications/update-preferences.php', {
        preferences: apiPreferences
      });
      
      toast.success('Notification preferences updated successfully');
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      toast.error('Failed to save notification preferences');
    } finally {
      setSaving(false);
    }
  };
  
  // Enable/disable all in-app notifications
  const toggleAllInApp = (enable) => {
    setPreferences(preferences.map(pref => ({
      ...pref,
      in_app: enable
    })));
  };
  
  // Enable/disable all email notifications
  const toggleAllEmail = (enable) => {
    setPreferences(preferences.map(pref => ({
      ...pref,
      email: enable
    })));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#461fa3]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6 bg-[#200e4a] text-white">
          <h1 className="text-2xl font-bold">Notification Preferences</h1>
          <p className="text-gray-200 mt-2">Customize how you want to receive notifications</p>
        </div>
        
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-4">
              <button 
                onClick={() => toggleAllInApp(true)}
                className="px-3 py-1 text-sm bg-[#461fa3] text-white rounded hover:bg-[#7646eb]"
              >
                Enable All In-App
              </button>
              <button 
                onClick={() => toggleAllInApp(false)}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Disable All In-App
              </button>
            </div>
            <div className="flex space-x-4">
              <button 
                onClick={() => toggleAllEmail(true)}
                className="px-3 py-1 text-sm bg-[#461fa3] text-white rounded hover:bg-[#7646eb]"
              >
                Enable All Email
              </button>
              <button 
                onClick={() => toggleAllEmail(false)}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Disable All Email
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notification Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    In-App
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {preferences.map((pref, index) => (
                  <tr key={pref.category} className={pref.is_default ? 'bg-gray-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{pref.label}</div>
                      <div className="text-sm text-gray-500">{pref.description}</div>
                      {pref.is_default && (
                        <span className="text-xs text-gray-400 italic">Default settings</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={pref.in_app}
                          onChange={() => handleToggle(index, 'in_app')}
                        />
                        <div className={`w-11 h-6 rounded-full transition ${
                          pref.in_app ? 'bg-[#461fa3]' : 'bg-gray-300'
                        }`}>
                          <div className={`w-5 h-5 rounded-full bg-white transform transition-transform ${
                            pref.in_app ? 'translate-x-6' : 'translate-x-1'
                          }`}></div>
                        </div>
                      </label>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={pref.email}
                          onChange={() => handleToggle(index, 'email')}
                        />
                        <div className={`w-11 h-6 rounded-full transition ${
                          pref.email ? 'bg-[#461fa3]' : 'bg-gray-300'
                        }`}>
                          <div className={`w-5 h-5 rounded-full bg-white transform transition-transform ${
                            pref.email ? 'translate-x-6' : 'translate-x-1'
                          }`}></div>
                        </div>
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSavePreferences}
              disabled={saving}
              className={`px-6 py-2 bg-[#461fa3] text-white rounded-md hover:bg-[#7646eb] transition-colors ${
                saving ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPreferences;
