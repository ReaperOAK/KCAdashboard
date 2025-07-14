
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuizApi } from '../../api/quiz';
import { toast } from 'react-toastify';
import QuizManagementPage from '../../components/quiz/QuizManagementPage';


// Use design system color tokens for badges
const getDifficultyClass = (difficulty) => {
  switch (difficulty) {
    case 'beginner': return 'bg-accent/10 text-accent border border-accent';
    case 'intermediate': return 'bg-highlight/10 text-highlight border border-highlight';
    case 'advanced': return 'bg-gray-dark/10 text-gray-dark border border-gray-dark';
    default: return 'bg-gray-light text-primary border border-gray-light';
  }
};
const getStatusClass = (status) => {
  switch (status) {
    case 'published': return 'bg-success/10 text-success border border-success';
    case 'draft': return 'bg-gray-light text-primary border border-gray-light';
    default: return 'bg-gray-light text-primary border border-gray-light';
  }
};

const QuizManagement = () => {
  const navigate = useNavigate();

  const fetchQuizzes = useCallback(async (difficulty) => {
    // Admin: getAll, Teacher: getTeacherQuizzes
    const res = difficulty && difficulty !== 'all'
      ? await QuizApi.getAll(difficulty)
      : await QuizApi.getAll();
    return res;
  }, []);

  const handleEditQuiz = useCallback((quiz) => {
    navigate(`/admin/quizzes/edit/${quiz.id}`);
  }, [navigate]);

  const handleCreateQuiz = useCallback(() => {
    navigate('/admin/quizzes/create');
  }, [navigate]);

  const handlePublishQuiz = useCallback(async (quiz) => {
    try {
      await QuizApi.publish(quiz.id);
      toast.success('Quiz published successfully');
    } catch {
      toast.error('Failed to publish quiz');
    }
  }, []);

  const handleDeleteQuiz = useCallback(async (quiz) => {
    try {
      await QuizApi.deleteQuiz(quiz.id);
      toast.success('Quiz deleted successfully');
    } catch {
      toast.error('Failed to delete quiz');
    }
  }, []);

  return (
    <QuizManagementPage
      title="Admin Quiz Management"
      fetchQuizzes={fetchQuizzes}
      onEdit={handleEditQuiz}
      onCreate={handleCreateQuiz}
      onPublish={handlePublishQuiz}
      onDelete={handleDeleteQuiz}
      showLeaderboard={false}
      getStatusClass={getStatusClass}
      getDifficultyClass={getDifficultyClass}
    />
  );
};

export default React.memo(QuizManagement);
