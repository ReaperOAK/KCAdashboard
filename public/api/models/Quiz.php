<?php
class Quiz {
    private $conn;
    private $table_name = "quizzes";

    public $id;
    public $title;
    public $description;
    public $difficulty;
    public $time_limit;
    public $status;
    public $created_by;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAll() {
        try {            $query = "SELECT q.*, u.full_name as creator_name 
                     FROM " . $this->table_name . " q
                     JOIN users u ON q.created_by = u.id
                     WHERE q.status = 'published'
                     ORDER BY q.created_at DESC";

            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new Exception("Error fetching quizzes: " . $e->getMessage());
        }
    }

    public function getByDifficulty($difficulty) {
        try {            $query = "SELECT q.*, u.full_name as creator_name 
                     FROM " . $this->table_name . " q
                     JOIN users u ON q.created_by = u.id
                     WHERE q.difficulty = :difficulty AND q.status = 'published'
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
            }              // Get questions for this quiz
            $query = "SELECT *, correct_moves, pgn_data, expected_player_color FROM quiz_questions WHERE quiz_id = :quiz_id ORDER BY id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":quiz_id", $id);
            $stmt->execute();
            $questions = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // For each question, get its answers and parse chess data
            foreach ($questions as $key => $question) {
                // Parse correct_moves JSON for chess questions
                if ($question['type'] === 'chess' && $question['correct_moves']) {
                    $questions[$key]['correct_moves'] = json_decode($question['correct_moves'], true);
                }
                
                // Get answers for multiple choice questions
                if ($question['type'] === 'multiple_choice') {
                    $query = "SELECT * FROM quiz_answers WHERE question_id = :question_id";
                    $stmt = $this->conn->prepare($query);
                    $stmt->bindParam(":question_id", $question['id']);
                    $stmt->execute();
                    $questions[$key]['answers'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
                }
            }
            
            $quiz['questions'] = $questions;
            return $quiz;
            
        } catch (PDOException $e) {
            throw new Exception("Error fetching quiz by ID: " . $e->getMessage());
        }
    }
      public function submitQuiz($userId, $quizId, $answers, $chessMoves, $timeTaken) {
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
              // Get all questions with their types and correct answers/moves
            $query = "SELECT qq.*, qa.is_correct, qa.id as answer_id 
                     FROM quiz_questions qq
                     LEFT JOIN quiz_answers qa ON qq.id = qa.question_id
                     WHERE qq.quiz_id = :quiz_id
                     ORDER BY qq.id, qa.id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":quiz_id", $quizId);
            $stmt->execute();
            $questionData = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Organize questions by type
            $questions = [];
            foreach ($questionData as $row) {
                if (!isset($questions[$row['id']])) {
                    $questions[$row['id']] = [
                        'type' => $row['type'],
                        'correct_moves' => $row['correct_moves'] ? json_decode($row['correct_moves'], true) : null,
                        'pgn_data' => $row['pgn_data'],
                        'expected_player_color' => $row['expected_player_color'],
                        'correct_answers' => []
                    ];
                }
                if ($row['is_correct'] == 1) {
                    $questions[$row['id']]['correct_answers'][] = $row['answer_id'];
                }
            }
            
            // Calculate score
            $score = 0;
            $totalQuestions = count($questions);
              foreach ($questions as $questionId => $questionInfo) {
                if ($questionInfo['type'] === 'chess') {
                    // Check chess moves
                    if (isset($chessMoves->{$questionId})) {
                        $userMove = $chessMoves->{$questionId};
                        
                        if ($questionInfo['pgn_data']) {
                            // PGN-based question: check if sequence was completed or correct move was made
                            if (isset($userMove->completed) && $userMove->completed) {
                                $score++;
                            } elseif (isset($userMove->isCorrect) && $userMove->isCorrect) {
                                $score++;
                            }
                        } elseif ($questionInfo['correct_moves']) {
                            // FEN-based question: check against correct moves
                            $correctMoves = $questionInfo['correct_moves'];
                            
                            // Check if user move matches any correct move
                            foreach ($correctMoves as $correctMove) {
                                if (isset($userMove->from) && isset($userMove->to) &&
                                    $userMove->from === $correctMove['from'] && 
                                    $userMove->to === $correctMove['to']) {
                                    $score++;
                                    break;
                                }
                            }
                        }
                    }
                } else {
                    // Check multiple choice answers
                    if (isset($answers->{$questionId}) && 
                        in_array($answers->{$questionId}, $questionInfo['correct_answers'])) {
                        $score++;
                    }
                }}
            
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
    
