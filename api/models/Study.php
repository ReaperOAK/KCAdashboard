<?php
class Study {
    private $conn;
    private $table_name = "studies";
    
    public $id;
    public $title;
    public $description;
    public $category;
    public $chapters;
    public $author;
    public $created_at;
    public $lichess_id;
    public $thumbnail;
    
    public function __construct($db) {
        $this->conn = $db;
        
        // Create table if it doesn't exist
        $this->createTableIfNotExists();
    }
    
    private function createTableIfNotExists() {
        $query = "CREATE TABLE IF NOT EXISTS " . $this->table_name . " (
            id INT PRIMARY KEY AUTO_INCREMENT,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            category VARCHAR(50) NOT NULL,
            chapters INT DEFAULT 1,
            author VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            lichess_id VARCHAR(255),
            thumbnail VARCHAR(255),
            user_id INT,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )";
        
        $this->conn->exec($query);
    }
    
    public function getStudies($category, $userId) {
        try {
            $whereClause = $category !== 'all' ? "AND category = :category" : "";
            
            $query = "SELECT 
                        id, 
                        title, 
                        description, 
                        category, 
                        chapters, 
                        author, 
                        created_at,
                        lichess_id,
                        thumbnail
                    FROM 
                        " . $this->table_name . "
                    WHERE 
                        (user_id = :user_id OR user_id IS NULL)
                        $whereClause
                    ORDER BY 
                        created_at DESC";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':user_id', $userId);
            
            if ($category !== 'all') {
                $stmt->bindParam(':category', $category);
            }
            
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
            
        } catch (PDOException $e) {
            return [];
        }
    }
    
    // Method to integrate with Lichess API using cURL
    public function fetchFromLichess($username, $token = null) {
        $curl = curl_init();
        $url = "https://lichess.org/api/study/by/$username";
        
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        
        // Add authorization if token is provided
        if ($token) {
            curl_setopt($curl, CURLOPT_HTTPHEADER, [
                "Authorization: Bearer $token"
            ]);
        }
        
        $response = curl_exec($curl);
        $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        curl_close($curl);
        
        if ($httpCode === 200) {
            // Process and return the response
            // Note: Lichess returns ndjson, which requires line-by-line processing
            $studies = [];
            $lines = explode("\n", $response);
            
            foreach ($lines as $line) {
                if (!empty($line)) {
                    $study = json_decode($line, true);
                    if ($study) {
                        $studies[] = $study;
                    }
                }
            }
            
            return $studies;
        }
        
        return [];
    }
    
    public function create($data) {
        try {
            $query = "INSERT INTO " . $this->table_name . "
                    (title, description, category, chapters, author, lichess_id, thumbnail, user_id)
                    VALUES
                    (:title, :description, :category, :chapters, :author, :lichess_id, :thumbnail, :user_id)";
            
            $stmt = $this->conn->prepare($query);
            
            $stmt->bindParam(':title', $data['title']);
            $stmt->bindParam(':description', $data['description']);
            $stmt->bindParam(':category', $data['category']);
            $stmt->bindParam(':chapters', $data['chapters']);
            $stmt->bindParam(':author', $data['author']);
            $stmt->bindParam(':lichess_id', $data['lichess_id']);
            $stmt->bindParam(':thumbnail', $data['thumbnail']);
            $stmt->bindParam(':user_id', $data['user_id']);
            
            if ($stmt->execute()) {
                return $this->conn->lastInsertId();
            }
            
            return false;
            
        } catch (PDOException $e) {
            return false;
        }
    }
}
?>
