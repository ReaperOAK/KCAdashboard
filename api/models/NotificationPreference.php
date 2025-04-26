<?php
class NotificationPreference {
    private $conn;
    private $table_name = "notification_preferences";

    public $id;
    public $user_id;
    public $category;
    public $in_app;
    public $email;
    public $created_at;
    public $updated_at;

    public function __construct($db) {
        $this->conn = $db;
    }
    
    // Create preference or update if exists
    public function updatePreference() {
        // Check if preference exists
        if ($this->preferenceExists()) {
            return $this->update();
        } else {
            return $this->create();
        }
    }
    
    // Create new preference
    private function create() {
        $query = "INSERT INTO " . $this->table_name . "
                 (user_id, category, in_app, email)
                 VALUES (:user_id, :category, :in_app, :email)";
                 
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(":user_id", $this->user_id);
        $stmt->bindParam(":category", $this->category);
        $stmt->bindParam(":in_app", $this->in_app, PDO::PARAM_BOOL);
        $stmt->bindParam(":email", $this->email, PDO::PARAM_BOOL);
        
        return $stmt->execute();
    }
    
    // Update existing preference
    private function update() {
        $query = "UPDATE " . $this->table_name . "
                 SET in_app = :in_app, email = :email, updated_at = NOW()
                 WHERE user_id = :user_id AND category = :category";
                 
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(":user_id", $this->user_id);
        $stmt->bindParam(":category", $this->category);
        $stmt->bindParam(":in_app", $this->in_app, PDO::PARAM_BOOL);
        $stmt->bindParam(":email", $this->email, PDO::PARAM_BOOL);
        
        return $stmt->execute();
    }
    
    // Check if preference exists
    private function preferenceExists() {
        $query = "SELECT id FROM " . $this->table_name . "
                 WHERE user_id = :user_id AND category = :category";
                 
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(":user_id", $this->user_id);
        $stmt->bindParam(":category", $this->category);
        
        $stmt->execute();
        
        return $stmt->rowCount() > 0;
    }
    
    // Get user's preferences for all categories
    public function getUserPreferences($user_id) {
        $query = "SELECT * FROM " . $this->table_name . "
                 WHERE user_id = :user_id";
                 
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $user_id);
        $stmt->execute();
        
        $preferences = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // If no preferences set, return default preferences
        if (empty($preferences)) {
            return $this->getDefaultPreferences();
        }
        
        return $preferences;
    }
    
    // Get default preferences (used when user hasn't set any)
    public function getDefaultPreferences() {
        $categories = [
            'general', 'class', 'tournament', 'assignment', 
            'attendance', 'announcement', 'achievement'
        ];
        
        $defaults = [];
        
        foreach ($categories as $category) {
            $defaults[] = [
                'user_id' => $this->user_id,
                'category' => $category,
                'in_app' => true,
                'email' => true,
                'is_default' => true
            ];
        }
        
        return $defaults;
    }
    
    // Check if user should receive notification of specific category
    public function shouldReceiveNotification($user_id, $category, $channel = 'in_app') {
        $query = "SELECT " . $channel . " FROM " . $this->table_name . "
                 WHERE user_id = :user_id AND category = :category";
                 
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(":user_id", $user_id);
        $stmt->bindParam(":category", $category);
        
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return (bool)$result[$channel];
        }
        
        // If no preference set, return true (default behavior)
        return true;
    }
    
    // Create or update multiple preferences in bulk
    public function updateBulkPreferences($user_id, $preferences) {
        try {
            $this->conn->beginTransaction();
            
            $success = true;
            
            foreach ($preferences as $pref) {
                $this->user_id = $user_id;
                $this->category = $pref['category'];
                $this->in_app = $pref['in_app'];
                $this->email = $pref['email'];
                
                if (!$this->updatePreference()) {
                    $success = false;
                    break;
                }
            }
            
            if ($success) {
                $this->conn->commit();
                return true;
            } else {
                $this->conn->rollBack();
                return false;
            }
            
        } catch (Exception $e) {
            $this->conn->rollBack();
            throw $e;
        }
    }
}
?>
