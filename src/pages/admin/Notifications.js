import React, { useState, useEffect } from 'react';

const Notifications = () => {
  const [templates, setTemplates] = useState([]);
  const [broadcastMessage, setBroadcastMessage] = useState({
    title: '',
    message: '',
    recipients: [],
    urgency: 'normal'
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
        const response = await fetch('/php/admin/get_templates.php');
        const data = await response.json();
        setTemplates(data);
    } catch (error) {
        console.error('Error fetching templates:', error);
    }
  };

  const handleBroadcast = async () => {
    try {
        const response = await fetch('/php/admin/send_broadcast.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(broadcastMessage)
        });
        const data = await response.json();
        if (data.success) {
            alert('Broadcast sent successfully');
            setBroadcastMessage({ title: '', message: '', recipients: [], urgency: 'normal' });
        }
    } catch (error) {
        console.error('Error sending broadcast:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f1f9] p-8">
      <h1 className="text-3xl font-bold mb-8 text-[#200e4a]">Notification Management</h1>

      {/* Notification Templates */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-[#461fa3]">Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map(template => (
            <div key={template.id} className="border p-4 rounded">
              <h3 className="font-semibold">{template.title}</h3>
              <p className="text-[#3b3a52]">{template.content}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Broadcast Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-[#461fa3]">Send Broadcast</h2>
        {/* Add broadcast form */}
      </div>

      {/* New Broadcast Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-8">
        <h2 className="text-xl font-semibold mb-4 text-[#461fa3]">Send System Broadcast</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Broadcast Title"
            className="w-full p-2 border rounded"
            value={broadcastMessage.title}
            onChange={(e) => setBroadcastMessage(prev => ({
              ...prev,
              title: e.target.value
            }))}
          />
          <textarea
            placeholder="Message"
            className="w-full p-2 border rounded h-32"
            value={broadcastMessage.message}
            onChange={(e) => setBroadcastMessage(prev => ({
              ...prev,
              message: e.target.value
            }))}
          />
          <select
            className="w-full p-2 border rounded"
            value={broadcastMessage.urgency}
            onChange={(e) => setBroadcastMessage(prev => ({
              ...prev,
              urgency: e.target.value
            }))}
          >
            <option value="normal">Normal</option>
            <option value="important">Important</option>
            <option value="urgent">Urgent</option>
          </select>
          <button
            onClick={handleBroadcast}
            className="bg-[#461fa3] text-white px-4 py-2 rounded hover:bg-[#7646eb]"
          >
            Send Broadcast
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notifications;