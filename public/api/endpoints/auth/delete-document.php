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

    // Get request data
    $data = json_decode(file_get_contents("php://input"));

    if (!$data || !isset($data->document_id)) {
        throw new Exception('Document ID is required');
    }

    // Start transaction
    $db->beginTransaction();

    try {
        // Get document details and verify ownership
        $stmt = $db->prepare("
            SELECT file_path, document_type 
            FROM user_documents 
            WHERE id = ? AND user_id = ?
        ");
        $stmt->execute([$data->document_id, $user_id]);
        $document = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$document) {
            throw new Exception('Document not found or access denied');
        }

        // Delete the file from filesystem
        $file_path = '../../' . $document['file_path'];
        if (file_exists($file_path)) {
            unlink($file_path);
        }

        // Delete document record
        $stmt = $db->prepare("DELETE FROM user_documents WHERE id = ? AND user_id = ?");
        $stmt->execute([$data->document_id, $user_id]);

        // Update users table if it's a profile picture or DOB certificate
        if ($document['document_type'] === 'profile_picture') {
            $stmt = $db->prepare("
                UPDATE users 
                SET profile_picture_url = NULL, updated_at = CURRENT_TIMESTAMP 
                WHERE id = ?
            ");
            $stmt->execute([$user_id]);
        } elseif ($document['document_type'] === 'dob_certificate') {
            $stmt = $db->prepare("
                UPDATE users 
                SET dob_certificate_url = NULL, updated_at = CURRENT_TIMESTAMP 
                WHERE id = ?
            ");
            $stmt->execute([$user_id]);
        }

        $db->commit();

        echo json_encode([
            'success' => true,
            'message' => 'Document deleted successfully'
        ]);

    } catch (Exception $e) {
        $db->rollBack();
        throw $e;
    }

} catch (Exception $e) {
    error_log("Delete document error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
