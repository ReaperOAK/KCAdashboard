<?php
require_once '../../../config/cors.php';
require_once '../../../config/Database.php';
require_once '../../../models/Support.php';

try {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!isset($data->question) || !isset($data->answer) || !isset($data->category)) {
        throw new Exception('Missing required fields');
    }

    $database = new Database();
    $db = $database->getConnection();
    $support = new Support($db);

    $faqData = [
        'question' => $data->question,
        'answer' => $data->answer,
        'category' => $data->category,
        'created_by' => $_SESSION['user_id'] ?? 1 // Replace with actual user ID from session
    ];

    if ($support->createFaq($faqData)) {
        http_response_code(200);
        echo json_encode(["message" => "FAQ created successfully"]);
    } else {
        throw new Exception('Failed to create FAQ');
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "message" => "Error creating FAQ",
        "error" => $e->getMessage()
    ]);
}
?>
