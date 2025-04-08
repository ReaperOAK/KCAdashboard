<?php
class ChessStudy {
    private $conn;
    private $table_name = "chess_studies";
    
    // Properties
    public $id;
    public $title;
    public $description;
    public $position;
    public $category;
    public $owner_id;
    public $is_public;
    public $preview_url;
    public $created_at;
    public $updated_at;
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    // Create new study
    public function create() {
        $query = "INSERT INTO " . $this->table_name . "
                (title, description, position, category, owner_id, is_public)
                VALUES
                (:title, :description, :position, :category, :owner_id, :is_public)";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize inputs
        $this->title = htmlspecialchars(strip_tags($this->title));
        $this->description = htmlspecialchars(strip_tags($this->description));
        $this->position = htmlspecialchars(strip_tags($this->position));
        $this->category = htmlspecialchars(strip_tags($this->category));
        
        // Bind values
        $stmt->bindParam(":title", $this->title);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":position", $this->position);
        $stmt->bindParam(":category", $this->category);
        $stmt->bindParam(":owner_id", $this->owner_id);
        $stmt->bindParam(":is_public", $this->is_public);
        
        if($stmt->execute()) {
            return true;
        }
        
        return false;
    }
    
    // Get user's studies
    public function getUserStudies($user_id) {
        $query = "SELECT s.*, u.full_name as owner_name
                 FROM " . $this->table_name . " s
                 JOIN users u ON s.owner_id = u.id
                 WHERE s.owner_id = ?
                 ORDER BY s.updated_at DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $user_id);
        $stmt->execute();
        
        return $stmt;
    }
    
    // Get studies shared with user
    public function getSharedStudies($user_id) {
        $query = "SELECT s.*, u.full_name as owner_name, ss.shared_at
                 FROM " . $this->table_name . " s
                 JOIN chess_study_shares ss ON s.id = ss.study_id
                 JOIN users u ON s.owner_id = u.id
                 WHERE ss.user_id = ?
                 ORDER BY ss.shared_at DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $user_id);
        $stmt->execute();
        
        return $stmt;
    }
    
    // Get single study
    public function getById($id, $user_id) {
        $query = "SELECT s.*, u.full_name as owner_name, u.id as owner_id
                 FROM " . $this->table_name . " s
                 JOIN users u ON s.owner_id = u.id
                 WHERE s.id = ? AND (s.owner_id = ? OR s.is_public = 1 OR 
                                     EXISTS (SELECT 1 FROM chess_study_shares 
                                             WHERE study_id = s.id AND user_id = ?))";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $id);
        $stmt->bindParam(2, $user_id);
        $stmt->bindParam(3, $user_id);
        $stmt->execute();
        
        return $stmt;
    }
    
    // Update study
    public function update() {
        $query = "UPDATE " . $this->table_name . "
                SET title = :title, description = :description, 
                    position = :position, category = :category, 
                    is_public = :is_public
                WHERE id = :id AND owner_id = :owner_id";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize inputs
        $this->title = htmlspecialchars(strip_tags($this->title));
        $this->description = htmlspecialchars(strip_tags($this->description));
        $this->position = htmlspecialchars(strip_tags($this->position));
        $this->category = htmlspecialchars(strip_tags($this->category));
        
        // Bind values
        $stmt->bindParam(":title", $this->title);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":position", $this->position);
        $stmt->bindParam(":category", $this->category);
        $stmt->bindParam(":is_public", $this->is_public);
        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":owner_id", $this->owner_id);
        
        if($stmt->execute()) {
            return true;
        }
        
        return false;
    }
    
    // Share study with user
    public function shareWithUser($study_id, $user_id) {
        $query = "INSERT INTO chess_study_shares (study_id, user_id)
                VALUES (?, ?)
                ON DUPLICATE KEY UPDATE shared_at = CURRENT_TIMESTAMP";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $study_id);
        $stmt->bindParam(2, $user_id);
        
        return $stmt->execute();
    }
    
    // Delete study
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " 
                 WHERE id = ? AND owner_id = ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->bindParam(2, $this->owner_id);
        
        return $stmt->execute();
    }
}
?>
