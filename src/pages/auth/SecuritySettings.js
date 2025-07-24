import React from 'react';
import { motion } from 'framer-motion';
import SessionManager from '../../components/auth/SessionManager';

const SecuritySettings = () => {
  return (
    <motion.div
      className="min-h-screen bg-background-light p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary mb-2">Security Settings</h1>
          <p className="text-gray-600">Manage your account security and active sessions</p>
        </div>

        <div className="grid gap-6">
          <SessionManager />
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Security Tips</h2>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-3">
                <span className="text-green-500 font-bold">✓</span>
                <span>Always logout from public or shared computers</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-500 font-bold">✓</span>
                <span>Use strong, unique passwords for your account</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-500 font-bold">✓</span>
                <span>Regularly review your active sessions</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-500 font-bold">✓</span>
                <span>Report any suspicious activity immediately</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SecuritySettings;
