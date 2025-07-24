<?php
header('Content-Type: application/json');
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../middleware/auth.php';

try {
    // Authenticate and verify admin role
    $currentUser = getAuthUser();
    if (!$currentUser) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Authentication required']);
        exit;
    }
    
    if ($currentUser['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Admin access required']);
        exit;
    }

    // Get database connection
    $database = new Database();
    $db = $database->getConnection();

    // Get request data
    $data = json_decode(file_get_contents("php://input"));

    if (!$data || !isset($data->document_id) || !isset($data->status)) {
        throw new Exception('Document ID and status are required');
    }

    $document_id = $data->document_id;
    $status = $data->status; // 'verified' or 'rejected'
    $comments = $data->comments ?? '';

    // Validate status
    if (!in_array($status, ['verified', 'rejected'])) {
        throw new Exception('Invalid status. Must be "verified" or "rejected"');
    }

    // Start transaction
    $db->beginTransaction();

    try {
        // Get document details
        $stmt = $db->prepare("
            SELECT user_id, document_type, file_path 
            FROM user_documents 
            WHERE id = ?
        ");
        $stmt->execute([$document_id]);
        $document = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$document) {
            throw new Exception('Document not found');
        }

        // Update document verification status
        $is_verified = ($status === 'verified') ? 1 : 0;
        
        $stmt = $db->prepare("
            UPDATE user_documents 
            SET is_verified = ?, 
                verified_by = ?, 
                verified_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ");
        $stmt->execute([$is_verified, $currentUser['id'], $document_id]);

        // Log the verification action
        $stmt = $db->prepare("
            INSERT INTO activity_logs (user_id, action, description, ip_address) 
            VALUES (?, 'document_verification', ?, ?)
        ");
        
        $description = "Document {$document['document_type']} for user {$document['user_id']} was {$status} by admin {$currentUser['id']}";
        if ($comments) {
            $description .= ". Comments: {$comments}";
        }
        
        $stmt->execute([
            $document['user_id'],
            $description,
            $_SERVER['REMOTE_ADDR'] ?? null
        ]);

        // If it's a profile picture or DOB certificate verification, update user table
        if ($status === 'verified') {
            if ($document['document_type'] === 'profile_picture') {
                $stmt = $db->prepare("
                    UPDATE users 
                    SET profile_picture_url = ?, updated_at = CURRENT_TIMESTAMP 
                    WHERE id = ?
                ");
                $stmt->execute([$document['file_path'], $document['user_id']]);
            } elseif ($document['document_type'] === 'dob_certificate') {
                $stmt = $db->prepare("
                    UPDATE users 
                    SET dob_certificate_url = ?, updated_at = CURRENT_TIMESTAMP 
                    WHERE id = ?
                ");
                $stmt->execute([$document['file_path'], $document['user_id']]);
            }
        }

        $db->commit();

        echo json_encode([
            'success' => true,
            'message' => "Document {$status} successfully"
        ]);

    } catch (Exception $e) {
        $db->rollBack();
        throw $e;
    }

} catch (Exception $e) {
    error_log("Document verification error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
