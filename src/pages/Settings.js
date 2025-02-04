import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext'; // Assuming you have this

const Settings = () => {
  const { user } = useAuth();
  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    email: '',
    profilePicture: '',
  });

  const [notifications, setNotifications] = useState({
    missedClass: false,
    assignmentDue: false,
  });

  const [password, setPassword] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [chessSettings, setChessSettings] = useState({
    lichessUsername: '',
    preferredTimeControl: '10+0',
    boardTheme: 'classic',
    pieceSet: 'classic',
  });

  const [teacherSettings, setTeacherSettings] = useState({
    defaultClassDuration: 60,
    autoRecordClass: true,
    maximumStudentsPerBatch: 10,
  });

  const [adminSettings, setAdminSettings] = useState({
    allowNewRegistrations: true,
    attendanceThreshold: 75,
    autoSendReminders: true,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/php/get-settings.php', {
          method: 'GET',
          credentials: 'include',
        });
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        
        setPersonalInfo(data.personalInfo);
        setNotifications(data.notifications);
        
        setChessSettings(data.chessSettings);
        if (user.role === 'teacher') setTeacherSettings(data.teacherSettings);
        if (user.role === 'admin') setAdminSettings(data.adminSettings);
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    fetchSettings();
  }, [user.role]);

  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo({ ...personalInfo, [name]: value });
  };

  const handleNotificationsChange = (e) => {
    const { name, checked } = e.target;
    setNotifications({ ...notifications, [name]: checked });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPassword({ ...password, [name]: value });
  };

  const handleChessSettingsChange = (e) => {
    const { name, value } = e.target;
    setChessSettings({ ...chessSettings, [name]: value });
  };

  const handleTeacherSettingsChange = (e) => {
    const { name, value } = e.target;
    setTeacherSettings(prev => ({
      ...prev,
      [name]: name === 'autoRecordClass' ? e.target.checked : Number(value)
    }));
  };

  const handleAdminSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAdminSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : Number(value)
    }));
  };

  const handleSavePersonalInfo = async () => {
    const formData = new FormData();
    formData.append('name', personalInfo.name);
    formData.append('email', personalInfo.email);
    if (personalInfo.profilePicture) {
      formData.append('profilePicture', personalInfo.profilePicture);
    }

    try {
      const response = await fetch('/php/update-personal-info.php', {
        method: 'POST',
        credentials: 'include', // Ensure credentials are included
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        alert('Personal information saved');
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error saving personal information:', error);
      alert('An error occurred while saving personal information.');
    }
  };

  const handleSaveNotifications = async () => {
    try {
      const response = await fetch('/php/update-notifications.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Ensure credentials are included
        body: JSON.stringify(notifications),
      });
      const data = await response.json();
      if (data.success) {
        alert('Notification settings saved');
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error saving notification settings:', error);
      alert('An error occurred while saving notification settings.');
    }
  };

  const handleSavePassword = async () => {
    if (password.newPassword !== password.confirmPassword) {
      alert('New password and confirm password do not match');
      return;
    }
    try {
      const response = await fetch('/php/update-password.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Ensure credentials are included
        body: JSON.stringify(password),
      });
      const data = await response.json();
      if (data.success) {
        alert('Password updated');
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error updating password:', error);
      alert('An error occurred while updating the password.');
    }
  };

  const handleSaveChessSettings = async () => {
    try {
      const response = await fetch('/php/update-chess-settings.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(chessSettings),
      });
      const data = await response.json();
      if (data.success) alert('Chess settings saved');
      else alert(data.message);
    } catch (error) {
      console.error('Error saving chess settings:', error);
    }
  };

  const handleSaveTeacherSettings = async () => {
    try {
      const response = await fetch('/php/update-teacher-settings.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(teacherSettings),
      });
      const data = await response.json();
      if (data.success) alert('Teacher settings saved');
      else alert(data.message);
    } catch (error) {
      console.error('Error saving teacher settings:', error);
    }
  };

  const handleSaveAdminSettings = async () => {
    try {
      const response = await fetch('/php/update-admin-settings.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(adminSettings),
      });
      const data = await response.json();
      if (data.success) alert('Admin settings saved');
      else alert(data.message);
    } catch (error) {
      console.error('Error saving admin settings:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f3f1f9]">
      <main className="flex-grow p-8">
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Personal Information</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                Name
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="name"
                type="text"
                name="name"
                value={personalInfo.name}
                onChange={handlePersonalInfoChange}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                Email
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="email"
                type="email"
                name="email"
                value={personalInfo.email}
                onChange={handlePersonalInfoChange}
                readOnly
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="profilePicture">
                Profile Picture
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="profilePicture"
                type="file"
                name="profilePicture"
                onChange={(e) => setPersonalInfo({ ...personalInfo, profilePicture: e.target.files[0] })}
              />
            </div>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={handleSavePersonalInfo}
            >
              Save
            </button>
          </div>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-[#200e4a]">Chess Settings</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="mb-4">
              <label className="block text-[#270185] text-sm font-bold mb-2">
                Lichess.org Username
              </label>
              <input
                className="shadow border rounded w-full py-2 px-3"
                name="lichessUsername"
                value={chessSettings.lichessUsername}
                onChange={handleChessSettingsChange}
              />
            </div>
            <div className="mb-4">
              <label className="block text-[#270185] text-sm font-bold mb-2">
                Preferred Time Control
              </label>
              <select
                className="shadow border rounded w-full py-2 px-3"
                name="preferredTimeControl"
                value={chessSettings.preferredTimeControl}
                onChange={handleChessSettingsChange}
              >
                <option value="3+0">3 min</option>
                <option value="5+0">5 min</option>
                <option value="10+0">10 min</option>
                <option value="15+10">15|10</option>
              </select>
            </div>
            <button
              className="bg-[#461fa3] hover:bg-[#7646eb] text-white font-bold py-2 px-4 rounded"
              onClick={handleSaveChessSettings}
            >
              Save Chess Settings
            </button>
          </div>
        </section>

        {user.role === 'teacher' && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-[#200e4a]">Teacher Settings</h2>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="mb-4">
                <label className="block text-[#270185] text-sm font-bold mb-2">
                  Default Class Duration (minutes)
                </label>
                <input
                  type="number"
                  name="defaultClassDuration"
                  value={teacherSettings.defaultClassDuration}
                  onChange={handleTeacherSettingsChange}
                  className="shadow border rounded w-full py-2 px-3"
                />
              </div>
              <div className="mb-4">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name="autoRecordClass"
                    checked={teacherSettings.autoRecordClass}
                    onChange={handleTeacherSettingsChange}
                    className="form-checkbox"
                  />
                  <span className="ml-2">Auto Record Classes</span>
                </label>
              </div>
              <div className="mb-4">
                <label className="block text-[#270185] text-sm font-bold mb-2">
                  Maximum Students Per Batch
                </label>
                <input
                  type="number"
                  name="maximumStudentsPerBatch"
                  value={teacherSettings.maximumStudentsPerBatch}
                  onChange={handleTeacherSettingsChange}
                  className="shadow border rounded w-full py-2 px-3"
                />
              </div>
              <button
                className="bg-[#461fa3] hover:bg-[#7646eb] text-white font-bold py-2 px-4 rounded"
                onClick={handleSaveTeacherSettings}
              >
                Save Teacher Settings
              </button>
            </div>
          </section>
        )}

        {user.role === 'admin' && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-[#200e4a]">Admin Settings</h2>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="mb-4">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name="allowNewRegistrations"
                    checked={adminSettings.allowNewRegistrations}
                    onChange={handleAdminSettingsChange}
                    className="form-checkbox"
                  />
                  <span className="ml-2">Allow New Registrations</span>
                </label>
              </div>
              <div className="mb-4">
                <label className="block text-[#270185] text-sm font-bold mb-2">
                  Attendance Threshold (%)
                </label>
                <input
                  type="number"
                  name="attendanceThreshold"
                  value={adminSettings.attendanceThreshold}
                  onChange={handleAdminSettingsChange}
                  className="shadow border rounded w-full py-2 px-3"
                />
              </div>
              <div className="mb-4">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name="autoSendReminders"
                    checked={adminSettings.autoSendReminders}
                    onChange={handleAdminSettingsChange}
                    className="form-checkbox"
                  />
                  <span className="ml-2">Auto Send Reminders</span>
                </label>
              </div>
              <button
                className="bg-[#461fa3] hover:bg-[#7646eb] text-white font-bold py-2 px-4 rounded"
                onClick={handleSaveAdminSettings}
              >
                Save Admin Settings
              </button>
            </div>
          </section>
        )}

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Notification Settings</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="mb-4">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  name="missedClass"
                  checked={notifications.missedClass}
                  onChange={handleNotificationsChange}
                />
                <span className="ml-2">Missed Class Notifications</span>
              </label>
            </div>
            <div className="mb-4">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  name="assignmentDue"
                  checked={notifications.assignmentDue}
                  onChange={handleNotificationsChange}
                />
                <span className="ml-2">Assignment Due Reminders</span>
              </label>
            </div>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={handleSaveNotifications}
            >
              Save
            </button>
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Password Change</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="currentPassword">
                Current Password
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="currentPassword"
                type="password"
                name="currentPassword"
                value={password.currentPassword}
                onChange={handlePasswordChange}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newPassword">
                New Password
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="newPassword"
                type="password"
                name="newPassword"
                value={password.newPassword}
                onChange={handlePasswordChange}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
                Confirm New Password
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={password.confirmPassword}
                onChange={handlePasswordChange}
              />
            </div>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={handleSavePassword}
            >
              Change Password
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Settings;