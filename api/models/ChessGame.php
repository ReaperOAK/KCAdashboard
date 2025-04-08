<?php
class ChessGame {
    private $conn;
    private $table_name = "chess_games";
    
    // Properties
    public $id;
    public $white_player_id;
    public $black_player_id;
    public $position;
    public $status;
    public $result;
    public $reason;
    public $time_control;
    public $type;
    public $last_move_at;
    public $created_at;
    public $preview_url;
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    // Create new game
    public function create() {
        $query = "INSERT INTO " . $this->table_name . "
                (white_player_id, black_player_id, position, time_control, type)
                VALUES
                (:white_player_id, :black_player_id, :position, :time_control, :type)";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize and bind values
        $position = $this->position ? htmlspecialchars(strip_tags($this->position)) : 'start';
        $time_control = htmlspecialchars(strip_tags($this->time_control));
        $type = htmlspecialchars(strip_tags($this->type));
        
        $stmt->bindParam(":white_player_id", $this->white_player_id);
        $stmt->bindParam(":black_player_id", $this->black_player_id);
        $stmt->bindParam(":position", $position);
        $stmt->bindParam(":time_control", $time_control);
        $stmt->bindParam(":type", $type);
        
        if($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        
        return false;
    }
    
    // Get user's games
    public function getUserGames($user_id, $status = 'all') {
        $query = "SELECT g.*, 
                 u1.full_name as white_player_name, u2.full_name as black_player_name
                 FROM " . $this->table_name . " g
                 JOIN users u1 ON g.white_player_id = u1.id
                 JOIN users u2 ON g.black_player_id = u2.id
                 WHERE (g.white_player_id = ? OR g.black_player_id = ?)";
        
        if($status !== 'all') {
            $query .= " AND g.status = ?";
        }
        
        $query .= " ORDER BY g.last_move_at DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $user_id);
        $stmt->bindParam(2, $user_id);
        
        if($status !== 'all') {
            $stmt->bindParam(3, $status);
        }
        
        $stmt->execute();
        
        return $stmt;
    }
    
    // Get single game
    public function getById($id, $user_id) {
        $query = "SELECT g.*, 
                 u1.full_name as white_player_name, u2.full_name as black_player_name,
                 u1.id as white_id, u2.id as black_id
                 FROM " . $this->table_name . " g
                 JOIN users u1 ON g.white_player_id = u1.id
                 JOIN users u2 ON g.black_player_id = u2.id
                 WHERE g.id = ? AND (g.white_player_id = ? OR g.black_player_id = ?)";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $id);
        $stmt->bindParam(2, $user_id);
        $stmt->bindParam(3, $user_id);
        $stmt->execute();
        
        return $stmt;
    }
    
    // Update game position and last move time
    public function updatePosition() {
        $query = "UPDATE " . $this->table_name . "
                SET position = :position, last_move_at = CURRENT_TIMESTAMP
                WHERE id = :id AND status = 'active'";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize and bind
        $this->position = htmlspecialchars(strip_tags($this->position));
        
        $stmt->bindParam(":position", $this->position);
        $stmt->bindParam(":id", $this->id);
        
        return $stmt->execute();
    }
    
    // Record a move
    public function recordMove($move_number, $move_san, $position_after, $made_by_id) {
        $query = "INSERT INTO chess_game_moves
                (game_id, move_number, move_san, position_after, made_by_id)
                VALUES (?, ?, ?, ?, ?)";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->bindParam(2, $move_number);
        $stmt->bindParam(3, $move_san);
        $stmt->bindParam(4, $position_after);
        $stmt->bindParam(5, $made_by_id);
        
        return $stmt->execute();
    }
    
    // End game with result
    public function endGame($result, $reason) {
        $query = "UPDATE " . $this->table_name . "
                SET status = 'completed', result = :result, reason = :reason
                WHERE id = :id AND status = 'active'";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize inputs
        $result = htmlspecialchars(strip_tags($result));
        $reason = htmlspecialchars(strip_tags($reason));
        
        $stmt->bindParam(":result", $result);
        $stmt->bindParam(":reason", $reason);
        $stmt->bindParam(":id", $this->id);
        
        return $stmt->execute();
    }
}
?>
