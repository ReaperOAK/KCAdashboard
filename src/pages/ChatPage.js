import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserChats, sendMessage } from '../services/chatService';

const ChatPage = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState([]);
  const { user } = useAuth();

  const fetchChats = async () => {
    const chats = await getUserChats(user.id);
    setUsers(chats);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    await sendMessage({
      senderId: user.id,
      receiverId: selectedChat.id,
      content: newMessage,
      timestamp: new Date()
    });

    setNewMessage('');
  };

  useEffect(() => {
    fetchChats();
  }, [user.id]);

  return (
    <div className="flex h-screen bg-light-background">
      {/* Users List */}
      <div className="w-1/4 border-r border-gray-light">
        <div className="p-4 bg-primary text-neutral">
          <h2 className="text-xl font-bold">Chats</h2>
        </div>
        <div className="overflow-y-auto h-[calc(100vh-4rem)]">
          {users.map((chatUser) => (
            <div
              key={chatUser.id}
              onClick={() => setSelectedChat(chatUser)}
              className={`p-4 cursor-pointer hover:bg-accent hover:text-neutral
                ${selectedChat?.id === chatUser.id ? 'bg-secondary text-neutral' : ''}`}
            >
              <div className="font-medium">{chatUser.name}</div>
              <div className="text-sm text-gray-dark">{chatUser.role}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            <div className="p-4 bg-primary text-neutral">
              <h3 className="text-lg font-bold">{selectedChat.name}</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-4 ${
                    message.senderId === user.id ? 'text-right' : 'text-left'
                  }`}
                >
                  <div
                    className={`inline-block p-2 rounded-lg ${
                      message.senderId === user.id
                        ? 'bg-accent text-neutral'
                        : 'bg-gray-light'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-light">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 p-2 border rounded-lg"
                  placeholder="Type a message..."
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-secondary text-neutral rounded-lg hover:bg-accent"
                >
                  Send
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-dark">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
