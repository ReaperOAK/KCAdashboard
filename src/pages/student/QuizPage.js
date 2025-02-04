import React, { useState, useEffect } from 'react';
import { FaClock} from 'react-icons/fa';

const QuizPage = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await fetch('/api/student/quizzes');
      const data = await response.json();
      setQuizzes(data);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    }
  };

  const startQuiz = (quiz) => {
    setCurrentQuiz(quiz);
    setTimeLeft(quiz.timeLimit * 60);
    setAnswers({});
  };

  const submitQuiz = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/student/submit-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId: currentQuiz.id, answers })
      });
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#f3f1f9] p-8">
      <h1 className="text-3xl font-bold mb-8 text-[#200e4a]">Chess Quizzes</h1>

      {!currentQuiz ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map(quiz => (
            <div key={quiz.id} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-[#461fa3] mb-2">{quiz.title}</h2>
              <p className="text-[#3b3a52] mb-4">{quiz.description}</p>
              <div className="flex items-center justify-between text-[#3b3a52] mb-4">
                <span><FaClock className="inline mr-2" />{quiz.timeLimit} minutes</span>
                <span>{quiz.questions.length} questions</span>
              </div>
              <button
                onClick={() => startQuiz(quiz)}
                className="w-full bg-[#461fa3] text-white py-2 rounded hover:bg-[#7646eb]"
              >
                Start Quiz
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[#461fa3]">{currentQuiz.title}</h2>
            <div className="text-[#3b3a52]">
              <FaClock className="inline mr-2" />
              Time Left: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
            </div>
          </div>
          
          <form onSubmit={(e) => { e.preventDefault(); submitQuiz(); }}>
            {currentQuiz.questions.map((question, index) => (
              <div key={index} className="mb-6 p-4 border rounded">
                <p className="text-[#200e4a] font-semibold mb-4">{question.text}</p>
                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <label key={optionIndex} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={`question-${index}`}
                        value={option}
                        onChange={(e) => setAnswers({...answers, [index]: e.target.value})}
                        className="text-[#461fa3]"
                      />
                      <span className="text-[#3b3a52]">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-[#200e4a] text-white py-3 rounded-lg ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#461fa3]'
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default QuizPage;