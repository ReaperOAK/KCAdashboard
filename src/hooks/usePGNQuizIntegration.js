import { useState, useCallback } from 'react';
import { QuizApi } from '../api/quiz';
import { ChessApi } from '../api/chess';
import { toast } from 'react-toastify';

/**
 * Custom hook for managing PGN to quiz functionality
 */
export const usePGNQuizIntegration = () => {
  const [existingQuizzes, setExistingQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch teacher's draft quizzes
  const fetchDraftQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await QuizApi.getTeacherQuizzes();
      if (response.quizzes) {
        // Filter to only show draft quizzes (can be edited)
        const draftQuizzes = response.quizzes.filter(quiz => quiz.status === 'draft');
        setExistingQuizzes(draftQuizzes);
        return draftQuizzes;
      }
      return [];
    } catch (error) {
      toast.error('Failed to load existing quizzes');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Load PGN content for a game
  const loadPGNContent = useCallback(async (gameId) => {
    try {
      const response = await ChessApi.getPGNGame(gameId);
      
      // Try different possible response formats
      let pgnContent = null;
      
      if (response.success && response.data) {
        pgnContent = response.data.pgn_content || response.data.pgn || response.data.content;
      } else if (response.pgn_content) {
        pgnContent = response.pgn_content;
      } else if (response.pgn) {
        pgnContent = response.pgn;
      }
      
      return pgnContent;
    } catch (error) {
      console.error('Failed to load PGN content:', error);
      return null;
    }
  }, []);

  // Create PGN question object from PGN game data
  const createPGNQuestion = useCallback(async (pgnGame, questionText) => {
    // Try to get PGN content if not already available
    let pgnContent = pgnGame.pgn_content || pgnGame.pgn;
    
    const gameId = pgnGame.id || pgnGame.game_id;
    
    if (!pgnContent && gameId) {
      pgnContent = await loadPGNContent(gameId);
    }
    
    const question = {
      tempId: Date.now(),
      question: questionText || `Analyze this game: ${pgnGame.title}`,
      image_url: '',
      type: 'chess',
      hint: '',
      tags: ['game-analysis', 'pgn'],
      chess_position: 'start',
      chess_orientation: 'white',
      correct_moves: [],
      chess_mode: 'pgn',
      pgn_data: pgnContent,
      game_id: pgnGame.game_id || pgnGame.id,
      file_path: pgnGame.file_path,
      expected_player_color: 'white'
    };
    
    return question;
  }, [loadPGNContent]);

  // Store PGN data for quiz creator
  const storePGNForQuiz = useCallback((pgnGame) => {
    const pgnData = {
      title: pgnGame.title,
      pgn_content: pgnGame.pgn_content || null,
      file_path: pgnGame.file_path || null,
      game_id: pgnGame.id,
      description: pgnGame.description,
      category: pgnGame.category,
      metadata: pgnGame.metadata
    };
    
    sessionStorage.setItem('pgnForQuiz', JSON.stringify(pgnData));
  }, []);

  // Get stored PGN data
  const getStoredPGNData = useCallback(() => {
    try {
      const pgnData = sessionStorage.getItem('pgnForQuiz');
      if (pgnData) {
        const parsed = JSON.parse(pgnData);
        return parsed;
      }
      return null;
    } catch (error) {
      console.error('Failed to parse stored PGN data:', error);
      return null;
    }
  }, []);

  // Clear stored PGN data
  const clearStoredPGNData = useCallback(() => {
    sessionStorage.removeItem('pgnForQuiz');
  }, []);

  // Batch add multiple PGNs to a quiz
  const addMultiplePGNsToQuiz = useCallback(async (pgnGames, baseQuestionText = '') => {
    try {
      // Process all PGN games asynchronously
      const questionsData = await Promise.all(
        pgnGames.map(async (pgnGame, index) => {
          const questionText = baseQuestionText || `Analyze game ${index + 1}: ${pgnGame.title}`;
          return await createPGNQuestion(pgnGame, questionText);
        })
      );

      const batchData = {
        questions: questionsData,
        metadata: {
          source: 'pgn_library',
          batch_created: new Date().toISOString(),
          total_games: pgnGames.length
        }
      };

      sessionStorage.setItem('pgnBatchForQuiz', JSON.stringify(batchData));
      return questionsData;
    } catch (error) {
      console.error('Error processing batch PGN data:', error);
      throw error;
    }
  }, [createPGNQuestion]);

  return {
    existingQuizzes,
    loading,
    fetchDraftQuizzes,
    createPGNQuestion,
    storePGNForQuiz,
    getStoredPGNData,
    clearStoredPGNData,
    addMultiplePGNsToQuiz,
    loadPGNContent
  };
};

export default usePGNQuizIntegration;
