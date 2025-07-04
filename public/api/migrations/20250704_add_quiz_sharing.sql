
-- Table for sharing quizzes with batches
CREATE TABLE IF NOT EXISTS quiz_batch_shares (
    quiz_id INT NOT NULL,
    batch_id INT NOT NULL,
    shared_by INT NOT NULL,
    shared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (quiz_id, batch_id),
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE,
    FOREIGN KEY (shared_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Table for sharing quizzes with classrooms (optional, if you want to keep it distinct)
CREATE TABLE IF NOT EXISTS quiz_classroom_shares (
    quiz_id INT NOT NULL,
    classroom_id INT NOT NULL,
    shared_by INT NOT NULL,
    shared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (quiz_id, classroom_id),
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE,
    FOREIGN KEY (shared_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Table for sharing quizzes with individual students
CREATE TABLE IF NOT EXISTS quiz_student_shares (
    quiz_id INT NOT NULL,
    student_id INT NOT NULL,
    shared_by INT NOT NULL,
    shared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (quiz_id, student_id),
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (shared_by) REFERENCES users(id) ON DELETE SET NULL
);
