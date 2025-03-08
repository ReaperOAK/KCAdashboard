<?php
require_once 'Database.php';
require_once '../models/User.php';

$database = new Database();
$db = $database->getConnection();
$user = new User($db);

// Authentication & Users Tables
$sql = "CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'teacher', 'admin') NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    google_id VARCHAR(255) UNIQUE,
    profile_picture VARCHAR(255)
)";
$db->exec($sql);

// Add status column to users table if it doesn't exist
$sql = "ALTER TABLE users ADD COLUMN IF NOT EXISTS 
        status ENUM('active', 'inactive', 'suspended') DEFAULT 'active'";
$db->exec($sql);

$sql = "CREATE TABLE IF NOT EXISTS auth_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
)";
$db->exec($sql);

// Add password resets table
$sql = "CREATE TABLE IF NOT EXISTS password_resets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX (token),
    INDEX (expires_at)
)";
$db->exec($sql);

// Educational Content Tables
$sql = "CREATE TABLE IF NOT EXISTS classrooms (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    teacher_id INT NOT NULL,
    schedule TEXT,
    status ENUM('active', 'archived', 'upcoming') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users(id)
)";
$db->exec($sql);

$sql = "CREATE TABLE IF NOT EXISTS classroom_students (
    classroom_id INT,
    student_id INT,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (classroom_id, student_id),
    FOREIGN KEY (classroom_id) REFERENCES classrooms(id),
    FOREIGN KEY (student_id) REFERENCES users(id)
)";
$db->exec($sql);

$sql = "CREATE TABLE IF NOT EXISTS batches (
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
)";
$db->exec($sql);

$sql = "CREATE TABLE IF NOT EXISTS batch_students (
    batch_id INT,
    student_id INT,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'inactive', 'completed') DEFAULT 'active',
    PRIMARY KEY (batch_id, student_id),
    FOREIGN KEY (batch_id) REFERENCES batches(id),
    FOREIGN KEY (student_id) REFERENCES users(id)
)";
$db->exec($sql);

$sql = "CREATE TABLE IF NOT EXISTS batch_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    batch_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    date_time DATETIME NOT NULL,
    duration INT NOT NULL,
    type ENUM('online', 'offline') DEFAULT 'offline',
    meeting_link VARCHAR(512),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (batch_id) REFERENCES batches(id)
)";
$db->exec($sql);

// Add reminder_sent column to batch_sessions if it doesn't exist
$sql = "ALTER TABLE batch_sessions 
        ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT 0,
        ADD COLUMN IF NOT EXISTS attendance_taken BOOLEAN DEFAULT 0,
        ADD COLUMN IF NOT EXISTS online_meeting_id VARCHAR(255)";
$db->exec($sql);

// Assessment & Feedback Tables
$sql = "CREATE TABLE IF NOT EXISTS quizzes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    difficulty ENUM('beginner', 'intermediate', 'advanced') NOT NULL,
    time_limit INT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
)";
$db->exec($sql);

$sql = "CREATE TABLE IF NOT EXISTS quiz_questions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    quiz_id INT NOT NULL,
    question TEXT NOT NULL,
    image_url VARCHAR(512),
    type ENUM('multiple_choice', 'puzzle') NOT NULL,
    points INT DEFAULT 1,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
)";
$db->exec($sql);

$sql = "CREATE TABLE IF NOT EXISTS quiz_answers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    question_id INT NOT NULL,
    answer_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    FOREIGN KEY (question_id) REFERENCES quiz_questions(id)
)";
$db->exec($sql);

$sql = "CREATE TABLE IF NOT EXISTS quiz_attempts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    quiz_id INT NOT NULL,
    score INT NOT NULL,
    time_taken INT,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
)";
$db->exec($sql);

$sql = "CREATE TABLE IF NOT EXISTS student_feedback (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    teacher_id INT NOT NULL,
    rating INT NOT NULL,
    comment TEXT,
    areas_of_improvement TEXT,
    strengths TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (teacher_id) REFERENCES users(id)
)";
$db->exec($sql);

// Chess Content Tables
$sql = "CREATE TABLE IF NOT EXISTS pgn_files (
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
)";
$db->exec($sql);

$sql = "CREATE TABLE IF NOT EXISTS tournaments (
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
)";
$db->exec($sql);

$sql = "CREATE TABLE IF NOT EXISTS tournament_registrations (
    tournament_id INT,
    user_id INT,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_status ENUM('pending', 'completed', 'refunded') DEFAULT 'pending',
    PRIMARY KEY (tournament_id, user_id),
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
)";
$db->exec($sql);

// Resources & Materials Tables
$sql = "CREATE TABLE IF NOT EXISTS resources (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type ENUM('pgn', 'pdf', 'video', 'link') NOT NULL,
    url VARCHAR(512) NOT NULL,
    category VARCHAR(100) NOT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
)";
$db->exec($sql);

