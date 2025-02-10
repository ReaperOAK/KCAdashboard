import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export const getUserChats = async (userId) => {
  try {
    const response = await fetch(`/php/chat/get_chats.php?userId=${userId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching chats:', error);
    return [];
  }
};

export const sendMessage = async (messageData) => {
  try {
    const response = await fetch('/php/chat/send_message.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData)
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const getMessages = async (chatId) => {
  try {
    const response = await fetch(`/php/chat/get_messages.php?chatId=${chatId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};
