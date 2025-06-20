<?php
class ChessStudy {
    // Database connection and table name
    private $conn;
    private $table_name = "chess_studies";
    
    // Object properties
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
    
    // Constructor with database connection
    public function __construct($db) {
        $this->conn = $db;
    }
    
    // Create a new study
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  (title, description, position, category, owner_id, is_public, preview_url, created_at, updated_at) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";
        
        $stmt = $this->conn->prepare($query);
        
        // Clean and bind data
        $this->title = htmlspecialchars(strip_tags($this->title));
        $this->description = htmlspecialchars(strip_tags($this->description));
        $this->position = htmlspecialchars(strip_tags($this->position));
        $this->category = htmlspecialchars(strip_tags($this->category));
        $this->is_public = $this->is_public ? 1 : 0;
        
        $stmt->bindParam(1, $this->title);
        $stmt->bindParam(2, $this->description);
        $stmt->bindParam(3, $this->position);
        $stmt->bindParam(4, $this->category);
        $stmt->bindParam(5, $this->owner_id);
        $stmt->bindParam(6, $this->is_public);
        $stmt->bindParam(7, $this->preview_url);
        
        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        
        return false;
    }
    
    // Read a single study by ID
    public function readOne() {
        $query = "SELECT s.*, u.full_name as owner_name 
                  FROM " . $this->table_name . " s
                  JOIN users u ON s.owner_id = u.id
                  WHERE s.id = ?";
                  
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($row) {
            $this->title = $row['title'];
            $this->description = $row['description'];
            $this->position = $row['position'];
            $this->category = $row['category'];
            $this->owner_id = $row['owner_id'];
            $this->is_public = $row['is_public'];
            $this->preview_url = $row['preview_url'];
            $this->created_at = $row['created_at'];
            $this->updated_at = $row['updated_at'];
            
            return [
                'id' => $this->id,
                'title' => $this->title,
                'description' => $this->description,
                'position' => $this->position,
                'category' => $this->category,
                'owner' => [
                    'id' => $row['owner_id'],
                    'name' => $row['owner_name']
                ],
                'is_public' => (bool)$this->is_public,
                'preview_url' => $this->preview_url,
                'created_at' => $this->created_at,
                'updated_at' => $this->updated_at
            ];
        }
        
        return null;
    }
    
    // Update study
    public function update() {
        $query = "UPDATE " . $this->table_name . "
                  SET title = ?, description = ?, position = ?, category = ?, 
                      is_public = ?, preview_url = ?, updated_at = NOW()
                  WHERE id = ? AND owner_id = ?";
                  
        $stmt = $this->conn->prepare($query);
        
        // Clean and bind data
        $this->title = htmlspecialchars(strip_tags($this->title));
        $this->description = htmlspecialchars(strip_tags($this->description));
        $this->position = htmlspecialchars(strip_tags($this->position));
        $this->category = htmlspecialchars(strip_tags($this->category));
        $this->is_public = $this->is_public ? 1 : 0;
        
        $stmt->bindParam(1, $this->title);
        $stmt->bindParam(2, $this->description);
        $stmt->bindParam(3, $this->position);
        $stmt->bindParam(4, $this->category);
        $stmt->bindParam(5, $this->is_public);
        $stmt->bindParam(6, $this->preview_url);
        $stmt->bindParam(7, $this->id);
        $stmt->bindParam(8, $this->owner_id);
        
        return $stmt->execute();
    }
    
    // Get user's studies
    public function getUserStudies($userId) {
        $query = "SELECT s.*, u.full_name as owner_name 
                  FROM " . $this->table_name . " s
                  JOIN users u ON s.owner_id = u.id
                  WHERE s.owner_id = ?
                  ORDER BY s.updated_at DESC";
                  
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $userId);
        $stmt->execute();
        
        $studies = [];
        
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $studies[] = [
                'id' => $row['id'],
                'title' => $row['title'],
                'description' => $row['description'],
                'position' => $row['position'],
                'category' => $row['category'],
                'owner' => [
                    'id' => $row['owner_id'],
                    'name' => $row['owner_name']
                ],
                'is_public' => (bool)$row['is_public'],
                'preview_url' => $row['preview_url'],
                'created_at' => $row['created_at'],
                'updated_at' => $row['updated_at']
            ];
        }
        
        return $studies;
    }
    
    // Get studies shared with a user
    public function getSharedStudies($userId) {
        $query = "SELECT s.*, u.full_name as owner_name, ss.shared_at
                  FROM chess_study_shares ss
                  JOIN " . $this->table_name . " s ON ss.study_id = s.id
                  JOIN users u ON s.owner_id = u.id
                  WHERE ss.user_id = ?
                  ORDER BY ss.shared_at DESC";
                  
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $userId);
        $stmt->execute();
        
        $studies = [];
        
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $studies[] = [
                'id' => $row['id'],
                'title' => $row['title'],
                'description' => $row['description'],
                'position' => $row['position'],
                'category' => $row['category'],
                'owner' => [
                    'id' => $row['owner_id'],
                    'name' => $row['owner_name']
                ],
                'is_public' => (bool)$row['is_public'],
                'preview_url' => $row['preview_url'],
                'created_at' => $row['created_at'],
                'updated_at' => $row['updated_at'],
                'shared_at' => $row['shared_at']
            ];
        }
        
        return $studies;
    }
    
    // Share study with users
    public function shareStudy($userIds) {
        $successful = 0;
        $errors = [];
        
        foreach ($userIds as $userId) {
            $query = "INSERT INTO chess_study_shares (study_id, user_id, shared_at)
                      VALUES (?, ?, NOW())
                      ON DUPLICATE KEY UPDATE shared_at = NOW()";
                      
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(1, $this->id);
            $stmt->bindParam(2, $userId);
            
            if ($stmt->execute()) {
                $successful++;
            } else {
                $errors[] = "Failed to share with user ID: $userId";
            }
        }
        
        return [
            'successful' => $successful,
            'errors' => $errors
        ];
    }
    
    // Check if user has access to a study
    public function userHasAccess($userId) {
        // If user is the owner, they have access
        if ($this->owner_id == $userId) {
            return true;
        }
        
        // If study is public, everyone has access
        if ($this->is_public) {
            return true;
        }
        
        // Check if study is shared with user
        $query = "SELECT 1 FROM chess_study_shares
                  WHERE study_id = ? AND user_id = ?";
                  
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->bindParam(2, $userId);
        $stmt->execute();
        
        return $stmt->rowCount() > 0;
    }
      // Get study by ID with access check
    public function getById($studyId, $userId) {
        $query = "SELECT s.*, u.full_name as owner_name 
                  FROM " . $this->table_name . " s
                  JOIN users u ON s.owner_id = u.id
                  WHERE s.id = ? AND (
                      s.owner_id = ? OR 
                      s.is_public = 1 OR 
                      EXISTS (
                          SELECT 1 FROM chess_study_shares css 
                          WHERE css.study_id = s.id AND css.user_id = ?
                      )
                  )";
                  
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $studyId);
        $stmt->bindParam(2, $userId);
        $stmt->bindParam(3, $userId);
        $stmt->execute();
        
        return $stmt;
    }
    
    // Delete a study
    public function delete() {
        // First delete all shares
        $query = "DELETE FROM chess_study_shares WHERE study_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->execute();
        
        // Then delete the study
        $query = "DELETE FROM " . $this->table_name . " 
                  WHERE id = ? AND owner_id = ?";
                  
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->bindParam(2, $this->owner_id);
        
        return $stmt->execute();
    }
}
?>
