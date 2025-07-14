
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
    const res = difficulty && difficulty !== 'all'
      ? await QuizApi.getTeacherQuizzes(difficulty)
      : await QuizApi.getTeacherQuizzes();
    return res;
  }, []);

  const handleEditQuiz = useCallback((quiz) => {
    navigate(`/teacher/quiz/edit/${quiz.id}`);
  }, [navigate]);

  const handleCreateQuiz = useCallback(() => {
    navigate('/teacher/quiz/create');
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

  const handleViewLeaderboard = useCallback((quiz) => {
    navigate(`/teacher/quiz/${quiz.id}/leaderboard`);
  }, [navigate]);

  return (
    <QuizManagementPage
      title="Quiz Management"
      fetchQuizzes={fetchQuizzes}
      onEdit={handleEditQuiz}
      onCreate={handleCreateQuiz}
      onPublish={handlePublishQuiz}
      onDelete={handleDeleteQuiz}
      showLeaderboard={true}
      leaderboardHandler={handleViewLeaderboard}
      getStatusClass={getStatusClass}
      getDifficultyClass={getDifficultyClass}
    />
  );
};

export default React.memo(QuizManagement);
