import React, { useState } from 'react';

const ManageSystem = () => {
  const [systemConfig, setSystemConfig] = useState({
    maxStudentsPerBatch: 20,
    autoNotifications: true,
    maintainanceMode: false
  });

  const handleConfigSave = async () => {
    try {
      await fetch('/api/admin/system-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(systemConfig)
      });
      // Handle response
    } catch (error) {
      console.error('Error saving system config:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f1f9] p-8">
      <h1 className="text-3xl font-bold mb-8 text-[#200e4a]">System Management</h1>

      {/* System Configuration */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-[#461fa3]">System Configuration</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#3b3a52]">
              Max Students per Batch
            </label>
            <input
              type="number"
              value={systemConfig.maxStudentsPerBatch}
              onChange={(e) => setSystemConfig(prev => ({
                ...prev,
                maxStudentsPerBatch: parseInt(e.target.value)
              }))}
              className="mt-1 block w-full rounded-md border-[#c2c1d3] shadow-sm"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={systemConfig.autoNotifications}
                onChange={(e) => setSystemConfig(prev => ({
                  ...prev,
                  autoNotifications: e.target.checked
                }))}
                className="form-checkbox text-[#7646eb]"
              />
              <span className="ml-2">Enable Auto Notifications</span>
            </label>
          </div>

          <button
            onClick={handleConfigSave}
            className="bg-[#461fa3] text-white px-4 py-2 rounded hover:bg-[#7646eb]"
          >
            Save Configuration
          </button>
        </div>
      </div>

      {/* FAQ Automation */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-[#461fa3]">FAQ Automation</h2>
        <div className="space-y-4">
          {/* FAQ automation controls */}
        </div>
      </div>
    </div>
  );
};

export default ManageSystem;