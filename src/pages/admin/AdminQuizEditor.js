import React from 'react';
import QuizCreator from '../teacher/QuizCreator';

// AdminQuizEditor wraps the teacher QuizCreator for admin use
const AdminQuizEditor = () => {
  // Optionally, you can add admin-specific logic or permissions here
  return <QuizCreator />;
};

export default AdminQuizEditor;
