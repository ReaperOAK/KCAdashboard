import React, { useState, useEffect } from 'react';

const Settings = () => {
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

  useEffect(() => {
    const fetchPersonalInfo = async () => {
      try {
        const response = await fetch('/php/get-personal-info.php', {
          method: 'GET',
          credentials: 'include', // Ensure credentials are included
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setPersonalInfo(data.personalInfo);
        setNotifications(data.notifications);
      } catch (error) {
        console.error('Error fetching personal information:', error);
      }
    };

    fetchPersonalInfo();
  }, []);

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

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow p-8 bg-gray-100">
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