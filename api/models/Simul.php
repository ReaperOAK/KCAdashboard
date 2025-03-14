<?php
class Simul {
    private $conn;
    private $table_name = "simul_events";
    
    public $id;
    public $name;
    public $host;
    public $date;
    public $max_participants;
    public $status;
    public $lichess_id;
    public $created_by;
    public $created_at;
    
    public function __construct($db) {
        $this->conn = $db;
        
        // Create table if it doesn't exist
        $this->createTableIfNotExists();
    }
    
    private function createTableIfNotExists() {
        $query = "CREATE TABLE IF NOT EXISTS " . $this->table_name . " (
            id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(255) NOT NULL,
            host VARCHAR(255) NOT NULL,
            date DATETIME NOT NULL,
            max_participants INT NOT NULL DEFAULT 20,
            status ENUM('upcoming', 'ongoing', 'completed', 'cancelled') DEFAULT 'upcoming',
            lichess_id VARCHAR(255),
            created_by INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by) REFERENCES users(id)
        )";
        
        $this->conn->exec($query);
        
        // Also create the simul_registrations table if it doesn't exist
        $query = "CREATE TABLE IF NOT EXISTS simul_registrations (
            simul_id INT NOT NULL,
            user_id INT NOT NULL,
            registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (simul_id, user_id),
            FOREIGN KEY (simul_id) REFERENCES " . $this->table_name . "(id),
            FOREIGN KEY (user_id) REFERENCES users(id)
        )";
        
        $this->conn->exec($query);
    }
    
    public function getUpcoming() {
        try {
            $query = "SELECT 
                        s.id, 
                        s.name, 
                        s.host, 
                        s.date, 
                        s.max_participants, 
                        s.status, 
                        s.lichess_id,
                        COUNT(r.user_id) as participants
                    FROM 
                        " . $this->table_name . " s
                    LEFT JOIN 
                        simul_registrations r ON s.id = r.simul_id
                    WHERE 
                        s.status = 'upcoming'
                        AND s.date >= NOW()
                    GROUP BY 
                        s.id
                    ORDER BY 
                        s.date ASC";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
            
        } catch (PDOException $e) {
            return [];
        }
    }
    
    public function create($data) {
        try {
            $query = "INSERT INTO " . $this->table_name . "
                    (name, host, date, max_participants, status, lichess_id, created_by)
                    VALUES
                    (:name, :host, :date, :max_participants, :status, :lichess_id, :created_by)";
            
            $stmt = $this->conn->prepare($query);
            
            $stmt->bindParam(':name', $data['name']);
            $stmt->bindParam(':host', $data['host']);
            $stmt->bindParam(':date', $data['date']);
            $stmt->bindParam(':max_participants', $data['max_participants']);
            $stmt->bindParam(':status', $data['status']);
            $stmt->bindParam(':lichess_id', $data['lichess_id']);
            $stmt->bindParam(':created_by', $data['created_by']);
            
            if ($stmt->execute()) {
                return $this->conn->lastInsertId();
            }
            
            return false;
            
        } catch (PDOException $e) {
            return false;
        }
    }
    
    public function registerUser($simulId, $userId) {
        try {
            // Check if already registered
            $checkQuery = "SELECT COUNT(*) FROM simul_registrations
                          WHERE simul_id = :simul_id AND user_id = :user_id";
            $checkStmt = $this->conn->prepare($checkQuery);
            $checkStmt->bindParam(':simul_id', $simulId);
            $checkStmt->bindParam(':user_id', $userId);
            $checkStmt->execute();
            
            if ($checkStmt->fetchColumn() > 0) {
                return "already_registered";
            }
            
            // Register the user
            $query = "INSERT INTO simul_registrations (simul_id, user_id)
                      VALUES (:simul_id, :user_id)";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':simul_id', $simulId);
            $stmt->bindParam(':user_id', $userId);
            
            if ($stmt->execute()) {
                return "success";
            }
            
            return "failed";
            
        } catch (PDOException $e) {
            return "error: " . $e->getMessage();
        }
    }
}
?>
