<?php
class ChessPractice {
    // Database connection and table name
    private $conn;
    private $table_name = "chess_practice_positions";
    
    // Object properties
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
    
    // Constructor with database connection
    public function __construct($db) {
        $this->conn = $db;
    }
    
    // Create a new practice position
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  (title, description, position, type, difficulty, engine_level, created_by, created_at, preview_url) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)";
        
        $stmt = $this->conn->prepare($query);
        
        // Clean and bind data
        $this->title = htmlspecialchars(strip_tags($this->title));
        $this->description = htmlspecialchars(strip_tags($this->description));
        $this->position = htmlspecialchars(strip_tags($this->position));
        $this->type = htmlspecialchars(strip_tags($this->type));
        $this->difficulty = htmlspecialchars(strip_tags($this->difficulty));
        $this->engine_level = (int)$this->engine_level;
        
        $stmt->bindParam(1, $this->title);
        $stmt->bindParam(2, $this->description);
        $stmt->bindParam(3, $this->position);
        $stmt->bindParam(4, $this->type);
        $stmt->bindParam(5, $this->difficulty);
        $stmt->bindParam(6, $this->engine_level);
        $stmt->bindParam(7, $this->created_by);
        $stmt->bindParam(8, $this->preview_url);
        
        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        
        return false;
    }
    
    // Read a single practice position by ID
    public function readOne() {
        $query = "SELECT p.*, u.full_name as creator_name 
                  FROM " . $this->table_name . " p
                  JOIN users u ON p.created_by = u.id
                  WHERE p.id = ?";
                  
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($row) {
            $this->title = $row['title'];
            $this->description = $row['description'];
            $this->position = $row['position'];
            $this->type = $row['type'];
            $this->difficulty = $row['difficulty'];
            $this->engine_level = $row['engine_level'];
            $this->created_by = $row['created_by'];
            $this->created_at = $row['created_at'];
            $this->preview_url = $row['preview_url'];
            
            return [
                'id' => $this->id,
                'title' => $this->title,
                'description' => $this->description,
                'position' => $this->position,
                'type' => $this->type,
                'difficulty' => $this->difficulty,
                'engine_level' => (int)$this->engine_level,
                'creator' => [
                    'id' => $row['created_by'],
                    'name' => $row['creator_name']
                ],
                'created_at' => $this->created_at,
                'preview_url' => $this->preview_url
            ];
        }
        
        return null;
    }
    
    // Get practice positions by type
    public function getPositionsByType($type = 'all') {
        $query = "SELECT p.*, u.full_name as creator_name 
                  FROM " . $this->table_name . " p
                  JOIN users u ON p.created_by = u.id";
                  
        if ($type !== 'all') {
            $query .= " WHERE p.type = ?";
        }
        
        $query .= " ORDER BY p.created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        
        if ($type !== 'all') {
            $stmt->bindParam(1, $type);
        }
        
        $stmt->execute();
        
        $positions = [];
        
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $positions[] = [
                'id' => $row['id'],
                'title' => $row['title'],
                'description' => $row['description'],
                'position' => $row['position'],
                'type' => $row['type'],
                'difficulty' => $row['difficulty'],
                'engine_level' => (int)$row['engine_level'],
                'creator' => [
                    'id' => $row['created_by'],
                    'name' => $row['creator_name']
                ],
                'created_at' => $row['created_at'],
                'preview_url' => $row['preview_url']
            ];
        }
        
        return $positions;
    }
    
    // Update practice position
    public function update() {
        $query = "UPDATE " . $this->table_name . "
                  SET title = ?, description = ?, position = ?, 
                      type = ?, difficulty = ?, engine_level = ?, preview_url = ?
                  WHERE id = ? AND created_by = ?";
                  
        $stmt = $this->conn->prepare($query);
        
        // Clean and bind data
        $this->title = htmlspecialchars(strip_tags($this->title));
        $this->description = htmlspecialchars(strip_tags($this->description));
        $this->position = htmlspecialchars(strip_tags($this->position));
        $this->type = htmlspecialchars(strip_tags($this->type));
        $this->difficulty = htmlspecialchars(strip_tags($this->difficulty));
        $this->engine_level = (int)$this->engine_level;
        
        $stmt->bindParam(1, $this->title);
        $stmt->bindParam(2, $this->description);
        $stmt->bindParam(3, $this->position);
        $stmt->bindParam(4, $this->type);
        $stmt->bindParam(5, $this->difficulty);
        $stmt->bindParam(6, $this->engine_level);
        $stmt->bindParam(7, $this->preview_url);
        $stmt->bindParam(8, $this->id);
        $stmt->bindParam(9, $this->created_by);
        
        return $stmt->execute();
    }
    
    // Delete a practice position
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
