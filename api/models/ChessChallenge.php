<?php
class ChessChallenge {
    // Database connection and table name
    private $conn;
    private $table_name = "chess_challenges";
    
    // Object properties
    public $id;
    public $challenger_id;
    public $recipient_id;
    public $time_control;
    public $color;
    public $position;
    public $status;
    public $created_at;
    public $expires_at;
    
    // Constructor with database connection
    public function __construct($db) {
        $this->conn = $db;
    }
    
    // Create a new challenge
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  (challenger_id, recipient_id, time_control, color, position, status, created_at, expires_at) 
                  VALUES (?, ?, ?, ?, ?, ?, NOW(), ?)";
        
        $stmt = $this->conn->prepare($query);
        
        // Clean and bind data
        $this->challenger_id = htmlspecialchars(strip_tags($this->challenger_id));
        $this->recipient_id = htmlspecialchars(strip_tags($this->recipient_id));
        $this->time_control = htmlspecialchars(strip_tags($this->time_control));
        $this->color = htmlspecialchars(strip_tags($this->color));
        $this->position = $this->position ?: 'start';
        $this->status = $this->status ?: 'pending';
        
        // Set expiration to 24 hours from now if not set
        if (!$this->expires_at) {
            $this->expires_at = date('Y-m-d H:i:s', strtotime('+24 hours'));
        }
        
        $stmt->bindParam(1, $this->challenger_id);
        $stmt->bindParam(2, $this->recipient_id);
        $stmt->bindParam(3, $this->time_control);
        $stmt->bindParam(4, $this->color);
        $stmt->bindParam(5, $this->position);
        $stmt->bindParam(6, $this->status);
        $stmt->bindParam(7, $this->expires_at);
        
        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        
        return false;
    }
    
    // Read a single challenge by ID
    public function readOne() {
        $query = "SELECT c.*, 
                  u1.full_name as challenger_name, 
                  u2.full_name as recipient_name
                  FROM " . $this->table_name . " c
                  JOIN users u1 ON c.challenger_id = u1.id
                  JOIN users u2 ON c.recipient_id = u2.id
                  WHERE c.id = ?";
                  
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($row) {
            $this->challenger_id = $row['challenger_id'];
            $this->recipient_id = $row['recipient_id'];
            $this->time_control = $row['time_control'];
            $this->color = $row['color'];
            $this->position = $row['position'];
            $this->status = $row['status'];
            $this->created_at = $row['created_at'];
            $this->expires_at = $row['expires_at'];
            
            return [
                'id' => $this->id,
                'challenger' => [
                    'id' => $row['challenger_id'],
                    'name' => $row['challenger_name']
                ],
                'recipient' => [
                    'id' => $row['recipient_id'],
                    'name' => $row['recipient_name']
                ],
                'time_control' => $this->time_control,
                'color' => $this->color,
                'position' => $this->position,
                'status' => $this->status,
                'created_at' => $this->created_at,
                'expires_at' => $this->expires_at
            ];
        }
        
        return null;
    }
    
    // Get pending challenges for a player
    public function getPendingChallenges($userId) {
        $query = "SELECT c.*, 
                  u1.full_name as challenger_name, 
                  u2.full_name as recipient_name,
                  CASE WHEN c.challenger_id = ? THEN 'outgoing' ELSE 'incoming' END as direction
                  FROM " . $this->table_name . " c
                  JOIN users u1 ON c.challenger_id = u1.id
                  JOIN users u2 ON c.recipient_id = u2.id
                  WHERE (c.challenger_id = ? OR c.recipient_id = ?)
                  AND c.status = 'pending'
                  AND c.expires_at > NOW()
                  ORDER BY c.created_at DESC";
                  
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $userId);
        $stmt->bindParam(2, $userId);
        $stmt->bindParam(3, $userId);
        $stmt->execute();
        
        $challenges = [];
        
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $challenges[] = [
                'id' => $row['id'],
                'challenger' => [
                    'id' => $row['challenger_id'],
                    'name' => $row['challenger_name']
                ],
                'recipient' => [
                    'id' => $row['recipient_id'],
                    'name' => $row['recipient_name']
                ],
                'time_control' => $row['time_control'],
                'color' => $row['color'],
                'position' => $row['position'],
                'status' => $row['status'],
                'created_at' => $row['created_at'],
                'expires_at' => $row['expires_at'],
                'direction' => $row['direction']
            ];
        }
        
        return $challenges;
    }
    
    // Update challenge status
    public function updateStatus() {
        $query = "UPDATE " . $this->table_name . "
                  SET status = ?
                  WHERE id = ?";
                  
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->status);
        $stmt->bindParam(2, $this->id);
        
        return $stmt->execute();
    }
    
    // Check if a challenge is valid and pending
    public function isValidChallenge() {
        $query = "SELECT id FROM " . $this->table_name . "
                  WHERE id = ? AND status = 'pending' AND expires_at > NOW()";
                  
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->execute();
        
        return $stmt->rowCount() > 0;
    }
    
    // Delete expired challenges
    public static function cleanupExpiredChallenges($db) {
        $query = "UPDATE chess_challenges 
                  SET status = 'expired' 
                  WHERE status = 'pending' AND expires_at < NOW()";
                  
        $stmt = $db->prepare($query);
        return $stmt->execute();
    }
}
?>
