<?php
class ChessGame {
    // Database connection and table name
    private $conn;
    private $table_name = "chess_games";
    
    // Object properties
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
    
    // Constructor with database connection
    public function __construct($db) {
        $this->conn = $db;
    }
    
    // Create a new game
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  (white_player_id, black_player_id, position, status, time_control, type, last_move_at, created_at) 
                  VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())";
        
        $stmt = $this->conn->prepare($query);
        
        // Clean and bind data
        $this->white_player_id = htmlspecialchars(strip_tags($this->white_player_id));
        $this->black_player_id = htmlspecialchars(strip_tags($this->black_player_id));
        $this->position = $this->position ?: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
        $this->status = $this->status ?: 'active';
        $this->time_control = htmlspecialchars(strip_tags($this->time_control));
        $this->type = htmlspecialchars(strip_tags($this->type));
        
        $stmt->bindParam(1, $this->white_player_id);
        $stmt->bindParam(2, $this->black_player_id);
        $stmt->bindParam(3, $this->position);
        $stmt->bindParam(4, $this->status);
        $stmt->bindParam(5, $this->time_control);
        $stmt->bindParam(6, $this->type);
        
        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        
        return false;
    }
    
    // Read a single game by ID
    public function readOne() {
        $query = "SELECT g.*, 
                  w.full_name as white_player_name, w.email as white_player_email, 
                  b.full_name as black_player_name, b.email as black_player_email
                  FROM " . $this->table_name . " g
                  JOIN users w ON g.white_player_id = w.id
                  JOIN users b ON g.black_player_id = b.id
                  WHERE g.id = ?";
                  
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($row) {
            $this->white_player_id = $row['white_player_id'];
            $this->black_player_id = $row['black_player_id'];
            $this->position = $row['position'];
            $this->status = $row['status'];
            $this->result = $row['result'];
            $this->reason = $row['reason'];
            $this->time_control = $row['time_control'];
            $this->type = $row['type'];
            $this->last_move_at = $row['last_move_at'];
            $this->created_at = $row['created_at'];
            $this->preview_url = $row['preview_url'];
            
            return [
                'id' => $this->id,
                'white_player' => [
                    'id' => $row['white_player_id'],
                    'name' => $row['white_player_name'],
                    'email' => $row['white_player_email']
                ],
                'black_player' => [
                    'id' => $row['black_player_id'],
                    'name' => $row['black_player_name'],
                    'email' => $row['black_player_email']
                ],
                'position' => $this->position,
                'status' => $this->status,
                'result' => $this->result,
                'reason' => $this->reason,
                'time_control' => $this->time_control,
                'type' => $this->type,
                'last_move_at' => $this->last_move_at,
                'created_at' => $this->created_at,
                'preview_url' => $this->preview_url
            ];
        }
        
        return null;
    }
    
    // Get games for a specific player
    public function getPlayerGames($userId, $status = 'active') {
        $query = "SELECT g.*, 
                  w.full_name as white_player_name, w.email as white_player_email, 
                  b.full_name as black_player_name, b.email as black_player_email,
                  EXISTS(SELECT 1 FROM chess_game_moves WHERE game_id = g.id) as has_moves
                  FROM " . $this->table_name . " g
                  JOIN users w ON g.white_player_id = w.id
                  JOIN users b ON g.black_player_id = b.id
                  WHERE (g.white_player_id = ? OR g.black_player_id = ?)";
                  
        // Add status filter if provided
        if ($status !== 'all') {
            $query .= " AND g.status = ?";
        }
        
        $query .= " ORDER BY g.last_move_at DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $userId);
        $stmt->bindParam(2, $userId);
        
        if ($status !== 'all') {
            $stmt->bindParam(3, $status);
        }
        
        $stmt->execute();
        
        $games = [];
        
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $games[] = [
                'id' => $row['id'],
                'white_player' => [
                    'id' => $row['white_player_id'],
                    'name' => $row['white_player_name'],
                    'email' => $row['white_player_email']
                ],
                'black_player' => [
                    'id' => $row['black_player_id'],
                    'name' => $row['black_player_name'],
                    'email' => $row['black_player_email']
                ],
                'position' => $row['position'],
                'status' => $row['status'],
                'result' => $row['result'],
                'reason' => $row['reason'],
                'time_control' => $row['time_control'],
                'type' => $row['type'],
                'last_move_at' => $row['last_move_at'],
                'created_at' => $row['created_at'],
                'preview_url' => $row['preview_url'],
                'has_moves' => (bool)$row['has_moves'],
                'is_player_turn' => $this->isPlayerTurn($userId, $row['white_player_id'], $row['black_player_id'], $row['position'])
            ];
        }
        
        return $games;
    }
    
    // Check if it's the player's turn
    private function isPlayerTurn($userId, $whiteId, $blackId, $position) {
        // Extract side to move from FEN
        $parts = explode(' ', $position);
        $turn = isset($parts[1]) ? $parts[1] : 'w';
        
        // Check if it's the player's turn
        return ($turn === 'w' && $userId == $whiteId) || ($turn === 'b' && $userId == $blackId);
    }
    
    // Get moves for a game
    public function getMoves() {
        $query = "SELECT m.*, u.full_name as player_name
                  FROM chess_game_moves m
                  JOIN users u ON m.made_by_id = u.id
                  WHERE m.game_id = ?
                  ORDER BY m.move_number";
                  
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->execute();
        
        $moves = [];
        
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $moves[] = [
                'id' => $row['id'],
                'move_number' => $row['move_number'],
                'move_san' => $row['move_san'],
                'position_after' => $row['position_after'],
                'made_by' => [
                    'id' => $row['made_by_id'],
                    'name' => $row['player_name']
                ],
                'created_at' => $row['created_at']
            ];
        }
        
        return $moves;
    }
    
    // Update game position
    public function updatePosition() {
        $query = "UPDATE " . $this->table_name . "
                  SET position = ?, last_move_at = NOW()
                  WHERE id = ?";
                  
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->position);
        $stmt->bindParam(2, $this->id);
        
        return $stmt->execute();
    }
    
    // Record a move
    public function recordMove($moveData) {
        $query = "INSERT INTO chess_game_moves 
                 (game_id, move_number, move_san, position_after, made_by_id, created_at)
                 VALUES (?, ?, ?, ?, ?, NOW())";
                 
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->bindParam(2, $moveData['move_number']);
        $stmt->bindParam(3, $moveData['move_san']);
        $stmt->bindParam(4, $moveData['position_after']);
        $stmt->bindParam(5, $moveData['made_by_id']);
        
        return $stmt->execute();
    }
    
    // End game with result
    public function endGame() {
        $query = "UPDATE " . $this->table_name . "
                  SET status = 'completed', result = ?, reason = ?
                  WHERE id = ?";
                  
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->result);
        $stmt->bindParam(2, $this->reason);
        $stmt->bindParam(3, $this->id);
        
        return $stmt->execute();
    }
}
?>
