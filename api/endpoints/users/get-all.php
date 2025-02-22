<?php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../models/User.php';
require_once '../../models/Permission.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    // Get filter and search parameters
    $filter = isset($_GET['filter']) ? $_GET['filter'] : 'all';
    $search = isset($_GET['search']) ? $_GET['search'] : '';

    $query = "SELECT u.* FROM users u WHERE 1=1";
    
    if ($filter !== 'all') {
        $query .= " AND u.role = :role";
    }
    
    if (!empty($search)) {
        $query .= " AND (u.full_name LIKE :search OR u.email LIKE :search)";
    }

    $stmt = $db->prepare($query);
    
    if ($filter !== 'all') {
        $stmt->bindValue(':role', $filter);
    }
    
    if (!empty($search)) {
        $searchTerm = "%{$search}%";
        $stmt->bindValue(':search', $searchTerm);
    }

    $stmt->execute();
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Fetch permissions for each user
    foreach ($users as &$user) {
        $permStmt = $db->prepare("
            SELECT p.name 
            FROM permissions p
            INNER JOIN user_permissions up ON p.id = up.permission_id
            WHERE up.user_id = ?
        ");
        $permStmt->execute([$user['id']]);
        $user['permissions'] = $permStmt->fetchAll(PDO::FETCH_COLUMN);
    }

    http_response_code(200);
    header('Content-Type: application/json');
    echo json_encode([
        "users" => $users
    ]);

} catch (Exception $e) {
    error_log("Error in get-all.php: " . $e->getMessage());
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        "message" => "Error fetching users",
        "error" => $e->getMessage()
    ]);
}
?>