    // Get quizzes created by a specific teacher
    public function getTeacherQuizzes($teacherId, $difficulty = null) {
        try {
            $query = "SELECT q.*, 
                     (SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = q.id) as question_count,
                     u.full_name as creator_name 
                     FROM " . $this->table_name . " q
                     JOIN users u ON q.created_by = u.id
                     WHERE q.created_by = :teacher_id";
                     
            if ($difficulty) {
                $query .= " AND q.difficulty = :difficulty";
            }
            
            $query .= " ORDER BY q.created_at DESC";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":teacher_id", $teacherId);
            
            if ($difficulty) {
                $stmt->bindParam(":difficulty", $difficulty);
            }
            
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new Exception("Error fetching teacher quizzes: " . $e->getMessage());
        }
    }
      // Create a new quiz
    public function create($data) {
        try {
            $this->conn->beginTransaction();
            
            // Insert the quiz
            $query = "INSERT INTO " . $this->table_name . " 
                    (title, description, difficulty, time_limit, status, created_by) 
                    VALUES (:title, :description, :difficulty, :time_limit, :status, :created_by)";
            
            $stmt = $this->conn->prepare($query);
            
            // Clean and bind data
            $title = htmlspecialchars(strip_tags($data['title']));
            $description = htmlspecialchars(strip_tags($data['description'] ?? ''));
            $difficulty = htmlspecialchars(strip_tags($data['difficulty']));
            $time_limit = (int)$data['time_limit'];
            $status = isset($data['status']) ? htmlspecialchars(strip_tags($data['status'])) : 'draft';
            
            $stmt->bindParam(":title", $title);
            $stmt->bindParam(":description", $description);
            $stmt->bindParam(":difficulty", $difficulty);
            $stmt->bindParam(":time_limit", $time_limit);
            $stmt->bindParam(":status", $status);
            $stmt->bindParam(":created_by", $data['created_by']);
            
            $stmt->execute();
            $quizId = $this->conn->lastInsertId();
            
            // Add questions if any
            if (isset($data['questions']) && is_array($data['questions']) && count($data['questions']) > 0) {
                $this->addQuestions($quizId, $data['questions']);
            }
            
            $this->conn->commit();
            return $quizId;
            
        } catch (Exception $e) {
            $this->conn->rollBack();
            throw new Exception("Error creating quiz: " . $e->getMessage());
        }
    }
    
    // Update an existing quiz
    public function update($id, $data, $teacherId) {
        try {
            $this->conn->beginTransaction();
            
            // Verify that quiz belongs to the teacher
            $query = "SELECT id FROM " . $this->table_name . " WHERE id = :id AND created_by = :teacher_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":id", $id);
            $stmt->bindParam(":teacher_id", $teacherId);
            $stmt->execute();
            
            if ($stmt->rowCount() === 0) {
                throw new Exception("Quiz not found or you don't have permission to edit it");
            }
              // Update the quiz
            $query = "UPDATE " . $this->table_name . " SET 
                     title = :title, 
                     description = :description, 
                     difficulty = :difficulty, 
                     time_limit = :time_limit,
                     status = :status 
                     WHERE id = :id";
                     
            $stmt = $this->conn->prepare($query);
            
            // Clean and bind data
            $title = htmlspecialchars(strip_tags($data['title']));
            $description = htmlspecialchars(strip_tags($data['description'] ?? ''));
            $difficulty = htmlspecialchars(strip_tags($data['difficulty']));
            $time_limit = (int)$data['time_limit'];
            $status = isset($data['status']) ? htmlspecialchars(strip_tags($data['status'])) : 'draft';
            
            $stmt->bindParam(":title", $title);
            $stmt->bindParam(":description", $description);
            $stmt->bindParam(":difficulty", $difficulty);
            $stmt->bindParam(":time_limit", $time_limit);
            $stmt->bindParam(":status", $status);
            $stmt->bindParam(":id", $id);
            
            $stmt->execute();
            
            // Handle questions update
            if (isset($data['questions']) && is_array($data['questions'])) {
                // Delete existing questions and answers
                $this->deleteQuizQuestions($id);
                
                // Add updated questions
                $this->addQuestions($id, $data['questions']);
            }
            
            $this->conn->commit();
            return true;
            
        } catch (Exception $e) {
            $this->conn->rollBack();
            throw new Exception("Error updating quiz: " . $e->getMessage());
        }
    }
    
    // Delete a quiz
    public function delete($id, $teacherId) {
        try {
            // Verify quiz ownership
            $query = "SELECT id FROM " . $this->table_name . " WHERE id = :id AND created_by = :teacher_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":id", $id);
            $stmt->bindParam(":teacher_id", $teacherId);
            $stmt->execute();
            
            if ($stmt->rowCount() === 0) {
                throw new Exception("Quiz not found or you don't have permission to delete it");
            }
            
            $this->conn->beginTransaction();
            
            // First delete all answers for this quiz
            $query = "DELETE qa FROM quiz_answers qa
                     JOIN quiz_questions qq ON qa.question_id = qq.id
                     WHERE qq.quiz_id = :quiz_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":quiz_id", $id);
            $stmt->execute();
            
            // Then delete questions
            $query = "DELETE FROM quiz_questions WHERE quiz_id = :quiz_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":quiz_id", $id);
            $stmt->execute();
            
            // Finally delete quiz attempts and the quiz itself
            $query = "DELETE FROM quiz_attempts WHERE quiz_id = :quiz_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":quiz_id", $id);
            $stmt->execute();
            
            $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":id", $id);
            $stmt->execute();
            
            $this->conn->commit();
            return true;
            
        } catch (Exception $e) {
            if ($this->conn->inTransaction()) {
                $this->conn->rollBack();
            }
            throw new Exception("Error deleting quiz: " . $e->getMessage());
        }
    }
      // Helper method to add questions to a quiz
    private function addQuestions($quizId, $questions) {
        foreach ($questions as $question) {
            $type = isset($question['type']) ? $question['type'] : 'multiple_choice';
              if ($type === 'chess') {
                // Handle chess questions
                $query = "INSERT INTO quiz_questions (quiz_id, question, image_url, type, chess_position, chess_orientation, correct_moves, pgn_data, expected_player_color) 
                         VALUES (:quiz_id, :question, :image_url, :type, :chess_position, :chess_orientation, :correct_moves, :pgn_data, :expected_player_color)";
                $stmt = $this->conn->prepare($query);
                
                $questionText = htmlspecialchars(strip_tags($question['question']));
                $imageUrl = isset($question['image_url']) ? htmlspecialchars(strip_tags($question['image_url'])) : '';
                $chessPosition = isset($question['chess_position']) ? $question['chess_position'] : 'start';
                $chessOrientation = isset($question['chess_orientation']) ? $question['chess_orientation'] : 'white';
                $correctMoves = isset($question['correct_moves']) ? json_encode($question['correct_moves']) : null;
                $pgnData = isset($question['pgn_data']) ? $question['pgn_data'] : null;
                $expectedPlayerColor = isset($question['expected_player_color']) ? $question['expected_player_color'] : 'white';
                
                $stmt->bindParam(":quiz_id", $quizId);
                $stmt->bindParam(":question", $questionText);
                $stmt->bindParam(":image_url", $imageUrl);
                $stmt->bindParam(":type", $type);
                $stmt->bindParam(":chess_position", $chessPosition);
                $stmt->bindParam(":chess_orientation", $chessOrientation);
                $stmt->bindParam(":correct_moves", $correctMoves);
                $stmt->bindParam(":pgn_data", $pgnData);
                $stmt->bindParam(":expected_player_color", $expectedPlayerColor);
                
                $stmt->execute();
            } else {
                // Handle regular multiple choice questions
                $query = "INSERT INTO quiz_questions (quiz_id, question, image_url, type) 
                         VALUES (:quiz_id, :question, :image_url, :type)";
                $stmt = $this->conn->prepare($query);
                
                $questionText = htmlspecialchars(strip_tags($question['question']));
                $imageUrl = isset($question['image_url']) ? htmlspecialchars(strip_tags($question['image_url'])) : '';
                
                $stmt->bindParam(":quiz_id", $quizId);
                $stmt->bindParam(":question", $questionText);
                $stmt->bindParam(":image_url", $imageUrl);
                $stmt->bindParam(":type", $type);
                
                $stmt->execute();
                $questionId = $this->conn->lastInsertId();
                
                // Add answers for multiple choice questions
                if (isset($question['answers']) && is_array($question['answers'])) {
                    foreach ($question['answers'] as $answer) {
                        $query = "INSERT INTO quiz_answers (question_id, answer_text, is_correct) 
                                 VALUES (:question_id, :answer_text, :is_correct)";
                        $stmt = $this->conn->prepare($query);
                        
                        $answerText = htmlspecialchars(strip_tags($answer['answer_text']));
                        $isCorrect = $answer['is_correct'] ? 1 : 0;
                        
                        $stmt->bindParam(":question_id", $questionId);
                        $stmt->bindParam(":answer_text", $answerText);
                        $stmt->bindParam(":is_correct", $isCorrect);
                        
                        $stmt->execute();
                    }
                }
            }
        }
    }
    
    // Helper method to delete questions (and answers) for a quiz
    private function deleteQuizQuestions($quizId) {
        // Get questions for this quiz
        $query = "SELECT id FROM quiz_questions WHERE quiz_id = :quiz_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":quiz_id", $quizId);
        $stmt->execute();
        $questions = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Delete answers for each question
        foreach ($questions as $question) {
            $query = "DELETE FROM quiz_answers WHERE question_id = :question_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":question_id", $question['id']);
            $stmt->execute();
        }
        
        // Delete questions
        $query = "DELETE FROM quiz_questions WHERE quiz_id = :quiz_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":quiz_id", $quizId);
        $stmt->execute();
    }
}
?>
