-- Add these tables to your database structure

CREATE TABLE chess_studies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    rating INT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chess_study_positions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    study_id INT NOT NULL,
    position_fen VARCHAR(255) NOT NULL,
    move_number INT NOT NULL,
    comments TEXT,
    FOREIGN KEY (study_id) REFERENCES chess_studies(id),
    INDEX (study_id)
);

CREATE TABLE user_study_progress (
    user_id INT NOT NULL,
    study_id INT NOT NULL,
    current_position VARCHAR(255) NOT NULL,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, study_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (study_id) REFERENCES chess_studies(id)
);
