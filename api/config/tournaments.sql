CREATE TABLE IF NOT EXISTS tournaments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date_time DATETIME NOT NULL,
    location VARCHAR(255),
    type ENUM('online', 'offline') NOT NULL,
    entry_fee DECIMAL(10,2),
    prize_pool DECIMAL(10,2),
    max_participants INT,
    status ENUM('upcoming', 'ongoing', 'completed', 'cancelled') DEFAULT 'upcoming',
    lichess_id VARCHAR(255),
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS tournament_registrations (
    tournament_id INT,
    user_id INT,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_status ENUM('pending', 'completed', 'refunded') DEFAULT 'pending',
    PRIMARY KEY (tournament_id, user_id),
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
