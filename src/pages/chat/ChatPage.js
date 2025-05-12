import React, { useState, useEffect, useRef, useCallback } from 'react';
import ChatService from '../../utils/ChatService';
import { useAuth } from '../../hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';

const ChatPage = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await ChatService.getConversations();
      if (response.success) {
        setConversations(response.data);
        
        // If there are conversations, select the first one
        if (response.data.length > 0 && !selectedConversation) {
          setSelectedConversation(response.data[0]);
        }
      }
    } catch (error) {
      toast.error('Failed to load conversations');
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedConversation]);

  // Load conversations when the component mounts
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Load messages when a conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async (conversationId) => {
    try {
      setLoading(true);
      const response = await ChatService.getMessages(conversationId);
      if (response.success) {
        setMessages(response.data);
      }
    } catch (error) {
      toast.error('Failed to load messages');
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageInput.trim()) return;
    
    try {
      const response = await ChatService.sendMessage(selectedConversation.id, messageInput);
      if (response.success) {
        setMessages([...messages, response.data]);
        setMessageInput('');
        
        // Update conversation list to reflect the new message
        const updatedConversations = conversations.map(conv => {
          if (conv.id === selectedConversation.id) {
            return {
              ...conv,
              last_message: messageInput,
              last_sender: user.full_name,
              last_message_time: new Date().toISOString()
            };
          }
          return conv;
        });
        
        // Move the active conversation to the top
        const activeConversation = updatedConversations.find(conv => conv.id === selectedConversation.id);
        const filteredConversations = updatedConversations.filter(conv => conv.id !== selectedConversation.id);
        setConversations([activeConversation, ...filteredConversations]);
      }
    } catch (error) {
      toast.error('Failed to send message');
      console.error('Error sending message:', error);
    }
  };

  const handleSearchUsers = async (e) => {
    const searchTerm = e.target.value;
    setUserSearch(searchTerm);
    
    if (searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }
    
    try {
      setSearchLoading(true);
      const response = await ChatService.searchUsers(searchTerm);
      if (response.success) {
        // Filter out users that are already selected
        const filteredResults = response.data.filter(
          user => !selectedUsers.some(selectedUser => selectedUser.id === user.id)
        );
        setSearchResults(filteredResults);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUsers([...selectedUsers, user]);
    setUserSearch('');
    setSearchResults([]);
  };

  const handleRemoveSelectedUser = (userId) => {
    setSelectedUsers(selectedUsers.filter(user => user.id !== userId));
  };

  const handleCreateConversation = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one user');
      return;
    }
    
    try {
      const name = selectedUsers.length === 1 
        ? `${user.full_name}, ${selectedUsers[0].full_name}`
        : groupName || `Group (${selectedUsers.length + 1} people)`;
        
      const type = selectedUsers.length === 1 ? 'direct' : 'group';
      const participantIds = selectedUsers.map(user => user.id);
      
      const response = await ChatService.createConversation(name, type, participantIds);
      if (response.success) {
        // Add the new conversation to the list and select it
        setConversations([response.data, ...conversations]);
        setSelectedConversation(response.data);
        setShowNewChatModal(false);
        setSelectedUsers([]);
        setGroupName('');
        
        toast.success('Conversation created successfully');
      }
    } catch (error) {
      toast.error('Failed to create conversation');
      console.error('Error creating conversation:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Helper function to format relative time
  const formatRelativeTime = (dateString) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  return (
    <div className="min-h-screen bg-[#f3f1f9] pt-24 px-4 sm:px-6 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-4 h-[calc(100vh-140px)]">
            {/* Conversation List */}
            <div className="md:col-span-1 border-r border-gray-200 md:min-h-full flex flex-col">
              <div className="p-4 border-b flex justify-between items-center bg-[#200e4a] text-white">
                <h2 className="text-lg font-semibold">Messages</h2>
                <button 
                  onClick={() => setShowNewChatModal(true)}
                  className="p-2 rounded-full hover:bg-[#461fa3] transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              
              <div className="overflow-y-auto flex-1">
                {loading && conversations.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">Loading conversations...</div>
                ) : conversations.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">No conversations yet. Start a new chat!</div>
                ) : (
                  conversations.map(conversation => (
                    <div 
                      key={conversation.id} 
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${selectedConversation?.id === conversation.id ? 'bg-[#f3f1f9]' : ''}`}
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-gray-900">{conversation.name}</h3>
                        <span className="text-xs text-gray-500">
                          {conversation.last_message_time ? formatRelativeTime(conversation.last_message_time) : ''}
                        </span>
                      </div>
                      
                      <div className="mt-1 flex justify-between items-start">
                        <p className="text-sm text-gray-600 truncate max-w-[70%]">
                          {conversation.last_sender && conversation.last_message ? (
                            <span>
                              <span className="font-medium">{conversation.last_sender === user.full_name ? 'You' : conversation.last_sender}: </span>
                              {conversation.last_message}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">No messages yet</span>
                          )}
                        </p>
                        
                        {conversation.unread_count > 0 && (
                          <span className="bg-[#461fa3] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {conversation.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Chat Area */}
            <div className="md:col-span-3 flex flex-col h-full">
              {selectedConversation ? (
                <>
                  {/* Conversation Header */}
                  <div className="p-4 border-b flex justify-between items-center bg-[#200e4a] text-white">
                    <div>
                      <h2 className="text-lg font-semibold">{selectedConversation.name}</h2>
                      <p className="text-xs text-gray-300">
                        {selectedConversation.participants?.length} participant{selectedConversation.participants?.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      {/* Additional buttons could go here (info, video call, etc.) */}
                    </div>
                  </div>
                  
                  {/* Messages */}
                  <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                    {loading ? (
                      <div className="flex justify-center items-center h-full">
                        <div className="text-center text-gray-500">Loading messages...</div>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex justify-center items-center h-full">
                        <div className="text-center text-gray-500">No messages yet. Start the conversation!</div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map(message => (
                          <div 
                            key={message.id} 
                            className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[70%] ${message.sender_id === user.id ? 'bg-[#461fa3] text-white' : 'bg-white border border-gray-200'} rounded-lg p-3 shadow-sm`}>
                              {message.sender_id !== user.id && (
                                <div className="font-medium text-xs mb-1 text-gray-600">
                                  {message.sender_name}
                                </div>
                              )}
                              <p className="text-sm">{message.content}</p>
                              <div className={`text-right text-xs mt-1 ${message.sender_id === user.id ? 'text-gray-200' : 'text-gray-500'}`}>
                                {formatRelativeTime(message.created_at)}
                              </div>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>
                  
                  {/* Message Input */}
                  <div className="p-4 border-t bg-white">
                    <form onSubmit={handleSendMessage} className="flex space-x-2">
                      <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-[#461fa3]"
                      />
                      <button
                        type="submit"
                        className="bg-[#461fa3] text-white rounded-lg px-4 py-2 hover:bg-[#7646eb] transition-colors"
                        disabled={!messageInput.trim()}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex justify-center items-center h-full text-gray-500">
                  <div className="text-center">
                    <p className="mb-2">Select a conversation or start a new one</p>
                    <button 
                      onClick={() => setShowNewChatModal(true)}
                      className="bg-[#461fa3] text-white rounded-lg px-4 py-2 hover:bg-[#7646eb] transition-colors"
                    >
                      New Conversation
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-xl">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold text-[#200e4a]">New Conversation</h3>
              <button 
                onClick={() => {
                  setShowNewChatModal(false);
                  setSelectedUsers([]);
                  setUserSearch('');
                  setSearchResults([]);
                  setGroupName('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4">
              {selectedUsers.length > 1 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Enter group name (optional)"
                    className="w-full rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-[#461fa3]"
                  />
                </div>
              )}
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Search Users</label>
                <input
                  type="text"
                  value={userSearch}
                  onChange={handleSearchUsers}
                  placeholder="Search by name or email"
                  className="w-full rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-[#461fa3]"
                />
              </div>
              
              {/* Selected Users */}
              {selectedUsers.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Selected Users</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedUsers.map(user => (
                      <div key={user.id} className="bg-[#f3f1f9] rounded-full px-3 py-1 flex items-center space-x-1">
                        <span className="text-sm">{user.full_name}</span>
                        <button 
                          onClick={() => handleRemoveSelectedUser(user.id)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Search Results */}
              {searchLoading ? (
                <div className="text-center py-4 text-gray-500">Searching...</div>
              ) : searchResults.length > 0 ? (
                <div className="max-h-60 overflow-y-auto">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search Results</label>
                  <div className="space-y-2">
                    {searchResults.map(user => (
                      <div 
                        key={user.id} 
                        className="p-2 border rounded-lg cursor-pointer hover:bg-gray-50 flex items-center space-x-2"
                        onClick={() => handleSelectUser(user)}
                      >
                        {user.profile_picture ? (
                          <img 
                            src={user.profile_picture} 
                            alt={user.full_name} 
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#461fa3] text-white flex items-center justify-center">
                            {user.full_name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{user.full_name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : userSearch.length > 1 ? (
                <div className="text-center py-4 text-gray-500">No users found</div>
              ) : null}
              
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={handleCreateConversation}
                  className="bg-[#461fa3] text-white rounded-lg px-4 py-2 hover:bg-[#7646eb] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={selectedUsers.length === 0}
                >
                  Create Conversation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;