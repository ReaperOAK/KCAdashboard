<?php
class Game {
    private $conn;
    private $table_name = "games";
    
    public $id;
    public $user_id;
    public $opponent;
    public $date;
    public $result;
    public $time_control;
    public $moves;
    public $pgn;
    public $lichess_id;
    
    public function __construct($db) {
        $this->conn = $db;
        
        // Create table if it doesn't exist
        $this->createTableIfNotExists();
    }
    
    private function createTableIfNotExists() {
        $query = "CREATE TABLE IF NOT EXISTS " . $this->table_name . " (
            id INT PRIMARY KEY AUTO_INCREMENT,
            user_id INT NOT NULL,
            opponent VARCHAR(255) NOT NULL,
            date DATE NOT NULL,
            result ENUM('win', 'loss', 'draw', 'ongoing') NOT NULL DEFAULT 'ongoing',
            time_control VARCHAR(50),
            moves INT,
            pgn TEXT,
            lichess_id VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )";
        
        $this->conn->exec($query);
        
        // Also create the saved_positions table if it doesn't exist
        $query = "CREATE TABLE IF NOT EXISTS saved_positions (
            id INT PRIMARY KEY AUTO_INCREMENT,
            user_id INT NOT NULL,
            name VARCHAR(255) NOT NULL,
            fen VARCHAR(512) NOT NULL,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )";
        
        $this->conn->exec($query);
    }
    
    public function getRecentGames($userId, $limit = 10) {
        try {
            $query = "SELECT 
                        id, 
                        opponent, 
                        date, 
                        result, 
                        time_control, 
                        moves,
                        pgn,
                        lichess_id
                    FROM 
                        " . $this->table_name . "
                    WHERE 
                        user_id = :user_id
                    ORDER BY 
                        date DESC
                    LIMIT :limit";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':user_id', $userId);
            $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
            
        } catch (PDOException $e) {
            return [];
        }
    }
    
    // Method to save a game from Lichess API
    public function saveFromLichess($userId, $gameData) {
        try {
            $query = "INSERT INTO " . $this->table_name . "
                    (user_id, opponent, date, result, time_control, moves, pgn, lichess_id)
                    VALUES
                    (:user_id, :opponent, :date, :result, :time_control, :moves, :pgn, :lichess_id)";
            
            $stmt = $this->conn->prepare($query);
            
            $stmt->bindParam(':user_id', $userId);
            $stmt->bindParam(':opponent', $gameData['opponent']);
            $stmt->bindParam(':date', $gameData['date']);
            $stmt->bindParam(':result', $gameData['result']);
            $stmt->bindParam(':time_control', $gameData['time_control']);
            $stmt->bindParam(':moves', $gameData['moves']);
            $stmt->bindParam(':pgn', $gameData['pgn']);
            $stmt->bindParam(':lichess_id', $gameData['lichess_id']);
            
            if ($stmt->execute()) {
                return $this->conn->lastInsertId();
            }
            
            return false;
            
        } catch (PDOException $e) {
            return false;
        }
    }
    
    // Method to fetch games directly from Lichess API using cURL
    public function fetchFromLichess($username, $token = null, $max = 10) {
        $curl = curl_init();
        $url = "https://lichess.org/api/games/user/$username?max=$max&ongoing=true";
        
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        
        // Set accept header to get JSON response
        $headers = ["Accept: application/x-ndjson"];
        
        // Add authorization if token is provided
        if ($token) {
            $headers[] = "Authorization: Bearer $token";
        }
        
        curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
        
        $response = curl_exec($curl);
        $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        curl_close($curl);
        
        if ($httpCode === 200) {
            // Process and return the response
            // Note: Lichess returns ndjson, which requires line-by-line processing
            $games = [];
            $lines = explode("\n", $response);
            
            foreach ($lines as $line) {
                if (!empty($line)) {
                    $game = json_decode($line, true);
                    if ($game) {
                        $games[] = $game;
                    }
                }
            }
            
            return $games;
        }
        
        return [];
    }
    
    public function getSavedPositions($userId, $limit = 10) {
        try {
            $query = "SELECT 
                        id, 
                        name, 
                        fen, 
                        notes, 
                        created_at
                    FROM 
                        saved_positions
                    WHERE 
                        user_id = :user_id
                    ORDER BY 
                        created_at DESC
                    LIMIT :limit";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':user_id', $userId);
            $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
            
        } catch (PDOException $e) {
            return [];
        }
    }
    
    public function savePosition($userId, $positionData) {
        try {
            $query = "INSERT INTO saved_positions
                    (user_id, name, fen, notes)
                    VALUES
                    (:user_id, :name, :fen, :notes)";
            
            $stmt = $this->conn->prepare($query);
            
            $stmt->bindParam(':user_id', $userId);
            $stmt->bindParam(':name', $positionData['name']);
            $stmt->bindParam(':fen', $positionData['fen']);
            $stmt->bindParam(':notes', $positionData['notes']);
            
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
