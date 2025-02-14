<?php
class Resource {
    private $conn;
    private $table_name = "resources";

    public $id;
    public $title;
    public $description;
    public $type;
    public $url;
    public $category;
    public $created_by;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAll() {
        $query = "SELECT r.*, u.full_name as author_name 
                 FROM " . $this->table_name . " r
                 JOIN users u ON r.created_by = u.id
                 ORDER BY r.created_at DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getByCategory($category) {
        $query = "SELECT r.*, u.full_name as author_name 
                 FROM " . $this->table_name . " r
                 JOIN users u ON r.created_by = u.id
                 WHERE r.category = :category
                 ORDER BY r.created_at DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":category", $category);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function logAccess($user_id, $resource_id) {
        $query = "INSERT INTO resource_access (resource_id, user_id)
                 VALUES (:resource_id, :user_id)
                 ON DUPLICATE KEY UPDATE last_accessed = CURRENT_TIMESTAMP";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":resource_id", $resource_id);
        $stmt->bindParam(":user_id", $user_id);
        return $stmt->execute();
    }
}
?>
