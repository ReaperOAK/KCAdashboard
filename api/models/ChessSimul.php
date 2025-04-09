<?php
class ChessSimul {
    private $conn;
    private $table_name = "chess_simuls";
    
    // Properties
    public $id;
    public $title;
    public $host_id;
    public $description;
    public $status;
    public $max_players;
    public $time_control;
    public $created_at;
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    // Create new simul
    public function create() {
        $query = "INSERT INTO " . $this->table_name . "
                (title, host_id, description, max_players, time_control)
                VALUES
                (:title, :host_id, :description, :max_players, :time_control)";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize inputs
        $this->title = htmlspecialchars(strip_tags($this->title));
        $this->description = htmlspecialchars(strip_tags($this->description));
        $this->time_control = htmlspecialchars(strip_tags($this->time_control));
        
        // Bind values
        $stmt->bindParam(":title", $this->title);
        $stmt->bindParam(":host_id", $this->host_id);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":max_players", $this->max_players);
        $stmt->bindParam(":time_control", $this->time_control);
        
        if($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        
        return false;
    }
    
    // Get all active simuls
    public function getActiveSimuls() {
        $query = "SELECT s.*, u.full_name as host_name, 
                 COUNT(b.id) as player_count
                 FROM " . $this->table_name . " s
                 JOIN users u ON s.host_id = u.id
                 LEFT JOIN chess_simul_boards b ON s.id = b.simul_id
                 WHERE s.status != 'completed'
                 GROUP BY s.id
                 ORDER BY s.created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt;
    }
    
    // Get single simul with boards
    public function getById($id) {
        $query = "SELECT s.*, u.full_name as host_name
                 FROM " . $this->table_name . " s
                 JOIN users u ON s.host_id = u.id
                 WHERE s.id = ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $id);
        $stmt->execute();
        
        return $stmt;
    }
    
    // Get boards for a simul
    public function getBoards($id) {
        $query = "SELECT b.*, u.full_name as player_name
                 FROM chess_simul_boards b
                 JOIN users u ON b.player_id = u.id
                 WHERE b.simul_id = ?
                 ORDER BY b.id ASC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $id);
        $stmt->execute();
        
        return $stmt;
    }
    
    // Add player to simul
    public function addPlayer($simul_id, $player_id) {
        // First check if player is already in this simul
        $check_query = "SELECT COUNT(*) FROM chess_simul_boards 
                      WHERE simul_id = ? AND player_id = ?";
        $check_stmt = $this->conn->prepare($check_query);
        $check_stmt->bindParam(1, $simul_id);
        $check_stmt->bindParam(2, $player_id);
        $check_stmt->execute();
        
        if($check_stmt->fetchColumn() > 0) {
            return false; // Player already in simul
        }
        
        // Check if the simul has space
        $capacity_query = "SELECT s.max_players, COUNT(b.id) as current_players
                         FROM chess_simuls s
                         LEFT JOIN chess_simul_boards b ON s.id = b.simul_id
                         WHERE s.id = ? AND s.status = 'active'
                         GROUP BY s.id";
        $capacity_stmt = $this->conn->prepare($capacity_query);
        $capacity_stmt->bindParam(1, $simul_id);
        $capacity_stmt->execute();
        
        $capacity_data = $capacity_stmt->fetch(PDO::FETCH_ASSOC);
        if(!$capacity_data || $capacity_data['current_players'] >= $capacity_data['max_players']) {
            return false; // Simul is full or not found
        }
        
        // Add player to simul
        $query = "INSERT INTO chess_simul_boards (simul_id, player_id)
                VALUES (?, ?)";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $simul_id);
        $stmt->bindParam(2, $player_id);
        
        return $stmt->execute();
    }
    
    // Update board position
    public function updateBoardPosition($board_id, $position, $user_id) {
        // Check if user is part of this board
        $check_query = "SELECT b.*, s.host_id
                      FROM chess_simul_boards b
                      JOIN chess_simuls s ON b.simul_id = s.id
                      WHERE b.id = ? AND b.status = 'active'";
        $check_stmt = $this->conn->prepare($check_query);
        $check_stmt->bindParam(1, $board_id);
        $check_stmt->execute();
        
        $board = $check_stmt->fetch(PDO::FETCH_ASSOC);
        if(!$board || ($board['player_id'] != $user_id && $board['host_id'] != $user_id)) {
            return false; // Not authorized
        }
        
        // Update position and turn
        $query = "UPDATE chess_simul_boards
                SET position = :position, 
                    turn = :turn,
                    last_move_at = CURRENT_TIMESTAMP
                WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        
        // Calculate next turn
        $turn = ($board['turn'] == 'w') ? 'b' : 'w';
        
        // Sanitize inputs
        $position = htmlspecialchars(strip_tags($position));
        
        $stmt->bindParam(":position", $position);
        $stmt->bindParam(":turn", $turn);
        $stmt->bindParam(":id", $board_id);
        
        return $stmt->execute();
    }
    
    // Start simul
    public function startSimul($id, $host_id) {
        $query = "UPDATE " . $this->table_name . "
                SET status = 'active'
                WHERE id = ? AND host_id = ? AND status = 'pending'";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $id);
        $stmt->bindParam(2, $host_id);
        
        return $stmt->execute();
    }
    
    // End simul
    public function endSimul($id, $host_id) {
        $query = "UPDATE " . $this->table_name . "
                SET status = 'completed'
                WHERE id = ? AND host_id = ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $id);
        $stmt->bindParam(2, $host_id);
        
        return $stmt->execute();
    }
}
?>
