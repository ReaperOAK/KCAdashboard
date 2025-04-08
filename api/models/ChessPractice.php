<?php
class ChessPractice {
    private $conn;
    private $table_name = "chess_practice_positions";
    
    // Properties
    public $id;
    public $title;
    public $description;
    public $position;
    public $type;
    public $difficulty;
    public $engine_level;
    public $created_by;
    public $created_at;
    public $preview_url;
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    // Create new practice position
    public function create() {
        $query = "INSERT INTO " . $this->table_name . "
                (title, description, position, type, difficulty, engine_level, created_by)
                VALUES
                (:title, :description, :position, :type, :difficulty, :engine_level, :created_by)";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize inputs
        $this->title = htmlspecialchars(strip_tags($this->title));
        $this->description = htmlspecialchars(strip_tags($this->description));
        $this->position = htmlspecialchars(strip_tags($this->position));
        $this->type = htmlspecialchars(strip_tags($this->type));
        $this->difficulty = htmlspecialchars(strip_tags($this->difficulty));
        
        // Bind values
        $stmt->bindParam(":title", $this->title);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":position", $this->position);
        $stmt->bindParam(":type", $this->type);
        $stmt->bindParam(":difficulty", $this->difficulty);
        $stmt->bindParam(":engine_level", $this->engine_level);
        $stmt->bindParam(":created_by", $this->created_by);
        
        if($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        
        return false;
    }
    
    // Get practice positions
    public function getPositions($type = 'all', $limit = 20) {
        $query = "SELECT p.*, u.full_name as creator_name
                 FROM " . $this->table_name . " p
                 JOIN users u ON p.created_by = u.id";
        
        if($type !== 'all') {
            $query .= " WHERE p.type = ?";
        }
        
        $query .= " ORDER BY p.created_at DESC LIMIT ?";
        
        $stmt = $this->conn->prepare($query);
        
        if($type !== 'all') {
            $stmt->bindParam(1, $type);
            $stmt->bindParam(2, $limit, PDO::PARAM_INT);
        } else {
            $stmt->bindParam(1, $limit, PDO::PARAM_INT);
        }
        
        $stmt->execute();
        
        return $stmt;
    }
    
    // Get single position
    public function getById($id) {
        $query = "SELECT p.*, u.full_name as creator_name
                 FROM " . $this->table_name . " p
                 JOIN users u ON p.created_by = u.id
                 WHERE p.id = ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $id);
        $stmt->execute();
        
        return $stmt;
    }
    
    // Update position
    public function update() {
        $query = "UPDATE " . $this->table_name . "
                SET title = :title, description = :description, 
                    position = :position, type = :type, 
                    difficulty = :difficulty, engine_level = :engine_level
                WHERE id = :id AND created_by = :created_by";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize inputs
        $this->title = htmlspecialchars(strip_tags($this->title));
        $this->description = htmlspecialchars(strip_tags($this->description));
        $this->position = htmlspecialchars(strip_tags($this->position));
        $this->type = htmlspecialchars(strip_tags($this->type));
        $this->difficulty = htmlspecialchars(strip_tags($this->difficulty));
        
        // Bind values
        $stmt->bindParam(":title", $this->title);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":position", $this->position);
        $stmt->bindParam(":type", $this->type);
        $stmt->bindParam(":difficulty", $this->difficulty);
        $stmt->bindParam(":engine_level", $this->engine_level);
        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":created_by", $this->created_by);
        
        return $stmt->execute();
    }
    
    // Delete position
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " 
                 WHERE id = ? AND created_by = ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->bindParam(2, $this->created_by);
        
        return $stmt->execute();
    }
}
?>
