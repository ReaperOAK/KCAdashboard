-- Create simul_games table
CREATE TABLE IF NOT EXISTS simul_games (
    id INT(11) NOT NULL AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    host_id INT(11) NOT NULL,
    start_time DATETIME NOT NULL,
    max_participants INT(11) DEFAULT 20,
    status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
    results_link VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (host_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create simul_participants table
CREATE TABLE IF NOT EXISTS simul_participants (
    id INT(11) NOT NULL AUTO_INCREMENT,
    simul_id INT(11) NOT NULL,
    user_id INT(11) NOT NULL,
    registration_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    result ENUM('win', 'loss', 'draw'),
    PRIMARY KEY (id),
    FOREIGN KEY (simul_id) REFERENCES simul_games(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY unique_participant (simul_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add indexes for better query performance
CREATE INDEX idx_simul_games_start_time ON simul_games(start_time);
CREATE INDEX idx_simul_games_host ON simul_games(host_id);
CREATE INDEX idx_simul_participants_user ON simul_participants(user_id);
