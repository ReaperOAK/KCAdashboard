-- Create quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
    id INT(11) NOT NULL AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    time_limit INT NOT NULL,
    active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

-- Create quiz questions table
CREATE TABLE IF NOT EXISTS quiz_questions (
    id INT(11) NOT NULL AUTO_INCREMENT,
    quiz_id INT(11),
    question_text TEXT NOT NULL,
    options JSON NOT NULL,
    correct_answer VARCHAR(255) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
);

-- Create quiz results table
CREATE TABLE IF NOT EXISTS quiz_results (
    id INT(11) NOT NULL AUTO_INCREMENT,
    user_id INT(11),
    quiz_id INT(11),
    score FLOAT NOT NULL,
    correct_answers INT NOT NULL,
    total_questions INT NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
);

-- Add indexes for better performance
CREATE INDEX idx_quiz_active ON quizzes(active);
CREATE INDEX idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
CREATE INDEX idx_quiz_results_user_quiz ON quiz_results(user_id, quiz_id);

-- Sample data for testing
INSERT INTO quizzes (title, description, time_limit) VALUES
('Chess Openings Basics', 'Test your knowledge of basic chess openings', 15),
('Endgame Fundamentals', 'Essential endgame positions and principles', 20),
('Tactical Patterns', 'Common tactical patterns and combinations', 30);

-- Sample questions (using JSON for options)
INSERT INTO quiz_questions (quiz_id, question_text, options, correct_answer) VALUES
(1, 'What is the most common first move in chess?', 
    '["e4", "d4", "Nf3", "c4"]', 'e4'),
(1, 'Which opening starts with 1.e4 e5 2.Nf3?', 
    '["Ruy Lopez", "Italian Game", "Sicilian Defense", "French Defense"]', 'Italian Game'),
(2, 'In a King and Pawn endgame, which is the most important concept?', 
    '["Opposition", "Zugzwang", "Tempo", "Square Rule"]', 'Opposition');
