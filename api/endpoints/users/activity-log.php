<?php
header('Content-Type: application/json');
require_once '../../config/Database.php';
require_once '../../models/User.php';

$database = new Database();
$db = $database->getConnection();

$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
$offset = ($page - 1) * $limit;
$userId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : null;

$query = "SELECT al.*, u.full_name 
          FROM activity_logs al
          LEFT JOIN users u ON al.user_id = u.id
          WHERE 1=1";

if ($userId) {
    $query .= " AND al.user_id = :user_id";
}

$query .= " ORDER BY al.created_at DESC LIMIT :limit OFFSET :offset";

$stmt = $db->prepare($query);
if ($userId) {
    $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
}
$stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
$stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
$stmt->execute();

echo json_encode([
    "success" => true,
    "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)
]);
