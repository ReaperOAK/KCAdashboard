<?php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../models/Analytics.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    $analytics = new Analytics($db);

    // Get batch_id from URL parameter
    $batch_id = isset($_GET['batch']) ? $_GET['batch'] : 'all';
    
    // Get user_id from token (implement proper token validation)
    $headers = getallheaders();
    $token = str_replace('Bearer ', '', $headers['Authorization'] ?? '');
    $teacher_id = 1; // Temporary! Replace with actual teacher_id from token

    $stats = $analytics->getTeacherStats($teacher_id, $batch_id);
    $batches = $analytics->getTeacherBatches($teacher_id);

    http_response_code(200);
    header('Content-Type: application/json');
    echo json_encode([
        "stats" => [
            "attendanceData" => [
                "labels" => ["Week 1", "Week 2", "Week 3", "Week 4"],
                "datasets" => [
                    [
                        "label" => "Attendance %",
                        "data" => [85, 88, 82, 90],
                        "borderColor" => "#461fa3",
                        "backgroundColor" => "rgba(70, 31, 163, 0.1)"
                    ]
                ]
            ],
            "performanceData" => [
                "labels" => ["Quiz 1", "Quiz 2", "Quiz 3", "Quiz 4"],
                "datasets" => [
                    [
                        "label" => "Average Score",
                        "data" => [75, 82, 78, 85],
                        "backgroundColor" => "#7646eb"
                    ]
                ]
            ],
            "quizStats" => [
                "labels" => ["Excellent", "Good", "Average", "Needs Improvement"],
                "datasets" => [
                    [
                        "data" => [30, 40, 20, 10],
                        "backgroundColor" => [
                            "#32CD32",
                            "#461fa3",
                            "#FFA500",
                            "#FF6B6B"
                        ]
                    ]
                ]
            ]
        ],
        "batches" => $batches
    ]);

} catch (Exception $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        "message" => "Error fetching analytics",
        "error" => $e->getMessage()
    ]);
}
?>
