<?php
class Quiz {
    private $conn;
    private $table_name = "quizzes";

    public $id;
    public $title;
    public $description;
    public $difficulty;
    public $time_limit;
    public $created_by;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAll() {
        try {
            $query = "SELECT q.*, u.full_name as creator_name 
                     FROM " . $this->table_name . " q
                     JOIN users u ON q.created_by = u.id
                     ORDER BY q.created_at DESC";

            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new Exception("Error fetching quizzes: " . $e->getMessage());
        }
    }

    public function getByDifficulty($difficulty) {
        try {
            $query = "SELECT q.*, u.full_name as creator_name 
                     FROM " . $this->table_name . " q
                     JOIN users u ON q.created_by = u.id
                     WHERE q.difficulty = :difficulty
                     ORDER BY q.created_at DESC";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":difficulty", $difficulty);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new Exception("Error fetching quizzes by difficulty: " . $e->getMessage());
        }
    }
    
    public function getById($id) {
        try {
            // Get quiz details
            $query = "SELECT q.*, u.full_name as creator_name 
                     FROM " . $this->table_name . " q
                     JOIN users u ON q.created_by = u.id
                     WHERE q.id = :id";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":id", $id);
            $stmt->execute();
            $quiz = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$quiz) {
                return null;
            }
            
            // Get questions for this quiz
            $query = "SELECT * FROM quiz_questions WHERE quiz_id = :quiz_id ORDER BY id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":quiz_id", $id);
            $stmt->execute();
            $questions = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // For each question, get its answers
            foreach ($questions as $key => $question) {
                $query = "SELECT * FROM quiz_answers WHERE question_id = :question_id";
                $stmt = $this->conn->prepare($query);
                $stmt->bindParam(":question_id", $question['id']);
                $stmt->execute();
                $questions[$key]['answers'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            }
            
            $quiz['questions'] = $questions;
            return $quiz;
            
        } catch (PDOException $e) {
            throw new Exception("Error fetching quiz by ID: " . $e->getMessage());
        }
    }
    
    public function submitQuiz($userId, $quizId, $answers, $timeTaken) {
        try {
            $this->conn->beginTransaction();
            
            // Get quiz and its questions
            $query = "SELECT q.id, COUNT(qq.id) AS total_questions
                     FROM " . $this->table_name . " q
                     JOIN quiz_questions qq ON q.id = qq.quiz_id
                     WHERE q.id = :quiz_id
                     GROUP BY q.id";
                     
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":quiz_id", $quizId);
            $stmt->execute();
            $quizInfo = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$quizInfo) {
                throw new Exception("Quiz not found.");
            }
            
            // Calculate score
            $score = 0;
            foreach ($answers as $questionId => $answerId) {
                $query = "SELECT is_correct FROM quiz_answers 
                         WHERE id = :answer_id AND question_id = :question_id";
                $stmt = $this->conn->prepare($query);
                $stmt->bindParam(":answer_id", $answerId);
                $stmt->bindParam(":question_id", $questionId);
                $stmt->execute();
                $result = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($result && $result['is_correct']) {
                    $score++;
                }
            }
            
            // Insert quiz attempt
            $query = "INSERT INTO quiz_attempts (user_id, quiz_id, score, time_taken, completed_at)
                     VALUES (:user_id, :quiz_id, :score, :time_taken, NOW())";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":user_id", $userId);
            $stmt->bindParam(":quiz_id", $quizId);
            $stmt->bindParam(":score", $score);
            $stmt->bindParam(":time_taken", $timeTaken);
            $stmt->execute();
            
            $attemptId = $this->conn->lastInsertId();
            
            // Calculate percentile
            $query = "SELECT COUNT(*) AS better_scores FROM quiz_attempts
                     WHERE quiz_id = :quiz_id AND score > :score";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":quiz_id", $quizId);
            $stmt->bindParam(":score", $score);
            $stmt->execute();
            $betterScores = $stmt->fetch(PDO::FETCH_ASSOC)['better_scores'];
            
