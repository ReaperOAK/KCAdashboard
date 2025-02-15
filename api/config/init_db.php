<?php
require_once 'Database.php';
require_once '../models/User.php';

$database = new Database();
$db = $database->getConnection();
$user = new User($db);

// Create classrooms table
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

// Create classroom_students table
$sql = "CREATE TABLE IF NOT EXISTS classroom_students (
    classroom_id INT,
    student_id INT,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (classroom_id, student_id),
    FOREIGN KEY (classroom_id) REFERENCES classrooms(id),
    FOREIGN KEY (student_id) REFERENCES users(id)
)";

$db->exec($sql);

// Admin credentials
$adminData = [
    'email' => 'admin@kca.com',
    'password' => password_hash('admin123', PASSWORD_DEFAULT),
    'role' => 'admin',
    'full_name' => 'Admin'
];

// Check if admin exists
if (!$user->emailExists($adminData['email'])) {
    $user->email = $adminData['email'];
    $user->password = $adminData['password'];
    $user->role = $adminData['role'];
    $user->full_name = $adminData['full_name'];
    
    if ($user->create()) {
        echo "Admin account created successfully\n";
    }
}

// Add sample quizzes
$sampleQuizzes = [
    [
        'title' => 'Chess Openings Basics',
        'description' => 'Test your knowledge of basic chess openings',
        'difficulty' => 'beginner',
        'time_limit' => 15,
        'created_by' => 1 // assuming admin id is 1
    ],
    [
        'title' => 'Tactical Patterns',
        'description' => 'Intermediate level tactical puzzles',
        'difficulty' => 'intermediate',
        'time_limit' => 20,
        'created_by' => 1
    ],
    [
        'title' => 'Advanced Endgames',
        'description' => 'Complex endgame positions',
        'difficulty' => 'advanced',
        'time_limit' => 30,
        'created_by' => 1
    ]
];

foreach ($sampleQuizzes as $quizData) {
    $query = "INSERT INTO quizzes (title, description, difficulty, time_limit, created_by) 
              VALUES (:title, :description, :difficulty, :time_limit, :created_by)";
    
    $stmt = $db->prepare($query);
    $stmt->execute($quizData);
}
?>
