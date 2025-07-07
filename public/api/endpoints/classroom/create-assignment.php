<?php
require_once '../../config/cors.php';

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../../config/Database.php';
require_once '../../middleware/auth.php';

try {
    // Validate user auth token
    $user = getAuthUser();
    if (!$user || $user['role'] !== 'teacher') {
        throw new Exception('Unauthorized access');
    }

    // Get JSON data
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    // Validate required fields
    if (!isset($data['classroom_id']) || !isset($data['title']) || !isset($data['due_date'])) {
        throw new Exception('Missing required fields: classroom_id, title, due_date');
    }

    $classroom_id = $data['classroom_id'];
    $title = $data['title'];
    $description = isset($data['description']) ? $data['description'] : '';
    $due_date = $data['due_date'];
    $points = isset($data['points']) ? intval($data['points']) : 100;
    $assignment_type = isset($data['assignment_type']) ? $data['assignment_type'] : 'text';
    $instructions = isset($data['instructions']) ? $data['instructions'] : '';

    // Connect to database
    $database = new Database();
    $db = $database->getConnection();

    // Create classroom_assignments table if it doesn't exist
    $createTableQuery = "
        CREATE TABLE IF NOT EXISTS classroom_assignments (
            id INT(11) AUTO_INCREMENT PRIMARY KEY,
            classroom_id INT(11) NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            instructions TEXT,
            due_date DATETIME NOT NULL,
            points INT DEFAULT 100,
            assignment_type ENUM('text', 'file', 'both') DEFAULT 'both',
            created_by INT(11) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_classroom (classroom_id),
            INDEX idx_due_date (due_date),
            FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE,
            FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ";
    
    $db->exec($createTableQuery);

    // Create assignment_submissions table if it doesn't exist
    $createSubmissionsTable = "
        CREATE TABLE IF NOT EXISTS assignment_submissions (
            id INT(11) AUTO_INCREMENT PRIMARY KEY,
            assignment_id INT(11) NOT NULL,
            student_id INT(11) NOT NULL,
            submission_text TEXT,
            submission_file VARCHAR(512),
            submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            grade DECIMAL(5,2) DEFAULT NULL,
            feedback TEXT,
            graded_by INT(11) DEFAULT NULL,
            graded_at TIMESTAMP NULL,
            status ENUM('submitted', 'graded', 'returned') DEFAULT 'submitted',
            INDEX idx_assignment (assignment_id),
            INDEX idx_student (student_id),
            INDEX idx_status (status),
            UNIQUE KEY unique_submission (assignment_id, student_id),
            FOREIGN KEY (assignment_id) REFERENCES classroom_assignments(id) ON DELETE CASCADE,
            FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (graded_by) REFERENCES users(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ";
    
    $db->exec($createSubmissionsTable);

    // Verify teacher owns this classroom
    $stmt = $db->prepare("SELECT id FROM classrooms WHERE id = :classroom_id AND teacher_id = :teacher_id");
    $stmt->bindParam(':classroom_id', $classroom_id);
    $stmt->bindParam(':teacher_id', $user['id']);
    $stmt->execute();
    
    if ($stmt->rowCount() === 0) {
        throw new Exception('You do not have permission to create assignments in this classroom');
    }

    // Insert the assignment
    $query = "INSERT INTO classroom_assignments (classroom_id, title, description, instructions, due_date, points, assignment_type, created_by) 
              VALUES (:classroom_id, :title, :description, :instructions, :due_date, :points, :assignment_type, :created_by)";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':classroom_id', $classroom_id);
    $stmt->bindParam(':title', $title);
    $stmt->bindParam(':description', $description);
    $stmt->bindParam(':instructions', $instructions);
    $stmt->bindParam(':due_date', $due_date);
    $stmt->bindParam(':points', $points);
    $stmt->bindParam(':assignment_type', $assignment_type);
    $stmt->bindParam(':created_by', $user['id']);
    $stmt->execute();
    
    $assignment_id = $db->lastInsertId();

    // Create notifications for all students in the classroom using NotificationService
    require_once '../../services/NotificationService.php';
    $formatted_due_date = date('M j, Y g:i A', strtotime($due_date));
    $notification_title = 'New Assignment: ' . $title;
    $notification_message = 'A new assignment "' . $title . '" has been posted. Due date: ' . $formatted_due_date;
    $notification_category = 'assignment';
    // Get all students in the classroom
    $stmt = $db->prepare("SELECT student_id FROM classroom_students WHERE classroom_id = :classroom_id");
    $stmt->bindParam(':classroom_id', $classroom_id);
    $stmt->execute();
    $students = $stmt->fetchAll(PDO::FETCH_COLUMN);
    foreach ($students as $student_id) {
        NotificationService::send(
            $db,
            $student_id,
            $notification_title,
            $notification_message,
            $notification_category
        );
    }

    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Assignment created successfully',
        'assignment_id' => $assignment_id,
        'assignment' => [
            'id' => $assignment_id,
            'title' => $title,
            'description' => $description,
            'instructions' => $instructions,
            'due_date' => $due_date,
            'points' => $points,
            'assignment_type' => $assignment_type,
            'created_at' => date('Y-m-d H:i:s')
        ]
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
