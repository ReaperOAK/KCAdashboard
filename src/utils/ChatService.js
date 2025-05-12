import ApiService from './api';

class ChatService {
  // Get all conversations for the current user
  static async getConversations() {
    try {
      const response = await ApiService.get('/endpoints/chat/get-conversations.php');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  

  // Get messages from a conversation
  static async getMessages(conversationId, limit = 50, offset = 0) {
    try {
      const response = await ApiService.get(`/endpoints/chat/get-messages.php?conversation_id=${conversationId}&limit=${limit}&offset=${offset}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Send a message in a conversation
  static async sendMessage(conversationId, content) {
    try {
      const response = await ApiService.post('/endpoints/chat/send-message.php', {
        conversation_id: conversationId,
        content
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Create a new conversation
  static async createConversation(name, type, participantIds) {
    try {
      const response = await ApiService.post('/endpoints/chat/create-conversation.php', {
        name,
        type,
        participant_ids: participantIds
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Search users for creating a new conversation
  static async searchUsers(searchTerm) {
    try {
      const response = await ApiService.get(`/endpoints/chat/search-users.php?search_term=${encodeURIComponent(searchTerm)}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get unread messages count
  static async getUnreadCount() {
    try {
      const response = await ApiService.get('/endpoints/chat/get-unread-count.php');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default ChatService;