$sql = "CREATE TABLE IF NOT EXISTS resource_access (
    resource_id INT,
    user_id INT,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (resource_id, user_id),
    FOREIGN KEY (resource_id) REFERENCES resources(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
)";
$db->exec($sql);

// Notifications Table
$sql = "CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)";
$db->exec($sql);

// Attendance Tables
$sql = "CREATE TABLE IF NOT EXISTS attendance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    batch_id INT NOT NULL,
    session_id INT NOT NULL,
    status ENUM('present', 'absent', 'excused', 'late') NOT NULL,
    marked_by INT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (batch_id) REFERENCES batches(id),
    FOREIGN KEY (session_id) REFERENCES batch_sessions(id),
    FOREIGN KEY (marked_by) REFERENCES users(id)
)";
$db->exec($sql);

// Update attendance table with additional fields
$sql = "ALTER TABLE attendance 
        ADD COLUMN IF NOT EXISTS check_in_time DATETIME,
        ADD COLUMN IF NOT EXISTS check_out_time DATETIME,
        ADD COLUMN IF NOT EXISTS online_duration INT,
        ADD COLUMN IF NOT EXISTS platform VARCHAR(50),
        ADD COLUMN IF NOT EXISTS sync_source VARCHAR(50)";
$db->exec($sql);

// Create attendance_settings table if not exists
$sql = "CREATE TABLE IF NOT EXISTS attendance_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    min_attendance_percent INT DEFAULT 75,
    late_threshold_minutes INT DEFAULT 15,
    auto_mark_absent_after_minutes INT DEFAULT 30,
    reminder_before_minutes INT DEFAULT 60,
    zoom_api_key VARCHAR(255),
    zoom_api_secret VARCHAR(255),
    google_meet_credentials TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)";
$db->exec($sql);

// Create online_meeting_sync_logs table
$sql = "CREATE TABLE IF NOT EXISTS online_meeting_sync_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    session_id INT NOT NULL,
    platform VARCHAR(50) NOT NULL,
    meeting_id VARCHAR(255) NOT NULL,
    sync_status ENUM('success', 'failed') NOT NULL,
    error_message TEXT,
    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES batch_sessions(id)
)";
$db->exec($sql);

// Insert default attendance settings if not exists
$sql = "INSERT IGNORE INTO attendance_settings 
        (id, min_attendance_percent, late_threshold_minutes, auto_mark_absent_after_minutes, reminder_before_minutes) 
        VALUES (1, 75, 15, 30, 60)";
$db->exec($sql);

// Add indexes for performance
$sql = "ALTER TABLE attendance 
        ADD INDEX idx_student_date (student_id, created_at),
        ADD INDEX idx_batch_date (batch_id, created_at),
        ADD INDEX idx_session_status (session_id, status)";
$db->exec($sql);

// Support System Tables
$sql = "CREATE TABLE IF NOT EXISTS support_tickets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    category VARCHAR(100) NOT NULL,
    assigned_to INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id)
)";
$db->exec($sql);

$sql = "CREATE TABLE IF NOT EXISTS ticket_responses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ticket_id INT NOT NULL,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES support_tickets(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
)";
$db->exec($sql);

$sql = "CREATE TABLE IF NOT EXISTS faqs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    is_published BOOLEAN DEFAULT TRUE,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
)";
$db->exec($sql);

// Add after existing tables...

$sql = "CREATE TABLE IF NOT EXISTS permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";
$db->exec($sql);

$sql = "CREATE TABLE IF NOT EXISTS user_permissions (
    user_id INT NOT NULL,
    permission_id INT NOT NULL,
    granted_by INT NOT NULL,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, permission_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    FOREIGN KEY (granted_by) REFERENCES users(id)
)";
$db->exec($sql);

$sql = "CREATE TABLE IF NOT EXISTS activity_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)";
$db->exec($sql);

$sql = "CREATE TABLE IF NOT EXISTS role_permissions (
    role VARCHAR(50) NOT NULL,
    permission_id INT NOT NULL,
    PRIMARY KEY (role, permission_id),
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
)";
$db->exec($sql);

// Add PGN sharing table
$sql = "CREATE TABLE IF NOT EXISTS pgn_shares (
    pgn_id INT NOT NULL,
    user_id INT NOT NULL,
    permission ENUM('view', 'edit') DEFAULT 'view',
    shared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (pgn_id, user_id),
    FOREIGN KEY (pgn_id) REFERENCES pgn_files(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)";
$db->exec($sql);

// Create default admin account if it doesn't exist
if (!$user->emailExists('admin@kca.com')) {
    $user->email = 'admin@kca.com';
    $user->password = password_hash('admin123', PASSWORD_DEFAULT);
    $user->role = 'admin';
    $user->full_name = 'Admin';
    $user->create();
}

echo "Database initialization completed successfully!\n";
?>
