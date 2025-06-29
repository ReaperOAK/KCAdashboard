<?php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../middleware/auth.php';

header('Content-Type: application/json');

try {
    $user = getAuthUser();
    if (!$user) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Unauthorized"]);
        exit;
    }

    $data = json_decode(file_get_contents('php://input'));
    if (!isset($data->challenge_id)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Missing challenge_id"]);
        exit;
    }

    $challengeId = $data->challenge_id;
    $db = (new Database())->getConnection();

    // Only allow the challenger to cancel their own outgoing challenge
    $query = "DELETE FROM chess_challenges WHERE id = :id AND challenger_id = :user_id AND status = 'pending'";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $challengeId);
    $stmt->bindParam(':user_id', $user['id']);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        echo json_encode(["success" => true, "message" => "Challenge cancelled."]);
    } else {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Challenge not found or you are not the challenger, or challenge is not pending."]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Failed to cancel challenge.",
        "error" => $e->getMessage()
    ]);
}
