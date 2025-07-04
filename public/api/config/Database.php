<?php
date_default_timezone_set('Asia/Kolkata');
class Database {
    private $host = "localhost";
    private $database_name = "u703958259_dashboard";
    private $username = "u703958259_admin";
    private $password = "1!jqkNyFs";
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->database_name,
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $e) {
            error_log("Connection Error: " . $e->getMessage());
            return null;
        }
        return $this->conn;
    }
}
?>
