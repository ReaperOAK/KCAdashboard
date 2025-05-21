<?php
class ChessStats {
    // Database connection and table name
    private $conn;
    private $table_name = "chess_player_stats";
    
    // Object properties
    public $user_id;
    public $games_played;
    public $games_won;
    public $games_lost;
    public $games_drawn;
    public $rating;
    public $last_updated;
    
    // Constructor with database connection
    public function __construct($db) {
        $this->conn = $db;
    }
    
    // Get player stats from database
    public function read() {
        $query = "SELECT * FROM " . $this->table_name . " WHERE user_id = ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->user_id);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            $this->games_played = $row['games_played'];
            $this->games_won = $row['games_won'];
            $this->games_lost = $row['games_lost'];
            $this->games_drawn = $row['games_drawn'];
            $this->rating = $row['rating'];
            $this->last_updated = $row['last_updated'];
            
            return true;
        }
        
        // If no record exists, initialize with default values
        $this->games_played = 0;
        $this->games_won = 0;
        $this->games_lost = 0;
        $this->games_drawn = 0;
        $this->rating = 1200;
        
        return false;
    }
    
    // Create or update player stats
    public function save() {
        // Check if record exists
        $query = "SELECT user_id FROM " . $this->table_name . " WHERE user_id = ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->user_id);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            // Update existing record
            $query = "UPDATE " . $this->table_name . "
                      SET games_played = ?, games_won = ?, games_lost = ?, 
                          games_drawn = ?, rating = ?, last_updated = NOW()
                      WHERE user_id = ?";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(1, $this->games_played);
            $stmt->bindParam(2, $this->games_won);
            $stmt->bindParam(3, $this->games_lost);
            $stmt->bindParam(4, $this->games_drawn);
            $stmt->bindParam(5, $this->rating);
            $stmt->bindParam(6, $this->user_id);
            
            return $stmt->execute();
        } else {
            // Create new record
            $query = "INSERT INTO " . $this->table_name . "
                      (user_id, games_played, games_won, games_lost, games_drawn, rating)
                      VALUES (?, ?, ?, ?, ?, ?)";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(1, $this->user_id);
            $stmt->bindParam(2, $this->games_played);
            $stmt->bindParam(3, $this->games_won);
            $stmt->bindParam(4, $this->games_lost);
            $stmt->bindParam(5, $this->games_drawn);
            $stmt->bindParam(6, $this->rating);
            
            return $stmt->execute();
        }
    }
    
    // Update player rating based on game result
    public function updateFromGameResult($result, $opponentRating) {
        // Read current stats
        $this->read();
        
        // Update game counts
        $this->games_played++;
        
        if ($result === 'win') {
            $this->games_won++;
            $score = 1.0;
        } else if ($result === 'loss') {
            $this->games_lost++;
            $score = 0.0;
        } else if ($result === 'draw') {
            $this->games_drawn++;
            $score = 0.5;
        } else {
            return false; // Invalid result
        }
        
        // Calculate K-factor based on player's experience
        $kFactor = $this->getKFactor();
        
        // Calculate expected score
        $expectedScore = 1 / (1 + pow(10, ($opponentRating - $this->rating) / 400));
        
        // Calculate new rating
        $this->rating = round($this->rating + $kFactor * ($score - $expectedScore));
        
        // Minimum rating is 100
        $this->rating = max(100, $this->rating);
        
        // Save changes
        return $this->save();
    }
    
    // Determine K-factor based on player's rating and experience
    private function getKFactor() {
        if ($this->games_played < 30) {
            return 40; // New player
        } else if ($this->rating >= 2400) {
            return 10; // High-rated player
        } else {
            return 20; // Established player
        }
    }
    
    // Get player stats with additional information
    public function getStatsWithDetails() {
        // Make sure we have the latest stats
        $this->read();
        
        // Calculate win rate
        $winRate = $this->games_played > 0 ? 
                  round(($this->games_won / $this->games_played) * 100, 1) : 0;
        
        // Get player rank
        $query = "SELECT COUNT(*) as rank FROM " . $this->table_name . " 
                  WHERE rating > ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->rating);
        $stmt->execute();
        $rank = $stmt->fetch(PDO::FETCH_ASSOC)['rank'] + 1; // 1-based ranking
        
        // Get total number of players
        $query = "SELECT COUNT(*) as total FROM " . $this->table_name;
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $totalPlayers = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        // Return comprehensive stats
        return [
            'user_id' => $this->user_id,
            'rating' => intval($this->rating),
            'games_played' => intval($this->games_played),
            'games_won' => intval($this->games_won),
            'games_lost' => intval($this->games_lost),
            'games_drawn' => intval($this->games_drawn),
            'win_rate' => $winRate,
            'rank' => $rank,
            'total_players' => $totalPlayers
        ];
    }
    
    // Get recent games
    public function getRecentGames($limit = 5) {
        $query = "SELECT g.*, 
                  CASE WHEN g.white_player_id = ? THEN 'white' ELSE 'black' END as player_color,
                  CASE WHEN g.white_player_id = ? THEN u_black.full_name ELSE u_white.full_name END as opponent_name,
                  CASE WHEN g.white_player_id = ? THEN g.black_player_id ELSE g.white_player_id END as opponent_id
                  FROM chess_games g
                  JOIN users u_white ON g.white_player_id = u_white.id
                  JOIN users u_black ON g.black_player_id = u_black.id
                  WHERE g.white_player_id = ? OR g.black_player_id = ?
                  ORDER BY g.last_move_at DESC
                  LIMIT ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->user_id);
        $stmt->bindParam(2, $this->user_id);
        $stmt->bindParam(3, $this->user_id);
        $stmt->bindParam(4, $this->user_id);
        $stmt->bindParam(5, $this->user_id);
        $stmt->bindParam(6, $limit, PDO::PARAM_INT);
        $stmt->execute();
        
        $games = [];
        
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            // Determine personal result for this player
            $result = null;
            
            if ($row['status'] === 'completed' && $row['result']) {
                if ($row['result'] === '1-0') {
                    $result = $row['player_color'] === 'white' ? 'win' : 'loss';
                } else if ($row['result'] === '0-1') {
                    $result = $row['player_color'] === 'black' ? 'win' : 'loss';
                } else if ($row['result'] === '1/2-1/2') {
                    $result = 'draw';
                }
            }
            
            $games[] = [
                'id' => $row['id'],
                'player_color' => $row['player_color'],
                'opponent_name' => $row['opponent_name'],
                'opponent_id' => $row['opponent_id'],
                'status' => $row['status'],
                'result' => $result,
                'time_control' => $row['time_control'],
                'last_move_at' => $row['last_move_at']
            ];
        }
        
        return $games;
    }
}
?>
