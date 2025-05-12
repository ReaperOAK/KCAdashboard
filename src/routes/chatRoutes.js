import ChatPage from '../pages/chat/ChatPage';

const chatRoutes = [
  {
    path: '/chat',
    element: ChatPage,
    title: 'Chat',
    allowedRoles: ['student', 'teacher', 'admin'],
  }
];

export default chatRoutes;