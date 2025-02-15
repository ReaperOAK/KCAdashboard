CREATE TABLE IF NOT EXISTS pgn_files (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category ENUM('opening', 'middlegame', 'endgame', 'tactics', 'strategy') NOT NULL,
    pgn_content TEXT NOT NULL,
    file_path VARCHAR(512),
    is_public BOOLEAN DEFAULT FALSE,
    teacher_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users(id)
);
