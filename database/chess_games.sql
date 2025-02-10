CREATE TABLE IF NOT EXISTS chess_games (
    id INT(11) NOT NULL AUTO_INCREMENT,
    user_id INT(11) NOT NULL,
    lichess_game_id VARCHAR(12) NOT NULL,
    game_mode ENUM('ai', 'player', 'practice') NOT NULL,
    time_control VARCHAR(10) NOT NULL,
    color ENUM('white', 'black', 'random') NOT NULL,
    ai_level INT(2),
    status ENUM('active', 'completed', 'abandoned') NOT NULL DEFAULT 'active',
    result VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY user_id (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
