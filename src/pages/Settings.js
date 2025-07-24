import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheckIcon, 
  BellIcon, 
  CogIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';
import SessionManager from '../components/auth/SessionManager';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('sessions');

  const tabs = [
    {
      id: 'sessions',
      name: 'Active Sessions',
      icon: DevicePhoneMobileIcon,
      description: 'Manage your active login sessions'
    },
    {
      id: 'security',
      name: 'Security',
      icon: ShieldCheckIcon,
      description: 'Password and security settings'
    },
    {
      id: 'notifications',
      name: 'Notifications',
      icon: BellIcon,
      description: 'Email and push notification preferences'
    },
    {
      id: 'general',
      name: 'General',
      icon: CogIcon,
      description: 'General application settings'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'sessions':
        return <SessionManager />;
      case 'security':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Security Settings</h2>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">Change Password</h3>
                <p className="text-sm text-blue-700 mb-3">
                  Update your password regularly to keep your account secure.
                </p>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                  Change Password
                </button>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-medium text-green-800 mb-2">Two-Factor Authentication</h3>
                <p className="text-sm text-green-700 mb-3">
                  Add an extra layer of security to your account. (Coming Soon)
                </p>
                <button 
                  disabled 
                  className="px-4 py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed"
                >
                  Enable 2FA (Coming Soon)
                </button>
              </div>
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Notification Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-800">Email Notifications</h3>
                  <p className="text-sm text-gray-600">Receive updates about your classes and progress</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-800">Session Alerts</h3>
                  <p className="text-sm text-gray-600">Get notified when someone logs into your account</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        );
      case 'general':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">General Settings</h2>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">Theme</h3>
                <p className="text-sm text-gray-600 mb-3">Choose your preferred theme</p>
                <select className="w-full p-2 border border-gray-300 rounded-md">
                  <option value="light">Light Theme</option>
                  <option value="dark">Dark Theme (Coming Soon)</option>
                  <option value="auto">Auto (Coming Soon)</option>
                </select>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">Language</h3>
                <p className="text-sm text-gray-600 mb-3">Select your preferred language</p>
                <select className="w-full p-2 border border-gray-300 rounded-md">
                  <option value="en">English</option>
                  <option value="ur">Urdu (Coming Soon)</option>
                </select>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background-light">
      <div className="p-2 sm:p-6 md:p-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">Settings</h1>
            <p className="text-gray-600">Manage your account preferences and security settings</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full text-left p-4 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <div>
                          <div className="font-medium">{tab.name}</div>
                          <div className={`text-sm ${
                            activeTab === tab.id ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {tab.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                {renderTabContent()}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
