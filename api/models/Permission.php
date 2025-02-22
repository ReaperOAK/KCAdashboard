<?php
class Permission {
    private $conn;
    private $table = 'permissions';

    public $id;
    public $name;
    public $description;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getPermissionsByRole($role) {
        $query = "SELECT p.* FROM permissions p 
                 INNER JOIN role_permissions rp ON p.id = rp.permission_id 
                 WHERE rp.role = ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $role);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function checkPermission($userId, $permissionName) {
        $query = "SELECT COUNT(*) FROM user_permissions up
                 INNER JOIN permissions p ON up.permission_id = p.id
                 WHERE up.user_id = ? AND p.name = ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$userId, $permissionName]);
        
        return $stmt->fetchColumn() > 0;
    }
}
