CREATE TABLE IF NOT EXISTS batches (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    level ENUM('beginner', 'intermediate', 'advanced') NOT NULL,
    schedule TEXT NOT NULL,
    max_students INT NOT NULL DEFAULT 10,
    teacher_id INT NOT NULL,
    status ENUM('active', 'inactive', 'completed') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS batch_students (
    batch_id INT,
    student_id INT,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'inactive', 'completed') DEFAULT 'active',
    PRIMARY KEY (batch_id, student_id),
    FOREIGN KEY (batch_id) REFERENCES batches(id),
    FOREIGN KEY (student_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS batch_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    batch_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    date_time DATETIME NOT NULL,
    duration INT NOT NULL, -- in minutes
    type ENUM('online', 'offline') DEFAULT 'offline',
    meeting_link VARCHAR(512),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (batch_id) REFERENCES batches(id)
);
