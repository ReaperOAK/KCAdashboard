<?php
class Resource {
    private $conn;
    private $table_name = "resources";

    public $id;
    public $title;
    public $description;
    public $type;
    public $url;
    public $category;
    public $created_by;
    public $created_at;
    public $file_size;
    public $downloads;
    public $thumbnail_url;
    public $is_featured;
    public $tags;
    public $difficulty;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAll() {
        $query = "SELECT r.*, u.full_name as author_name 
                 FROM " . $this->table_name . " r
                 JOIN users u ON r.created_by = u.id
                 ORDER BY r.created_at DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getByCategory($category) {
        $query = "SELECT r.*, u.full_name as author_name 
                 FROM " . $this->table_name . " r
                 JOIN users u ON r.created_by = u.id
                 WHERE r.category = :category
                 ORDER BY r.created_at DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":category", $category);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function logAccess($user_id, $resource_id) {
        $query = "INSERT INTO resource_access (resource_id, user_id)
                 VALUES (:resource_id, :user_id)
                 ON DUPLICATE KEY UPDATE last_accessed = CURRENT_TIMESTAMP";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":resource_id", $resource_id);
        $stmt->bindParam(":user_id", $user_id);
        return $stmt->execute();
    }

    public function search($term, $filters = []) {
        $query = "SELECT r.*, u.full_name as author_name 
                 FROM " . $this->table_name . " r
                 JOIN users u ON r.created_by = u.id
                 WHERE (r.title LIKE :term OR r.description LIKE :term OR r.tags LIKE :term)";
        
        // Add category filter if specified
        if (!empty($filters['category'])) {
            $query .= " AND r.category = :category";
        }
        
        // Add type filter if specified
        if (!empty($filters['type'])) {
            $query .= " AND r.type = :type";
        }
        
        // Add difficulty filter if specified
        if (!empty($filters['difficulty'])) {
            $query .= " AND r.difficulty = :difficulty";
        }
        
        $query .= " ORDER BY r.created_at DESC";
        
        // Prepare and execute
        $stmt = $this->conn->prepare($query);
        
        $searchTerm = "%" . $term . "%";
        $stmt->bindParam(":term", $searchTerm);
        
        if (!empty($filters['category'])) {
            $stmt->bindParam(":category", $filters['category']);
        }
        
        if (!empty($filters['type'])) {
            $stmt->bindParam(":type", $filters['type']);
        }
        
        if (!empty($filters['difficulty'])) {
            $stmt->bindParam(":difficulty", $filters['difficulty']);
        }
        
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getFeatured() {
        $query = "SELECT r.*, u.full_name as author_name 
                 FROM " . $this->table_name . " r
                 JOIN users u ON r.created_by = u.id
                 WHERE r.is_featured = 1
                 ORDER BY r.created_at DESC
                 LIMIT 5";
                 
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create($data) {
        $query = "INSERT INTO " . $this->table_name . " 
                 (title, description, type, url, category, created_by, file_size, 
                 thumbnail_url, tags, difficulty) 
                 VALUES 
                 (:title, :description, :type, :url, :category, :created_by, :file_size, 
                 :thumbnail_url, :tags, :difficulty)";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize inputs
        $this->title = htmlspecialchars(strip_tags($data['title']));
        $this->description = htmlspecialchars(strip_tags($data['description']));
        $this->type = $data['type'];
        $this->url = $data['url'];
        $this->category = $data['category'];
        $this->created_by = $data['created_by'];
        $this->file_size = $data['file_size'] ?? null;
        $this->thumbnail_url = $data['thumbnail_url'] ?? null;
        $this->tags = $data['tags'] ?? null;
        $this->difficulty = $data['difficulty'] ?? 'beginner';
        
        // Bind parameters
        $stmt->bindParam(":title", $this->title);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":type", $this->type);
        $stmt->bindParam(":url", $this->url);
        $stmt->bindParam(":category", $this->category);
        $stmt->bindParam(":created_by", $this->created_by);
        $stmt->bindParam(":file_size", $this->file_size);
        $stmt->bindParam(":thumbnail_url", $this->thumbnail_url);
        $stmt->bindParam(":tags", $this->tags);
        $stmt->bindParam(":difficulty", $this->difficulty);
        
        if ($stmt->execute()) {
            return $this->conn->lastInsertId();
        }
        
        return false;
    }

    public function getResourceById($id) {
        $query = "SELECT r.*, u.full_name as author_name 
                 FROM " . $this->table_name . " r
                 JOIN users u ON r.created_by = u.id
                 WHERE r.id = :id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function incrementDownloads($id) {
        $query = "UPDATE " . $this->table_name . " 
                 SET downloads = downloads + 1 
                 WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        return $stmt->execute();
    }

    public function bookmark($user_id, $resource_id) {
        $query = "INSERT IGNORE INTO resource_bookmarks 
                 (user_id, resource_id) 
                 VALUES (:user_id, :resource_id)";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $user_id);
        $stmt->bindParam(":resource_id", $resource_id);
        return $stmt->execute();
    }

    public function unbookmark($user_id, $resource_id) {
        $query = "DELETE FROM resource_bookmarks 
                 WHERE user_id = :user_id AND resource_id = :resource_id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $user_id);
        $stmt->bindParam(":resource_id", $resource_id);
        return $stmt->execute();
    }

    public function getUserBookmarks($user_id) {
        $query = "SELECT r.*, u.full_name as author_name 
                 FROM " . $this->table_name . " r
                 JOIN users u ON r.created_by = u.id
                 JOIN resource_bookmarks b ON r.id = b.resource_id
                 WHERE b.user_id = :user_id
                 ORDER BY b.created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $user_id);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function isBookmarked($user_id, $resource_id) {
        $query = "SELECT COUNT(*) as count 
                 FROM resource_bookmarks 
                 WHERE user_id = :user_id AND resource_id = :resource_id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $user_id);
        $stmt->bindParam(":resource_id", $resource_id);
        $stmt->execute();
        
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result['count'] > 0;
    }
}
?>
