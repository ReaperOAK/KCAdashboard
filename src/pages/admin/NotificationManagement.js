import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ApiService from '../../utils/api';
import Select from 'react-select';

const NotificationManagement = () => {
  // State for notification form
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    category: 'general',
    recipients: 'all',
    send_email: false,
    link: '',
    use_template: false,
    template: '',
    params: {}
  });

  // State for user selection
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [recipientType, setRecipientType] = useState('all');
  
  // State for templates
  const [templates, setTemplates] = useState({});
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [templateParams, setTemplateParams] = useState({});
  
  // State for notifications list
  const [notificationsSent, setNotificationsSent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([
    'general', 'class', 'tournament', 'assignment', 'attendance', 'announcement', 'achievement'
  ]);

  // Load users and templates on component mount
  useEffect(() => {
    fetchUsers();
    fetchTemplates();
    fetchSentNotifications();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await ApiService.get('/users/get.php');
      setUsers(response.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await ApiService.get('/notifications/templates.php');
      setTemplates(response.templates || {});
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load notification templates');
    }
  };

  const fetchSentNotifications = async () => {
    try {
      setLoading(true);
      // You'd need to create this endpoint to get admin-sent notifications
      const response = await ApiService.get('/notifications/admin-sent.php');
      setNotificationsSent(response.notifications || []);
    } catch (error) {
      console.error('Error fetching sent notifications:', error);
      toast.error('Failed to load sent notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleRecipientTypeChange = (e) => {
    const value = e.target.value;
    setRecipientType(value);
    
    // Reset selected users if not choosing specific users
    if (value !== 'specific') {
      setSelectedUsers([]);
    }
    
    setFormData({
      ...formData,
      recipients: value === 'specific' ? [] : value
    });
  };

  const handleUserSelection = (selected) => {
    setSelectedUsers(selected);
    setFormData({
      ...formData,
      recipients: selected.map(option => option.value)
    });
  };

  const handleTemplateChange = (e) => {
    const templateKey = e.target.value;
    setSelectedTemplate(templateKey);
    
    if (templateKey && templates[templateKey]) {
      // Extract all placeholders from template title and message
      const template = templates[templateKey];
      const placeholders = extractPlaceholders(template.title + ' ' + template.message);
      
      // Initialize params object with empty values for each placeholder
      const params = {};
      placeholders.forEach(placeholder => {
        params[placeholder] = '';
      });
      
      setTemplateParams(params);
      
      // Update form data
      setFormData({
        ...formData,
        template: templateKey,
        category: template.category,
        params: params
      });
    } else {
      setTemplateParams({});
      setFormData({
        ...formData,
        template: '',
        params: {}
      });
    }
  };

  const handleParamChange = (e) => {
    const { name, value } = e.target;
    const updatedParams = { ...formData.params, [name]: value };
    
    setFormData({
      ...formData,
      params: updatedParams
    });
  };

  // Helper function to extract placeholders from template string
  const extractPlaceholders = (text) => {
    const regex = /{([^}]+)}/g;
    const placeholders = [];
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      placeholders.push(match[1]);
    }
    
    return [...new Set(placeholders)]; // Remove duplicates
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Prepare data for API call
      let apiData = { ...formData };
      
      // If using specific users, ensure we have the user IDs
      if (recipientType === 'specific') {
        apiData.recipients = selectedUsers.map(user => user.value);
      }
      
      const response = await ApiService.post('/notifications/send.php', apiData);
      
      toast.success('Notifications sent successfully!');
      console.log('Sent result:', response.result);
      
      // Reset form
      setFormData({
        title: '',
        message: '',
        category: 'general',
        recipients: 'all',
        send_email: false,
        link: '',
        use_template: false,
        template: '',
        params: {}
      });
      setSelectedTemplate('');
      setTemplateParams({});
      setSelectedUsers([]);
      setRecipientType('all');
      
      // Refresh sent notifications list
      fetchSentNotifications();
      
    } catch (error) {
      console.error('Error sending notifications:', error);
      toast.error(error.message || 'Failed to send notifications');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-[#200e4a]">Notification Management</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-[#461fa3]">Send Notifications</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Use Template
              <input
                type="checkbox"
                name="use_template"
                checked={formData.use_template}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setFormData({
                    ...formData,
                    use_template: checked,
                    template: checked ? selectedTemplate : '',
                    params: checked ? templateParams : {}
                  });
                }}
                className="ml-2"
              />
            </label>
          </div>
          
          {formData.use_template ? (
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Notification Template
              </label>
              <select
                name="template"
                value={selectedTemplate}
                onChange={handleTemplateChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select a template</option>
                {Object.keys(templates).map(key => (
                  <option key={key} value={key}>
                    {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </option>
                ))}
              </select>
              
              {/* Template Parameters */}
              {Object.keys(templateParams).length > 0 && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <h3 className="font-medium mb-2">Template Parameters</h3>
                  {Object.keys(templateParams).map(param => (
                    <div key={param} className="mb-2">
                      <label className="block text-gray-700 text-sm mb-1">
                        {param.charAt(0).toUpperCase() + param.slice(1)}
                      </label>
                      <input
                        type="text"
                        name={param}
                        value={formData.params[param] || ''}
                        onChange={handleParamChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md h-24"
                  required
                ></textarea>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Link (Optional)
            </label>
            <input
              type="url"
              name="link"
              value={formData.link}
              onChange={handleInputChange}
              placeholder="https://example.com"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            <p className="text-sm text-gray-500 mt-1">Add a link for users to click on in the notification</p>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Recipients
            </label>
            <div className="flex items-center space-x-4 mb-2">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="all"
                  checked={recipientType === 'all'}
                  onChange={handleRecipientTypeChange}
                  className="mr-1"
                />
                All Users
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="students"
                  checked={recipientType === 'students'}
                  onChange={handleRecipientTypeChange}
                  className="mr-1"
                />
                All Students
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="teachers"
                  checked={recipientType === 'teachers'}
                  onChange={handleRecipientTypeChange}
                  className="mr-1"
                />
                All Teachers
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="specific"
                  checked={recipientType === 'specific'}
                  onChange={handleRecipientTypeChange}
                  className="mr-1"
                />
                Specific Users
              </label>
            </div>
            
            {recipientType === 'specific' && (
              <Select
                isMulti
                name="recipients"
                options={users.map(user => ({
                  value: user.id,
                  label: `${user.full_name} (${user.email})`
                }))}
                className="basic-multi-select"
                classNamePrefix="select"
                onChange={handleUserSelection}
                value={selectedUsers}
                placeholder="Select users..."
                required={recipientType === 'specific'}
              />
            )}
          </div>
          
          <div className="mb-6">
            <label className="flex items-center text-gray-700 font-medium">
              <input
                type="checkbox"
                name="send_email"
                checked={formData.send_email}
                onChange={handleInputChange}
                className="mr-2"
              />
              Also send as email
            </label>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 bg-[#461fa3] text-white rounded-md hover:bg-[#7646eb] transition-colors ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Sending...' : 'Send Notification'}
            </button>
          </div>
        </form>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-[#461fa3]">Recent Sent Notifications</h2>
        
        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : notificationsSent.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">Title</th>
                  <th className="py-3 px-6 text-left">Category</th>
                  <th className="py-3 px-6 text-left">Recipients</th>
                  <th className="py-3 px-6 text-left">Sent At</th>
                  <th className="py-3 px-6 text-left">Emails</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm">
                {notificationsSent.map((notification, index) => (
                  <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-6 text-left">{notification.title}</td>
                    <td className="py-3 px-6 text-left">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        getCategoryColor(notification.category)
                      }`}>
                        {notification.category}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-left">{notification.recipient_count}</td>
                    <td className="py-3 px-6 text-left">{new Date(notification.created_at).toLocaleString()}</td>
                    <td className="py-3 px-6 text-left">{notification.emails_sent ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">No sent notifications found</div>
        )}
      </div>
    </div>
  );
};

// Helper function to get category badge color
const getCategoryColor = (category) => {
  const colors = {
    general: 'bg-gray-500 text-white',
    class: 'bg-[#461fa3] text-white',
    tournament: 'bg-[#7646eb] text-white',
    assignment: 'bg-[#af0505] text-white',
    attendance: 'bg-orange-500 text-white',
    announcement: 'bg-blue-500 text-white',
    achievement: 'bg-green-500 text-white'
  };
  
  return colors[category] || colors.general;
};

export default NotificationManagement;