            $query = "SELECT COUNT(*) AS total_attempts FROM quiz_attempts
                     WHERE quiz_id = :quiz_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":quiz_id", $quizId);
            $stmt->execute();
            $totalAttempts = $stmt->fetch(PDO::FETCH_ASSOC)['total_attempts'];
            
            $percentile = 0;
            if ($totalAttempts > 1) {
                $percentile = round((1 - ($betterScores / ($totalAttempts - 1))) * 100);
            }
            
            // Generate feedback based on score
            $feedbackMessage = "";
            $percentageScore = ($score / $quizInfo['total_questions']) * 100;
            
            if ($percentageScore >= 90) {
                $feedbackMessage = "Outstanding! You've demonstrated exceptional chess knowledge.";
            } elseif ($percentageScore >= 80) {
                $feedbackMessage = "Excellent work! You have a strong grasp of chess concepts.";
            } elseif ($percentageScore >= 70) {
                $feedbackMessage = "Good job! You're showing solid understanding of chess.";
            } elseif ($percentageScore >= 60) {
                $feedbackMessage = "You're on the right track, but there's room for improvement.";
            } elseif ($percentageScore >= 50) {
                $feedbackMessage = "Keep practicing! Review the topics you missed and try again.";
            } else {
                $feedbackMessage = "Don't get discouraged. Continue studying and try the quiz again later.";
            }
            
            $this->conn->commit();
            
            return array(
                'attempt_id' => $attemptId,
                'score' => $score,
                'total_questions' => $quizInfo['total_questions'],
                'percentile' => $percentile,
                'feedback' => $feedbackMessage,
                'user_id' => $userId
            );
            
        } catch (Exception $e) {
            $this->conn->rollBack();
            throw new Exception("Error submitting quiz: " . $e->getMessage());
        }
    }
    
    public function getUserHistory($userId, $filter = 'all') {
        try {
            $params = [":user_id" => $userId];
            
            $whereClause = "WHERE qa.user_id = :user_id";
            
            if ($filter !== 'all') {
                if ($filter === 'passed') {
                    $whereClause .= " AND (qa.score / (SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = qa.quiz_id)) >= 0.7";
                } else {
                    $whereClause .= " AND q.difficulty = :difficulty";
                    $params[":difficulty"] = $filter;
                }
            }
            
            $query = "SELECT qa.id, qa.quiz_id, q.title as quiz_title, q.difficulty, 
                     qa.score, qa.time_taken, qa.completed_at,
                     (SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = qa.quiz_id) as total_questions
                     FROM quiz_attempts qa
                     JOIN " . $this->table_name . " q ON qa.quiz_id = q.id
                     $whereClause
                     ORDER BY qa.completed_at DESC";
                     
            $stmt = $this->conn->prepare($query);
            
            foreach ($params as $param => $value) {
                $stmt->bindParam($param, $value);
            }
            
            $stmt->execute();
            $history = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Get user stats
            $query = "SELECT 
                     COUNT(*) as total_attempts,
                     COUNT(DISTINCT quiz_id) as unique_quizzes,
                     ROUND(AVG(qa.score * 100 / (SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = qa.quiz_id)), 1) as average_score,
                     MAX(qa.score * 100 / (SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = qa.quiz_id)) as highest_score,
                     (SELECT q2.difficulty FROM quiz_attempts qa2 
                      JOIN " . $this->table_name . " q2 ON qa2.quiz_id = q2.id
                      WHERE qa2.user_id = :user_id
                      AND qa2.score * 100 / (SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = qa2.quiz_id) = 
                           (SELECT MAX(qa3.score * 100 / (SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = qa3.quiz_id))
                            FROM quiz_attempts qa3 
                            WHERE qa3.user_id = :user_id)
                      LIMIT 1) as highest_difficulty
                     FROM quiz_attempts qa
                     WHERE qa.user_id = :user_id";
                     
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":user_id", $userId);
            $stmt->execute();
            $stats = $stmt->fetch(PDO::FETCH_ASSOC);
            
            return array(
                'history' => $history,
                'stats' => $stats
            );
            
        } catch (PDOException $e) {
            throw new Exception("Error fetching quiz history: " . $e->getMessage());
        }
    }
    
    public function getLeaderboard($quizId) {
        try {
            $query = "SELECT 
                     qa.id, qa.user_id, qa.score, qa.time_taken, qa.completed_at,
                     u.full_name as student_name
                     FROM quiz_attempts qa
                     JOIN users u ON qa.user_id = u.id
                     WHERE qa.quiz_id = :quiz_id
                     ORDER BY qa.score DESC, qa.time_taken ASC, qa.completed_at DESC
                     LIMIT 10";
                     
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":quiz_id", $quizId);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
            
        } catch (PDOException $e) {
            throw new Exception("Error fetching leaderboard: " . $e->getMessage());
        }
    }
    
    public function getLatestResult($userId, $quizId) {
        try {
            $query = "SELECT 
                     qa.id as attempt_id, qa.score, qa.time_taken, qa.completed_at,
                     (SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = :quiz_id) as total_questions,
                     u.id as user_id, u.full_name as student_name
                     FROM quiz_attempts qa
                     JOIN users u ON qa.user_id = u.id
                     WHERE qa.quiz_id = :quiz_id AND qa.user_id = :user_id
                     ORDER BY qa.completed_at DESC
                     LIMIT 1";
                     
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":quiz_id", $quizId);
            $stmt->bindParam(":user_id", $userId);
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$result) {
                return null;
            }
            
            // Calculate percentile
            $query = "SELECT COUNT(*) AS better_scores FROM quiz_attempts
                     WHERE quiz_id = :quiz_id AND score > :score";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":quiz_id", $quizId);
            $stmt->bindParam(":score", $result['score']);
            $stmt->execute();
            $betterScores = $stmt->fetch(PDO::FETCH_ASSOC)['better_scores'];
            
            $query = "SELECT COUNT(*) AS total_attempts FROM quiz_attempts
                     WHERE quiz_id = :quiz_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":quiz_id", $quizId);
            $stmt->execute();
            $totalAttempts = $stmt->fetch(PDO::FETCH_ASSOC)['total_attempts'];
            
            $percentile = 0;
            if ($totalAttempts > 1) {
                $percentile = round((1 - ($betterScores / ($totalAttempts - 1))) * 100);
            }
            
            $result['percentile'] = $percentile;
            
            // Generate feedback based on score
            $percentageScore = ($result['score'] / $result['total_questions']) * 100;
            
            if ($percentageScore >= 90) {
                $result['feedback'] = "Outstanding! You've demonstrated exceptional chess knowledge.";
            } elseif ($percentageScore >= 80) {
                $result['feedback'] = "Excellent work! You have a strong grasp of chess concepts.";
            } elseif ($percentageScore >= 70) {
                $result['feedback'] = "Good job! You're showing solid understanding of chess.";
            } elseif ($percentageScore >= 60) {
                $result['feedback'] = "You're on the right track, but there's room for improvement.";
            } elseif ($percentageScore >= 50) {
                $result['feedback'] = "Keep practicing! Review the topics you missed and try again.";
            } else {
                $result['feedback'] = "Don't get discouraged. Continue studying and try the quiz again later.";
            }
            
            return $result;
            
        } catch (PDOException $e) {
            throw new Exception("Error fetching latest result: " . $e->getMessage());
        }
    }
}
?>
