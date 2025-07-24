<?php
header('Content-Type: application/json');
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../middleware/auth.php';

try {
    // Verify JWT token
    $user_id = validateToken();
    
    if (!$user_id) {
        throw new Exception('Unauthorized access');
    }

    // Get database connection
    $database = new Database();
    $db = $database->getConnection();

    // Get user's documents
    $stmt = $db->prepare("
        SELECT id, document_type, file_name, file_path, file_size, mime_type, 
               uploaded_at, is_verified, verified_at
        FROM user_documents 
        WHERE user_id = ? 
        ORDER BY document_type, uploaded_at DESC
    ");
    $stmt->execute([$user_id]);
    $documents = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'documents' => $documents
    ]);

} catch (Exception $e) {
    error_log("Get documents error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
