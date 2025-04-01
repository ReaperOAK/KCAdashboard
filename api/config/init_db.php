<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set higher time limits for this script
ini_set('max_execution_time', 300); // 5 minutes
ini_set('memory_limit', '256M');

require_once 'Database.php';
require_once '../models/User.php';

// Function to log progress
function log_progress($message) {
    echo $message . "<br>";
    ob_flush();
    flush();
}

try {
    log_progress("Starting database initialization...");
    
    $database = new Database();
    $db = $database->getConnection();
    log_progress("Database connection established.");
    
    // No transaction - removing transaction management since it's causing issues
    
    // Authentication & Users Tables
    log_progress("Creating users table...");
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
    log_progress("Adding status column to users table if needed...");
    try {
        $sql = "ALTER TABLE users ADD COLUMN 
            status ENUM('active', 'inactive', 'suspended') DEFAULT 'active'";
        $db->exec($sql);
    } catch (PDOException $e) {
        // Column may already exist, which is fine
        log_progress("Note: Status column may already exist: " . $e->getMessage());
    }
    
    // Continue with other tables
    log_progress("Creating auth_tokens table...");
    $sql = "CREATE TABLE IF NOT EXISTS auth_tokens (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        token VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )";
    $db->exec($sql);
    
    log_progress("Creating password_resets table...");
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
    
    log_progress("Creating classrooms table...");
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
    
    log_progress("Creating tournaments table...");
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

    log_progress("Creating tournament_registrations table...");
    $sql = "CREATE TABLE IF NOT EXISTS tournament_registrations (
        tournament_id INT,
        user_id INT,
        registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        payment_status ENUM('pending', 'completed', 'refunded') DEFAULT 'pending',
        PRIMARY KEY (tournament_id, user_id),
        FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )";
    $db->exec($sql);

    log_progress("Creating tournament_payments table...");
    $sql = "CREATE TABLE IF NOT EXISTS tournament_payments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        tournament_id INT NOT NULL,
        user_id INT NOT NULL,
        screenshot_path VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        verified_by INT,
        verified_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
    )";
    $db->exec($sql);

    log_progress("Creating tournament_results table...");
    $sql = "CREATE TABLE IF NOT EXISTS tournament_results (
        id INT PRIMARY KEY AUTO_INCREMENT,
        tournament_id INT NOT NULL,
        user_id INT NOT NULL,
        position INT NOT NULL,
        score DECIMAL(10,2) DEFAULT 0,
        prize_amount DECIMAL(10,2) DEFAULT 0,
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_participant_result (tournament_id, user_id)
    )";
    $db->exec($sql);

    // Create necessary directories for file uploads
    log_progress("Creating upload directories...");
    
    // Define directories relative to the script location
    $base_path = dirname(__FILE__) . '/../../';
    $upload_dirs = [
        'api/uploads',
        'api/uploads/payments',
        'api/uploads/profiles',
        'api/uploads/resources'
    ];
    
    foreach ($upload_dirs as $dir) {
        $full_path = $base_path . $dir;
        if (!file_exists($full_path)) {
            if (@mkdir($full_path, 0755, true)) {
                log_progress("Created directory: $dir");
            } else {
                log_progress("Warning: Failed to create directory: $dir (may require manual creation)");
            }
        } else {
            log_progress("Directory already exists: $dir");
        }
    }
    
    // Create default admin account if it doesn't exist
    log_progress("Checking for default admin account...");
    try {
        $user = new User($db);
        if (!$user->emailExists('admin@kca.com')) {
            log_progress("Creating default admin account...");
            $user->email = 'admin@kca.com';
            $user->password = password_hash('admin123', PASSWORD_DEFAULT);
            $user->role = 'admin';
            $user->full_name = 'Admin';
            $result = $user->create();
            
            if ($result) {
                log_progress("Admin account created successfully!");
            } else {
                log_progress("Warning: Failed to create admin account. You may need to create it manually.");
            }
        } else {
            log_progress("Admin account already exists");
        }
    } catch (Exception $e) {
        log_progress("Error creating admin account: " . $e->getMessage());
    }
    
    log_progress("Database initialization completed successfully!");
    
} catch (Exception $e) {
    echo "<div style='color: red; font-weight: bold; margin: 20px;'>";
    echo "Error: " . $e->getMessage() . "<br>";
    echo "File: " . $e->getFile() . "<br>";
    echo "Line: " . $e->getLine() . "<br>";
    echo "Trace: <pre>" . $e->getTraceAsString() . "</pre>";
    echo "</div>";
}
?>

<html>
<head>
    <title>Database Initialization</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            line-height: 1.6;
        }
        .success {
            color: green;
            font-weight: bold;
        }
        .error {
            color: red;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <h1>Database Initialization Process</h1>
    <div id="progress">
        <!-- Progress is displayed here -->
    </div>
</body>
</html>
