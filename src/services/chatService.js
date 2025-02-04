import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export const getUserChats = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/chats/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching chats:', error);
    return [];
  }
};

export const sendMessage = async (messageData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/messages`, messageData);
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const getMessages = async (chatId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/messages/${chatId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};
