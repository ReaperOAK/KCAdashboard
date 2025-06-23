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
    }    public function getAll() {
        $query = "SELECT r.*, u.full_name as author_name 
                 FROM " . $this->table_name . " r
                 JOIN users u ON r.created_by = u.id
                 ORDER BY r.created_at DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getStudentAccessibleResources($student_id) {
        $query = "SELECT DISTINCT r.*, u.full_name as author_name 
                 FROM " . $this->table_name . " r
                 JOIN users u ON r.created_by = u.id
                 WHERE r.is_public = 1
                 
                 UNION
                 
                 SELECT DISTINCT r.*, u.full_name as author_name 
                 FROM " . $this->table_name . " r
                 JOIN users u ON r.created_by = u.id
                 JOIN student_resource_shares srs ON r.id = srs.resource_id
                 WHERE srs.student_id = :student_id1
                 
                 UNION
                 
                 SELECT DISTINCT r.*, u.full_name as author_name 
                 FROM " . $this->table_name . " r
                 JOIN users u ON r.created_by = u.id
                 JOIN classroom_resources cr ON r.id = cr.resource_id
                 JOIN classroom_students cs ON cr.classroom_id = cs.classroom_id
                 WHERE cs.student_id = :student_id2
                 
                 UNION
                 
                 SELECT DISTINCT r.*, u.full_name as author_name 
                 FROM " . $this->table_name . " r
                 JOIN users u ON r.created_by = u.id
                 JOIN batch_resources br ON r.id = br.resource_id
                 JOIN batch_students bs ON br.batch_id = bs.batch_id
                 WHERE bs.student_id = :student_id3
                 
                 ORDER BY created_at DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":student_id1", $student_id);
        $stmt->bindParam(":student_id2", $student_id);
        $stmt->bindParam(":student_id3", $student_id);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }    public function getByCategory($category) {
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

    public function getStudentAccessibleResourcesByCategory($student_id, $category) {
        $query = "SELECT DISTINCT r.*, u.full_name as author_name 
                 FROM " . $this->table_name . " r
                 JOIN users u ON r.created_by = u.id
                 WHERE r.category = :category AND r.is_public = 1
                 
                 UNION
                 
                 SELECT DISTINCT r.*, u.full_name as author_name 
                 FROM " . $this->table_name . " r
                 JOIN users u ON r.created_by = u.id
                 JOIN student_resource_shares srs ON r.id = srs.resource_id
                 WHERE srs.student_id = :student_id1 AND r.category = :category1
                 
                 UNION
                 
                 SELECT DISTINCT r.*, u.full_name as author_name 
                 FROM " . $this->table_name . " r
                 JOIN users u ON r.created_by = u.id
                 JOIN classroom_resources cr ON r.id = cr.resource_id
                 JOIN classroom_students cs ON cr.classroom_id = cs.classroom_id
                 WHERE cs.student_id = :student_id2 AND r.category = :category2
                 
                 UNION
                 
                 SELECT DISTINCT r.*, u.full_name as author_name 
                 FROM " . $this->table_name . " r
                 JOIN users u ON r.created_by = u.id
                 JOIN batch_resources br ON r.id = br.resource_id
                 JOIN batch_students bs ON br.batch_id = bs.batch_id
                 WHERE bs.student_id = :student_id3 AND r.category = :category3
                 
                 ORDER BY created_at DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":category", $category);
        $stmt->bindParam(":student_id1", $student_id);
        $stmt->bindParam(":category1", $category);
        $stmt->bindParam(":student_id2", $student_id);
        $stmt->bindParam(":category2", $category);
        $stmt->bindParam(":student_id3", $student_id);
        $stmt->bindParam(":category3", $category);
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
    }    public function search($term, $filters = []) {
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

    public function searchStudentAccessibleResources($student_id, $term, $filters = []) {
        $baseQuery = "SELECT DISTINCT r.*, u.full_name as author_name 
                     FROM " . $this->table_name . " r
                     JOIN users u ON r.created_by = u.id
                     WHERE (r.title LIKE :term OR r.description LIKE :term OR r.tags LIKE :term)";
        
        // Add filters
        $filterClause = "";
        if (!empty($filters['category'])) {
            $filterClause .= " AND r.category = :category";
        }
        if (!empty($filters['type'])) {
            $filterClause .= " AND r.type = :type";
        }
        if (!empty($filters['difficulty'])) {
            $filterClause .= " AND r.difficulty = :difficulty";
        }
        
        $query = "(" . $baseQuery . " AND r.is_public = 1" . $filterClause . ")
                 
                 UNION
                 
                 (" . $baseQuery . $filterClause . "
                 AND r.id IN (SELECT resource_id FROM student_resource_shares WHERE student_id = :student_id1))
                 
                 UNION
                 
                 (" . $baseQuery . $filterClause . "
                 AND r.id IN (
                     SELECT cr.resource_id FROM classroom_resources cr
                     JOIN classroom_students cs ON cr.classroom_id = cs.classroom_id
                     WHERE cs.student_id = :student_id2
                 ))
                 
                 UNION
                 
                 (" . $baseQuery . $filterClause . "
                 AND r.id IN (
                     SELECT br.resource_id FROM batch_resources br
                     JOIN batch_students bs ON br.batch_id = bs.batch_id
                     WHERE bs.student_id = :student_id3
                 ))
                 
                 ORDER BY created_at DESC";

        $stmt = $this->conn->prepare($query);
        
        $searchTerm = "%" . $term . "%";
        $stmt->bindParam(":term", $searchTerm);
        $stmt->bindParam(":student_id1", $student_id);
        $stmt->bindParam(":student_id2", $student_id);
        $stmt->bindParam(":student_id3", $student_id);
        
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
    }    public function getFeatured() {
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

    public function getStudentAccessibleFeatured($student_id) {
        $query = "SELECT DISTINCT r.*, u.full_name as author_name 
                 FROM " . $this->table_name . " r
                 JOIN users u ON r.created_by = u.id
                 WHERE r.is_featured = 1 AND (
                     r.is_public = 1
                     OR r.id IN (SELECT resource_id FROM student_resource_shares WHERE student_id = :student_id1)
                     OR r.id IN (
                         SELECT cr.resource_id FROM classroom_resources cr
                         JOIN classroom_students cs ON cr.classroom_id = cs.classroom_id
                         WHERE cs.student_id = :student_id2
                     )
                     OR r.id IN (
                         SELECT br.resource_id FROM batch_resources br
                         JOIN batch_students bs ON br.batch_id = bs.batch_id
                         WHERE bs.student_id = :student_id3
                     )
                 )
                 ORDER BY r.created_at DESC
                 LIMIT 5";
                 
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":student_id1", $student_id);
        $stmt->bindParam(":student_id2", $student_id);
        $stmt->bindParam(":student_id3", $student_id);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }public function create($data) {
        $query = "INSERT INTO " . $this->table_name . " 
                 (title, description, type, url, category, created_by, file_size, 
                 thumbnail_url, tags, difficulty, is_public) 
                 VALUES 
                 (:title, :description, :type, :url, :category, :created_by, :file_size, 
                 :thumbnail_url, :tags, :difficulty, :is_public)";
        
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
        $is_public = $data['is_public'] ?? false;
        
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
        $stmt->bindParam(":is_public", $is_public, PDO::PARAM_BOOL);
        
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

    public function getResourcesSharedWithClassroom($classroom_id) {
        $query = "SELECT r.*, u.full_name as author_name, cr.shared_at 
                 FROM " . $this->table_name . " r
                 JOIN users u ON r.created_by = u.id
                 JOIN classroom_resources cr ON r.id = cr.resource_id
                 WHERE cr.classroom_id = :classroom_id
                 ORDER BY cr.shared_at DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":classroom_id", $classroom_id);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getResourcesSharedWithBatch($batch_id) {
        $query = "SELECT r.*, u.full_name as author_name, br.shared_at 
                 FROM " . $this->table_name . " r
                 JOIN users u ON r.created_by = u.id
                 JOIN batch_resources br ON r.id = br.resource_id
                 WHERE br.batch_id = :batch_id
                 ORDER BY br.shared_at DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":batch_id", $batch_id);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getResourcesSharedWithStudent($student_id) {
        $query = "SELECT r.*, u.full_name as author_name, srs.shared_at 
                 FROM " . $this->table_name . " r
                 JOIN users u ON r.created_by = u.id
                 JOIN student_resource_shares srs ON r.id = srs.resource_id
                 WHERE srs.student_id = :student_id
                 ORDER BY srs.shared_at DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":student_id", $student_id);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function removeResourceFromClassroom($classroom_id, $resource_id) {
        $query = "DELETE FROM classroom_resources 
                 WHERE classroom_id = :classroom_id AND resource_id = :resource_id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":classroom_id", $classroom_id);
        $stmt->bindParam(":resource_id", $resource_id);
        return $stmt->execute();
    }

    public function removeResourceFromBatch($batch_id, $resource_id) {
        $query = "DELETE FROM batch_resources 
                 WHERE batch_id = :batch_id AND resource_id = :resource_id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":batch_id", $batch_id);
        $stmt->bindParam(":resource_id", $resource_id);
        return $stmt->execute();
    }

    public function removeResourceFromStudent($student_id, $resource_id) {
        $query = "DELETE FROM student_resource_shares 
                 WHERE student_id = :student_id AND resource_id = :resource_id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":student_id", $student_id);
        $stmt->bindParam(":resource_id", $resource_id);
        return $stmt->execute();
    }
}
?>
