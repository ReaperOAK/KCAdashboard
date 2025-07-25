<?php
date_default_timezone_set('Asia/Kolkata');
class Database {
    // Dynamic host configuration for Hostinger
    private function getHostConfig() {
        // Check if we're running on Hostinger server or locally
        $server_name = $_SERVER['SERVER_NAME'] ?? '';
        $is_localhost = in_array($server_name, ['localhost', '127.0.0.1']) || 
                       strpos($server_name, '.local') !== false ||
                       empty($server_name);
        
        if ($is_localhost) {
            // Local development - connect to remote Hostinger MySQL
            return [
                'host' => 'srv1670.hstgr.io',  // Your Hostinger MySQL host
                'note' => 'Connecting remotely to Hostinger from local development'
            ];
        } else {
            // Production on Hostinger - use localhost
            return [
                'host' => 'localhost',
                'note' => 'Running on Hostinger server'
            ];
        }
    }
    
    private $database_name = "u703958259_dashboard";
    private $username = "u703958259_admin";
    private $password = "1!jqkNyFs";
    private $port = 3306;
    public $conn;

    public function getConnection() {
        $this->conn = null;
        $hostConfig = $this->getHostConfig();
        $host = $hostConfig['host'];
        
        error_log("Database connection attempt: " . $hostConfig['note'] . " (host: $host)");
        
        try {
            $dsn = "mysql:host=$host;port={$this->port};dbname={$this->database_name};charset=utf8mb4";
            
            $this->conn = new PDO(
                $dsn,
                $this->username,
                $this->password,
                array(
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_PERSISTENT => false,
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4",
                    PDO::ATTR_TIMEOUT => 10
                )
            );
            
            error_log("Database connection successful");
            
        } catch(PDOException $e) {
            error_log("Database Connection Error: " . $e->getMessage());
            error_log("Host attempted: $host");
            error_log("DSN: $dsn");
            return null;
        }
        
        return $this->conn;
    }
}
?>
