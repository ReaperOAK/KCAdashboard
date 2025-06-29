<?php
class EmailVerification {
    private $conn;
    private $table_name = "email_verifications";

    public $id;
    public $user_id;
    public $token;
    public $expires_at;
    public $used_at;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create($user_id, $token, $expires_at) {
        $query = "INSERT INTO " . $this->table_name . " (user_id, token, expires_at) VALUES (:user_id, :token, :expires_at)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $user_id);
        $stmt->bindParam(":token", $token);
        $stmt->bindParam(":expires_at", $expires_at);
        return $stmt->execute();
    }

    public function findByToken($token) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE token = :token LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":token", $token);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function markUsed($id) {
        $query = "UPDATE " . $this->table_name . " SET used_at = NOW() WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        return $stmt->execute();
    }
}
?>
